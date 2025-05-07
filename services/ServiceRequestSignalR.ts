import * as signalR from "@microsoft/signalr";
import Constants from "expo-constants";
const BACKEND_API_URL = Constants.expoConfig?.extra?.IMAGE_API_URL ?? "default_value";

type EventHandler = (data: any) => void;

export type EventTypes = "NewRequestCreated" | "RequestStatusUpdated" | "YourRequestStatusUpdated" | "RequestCancelled" | "ProviderRequestCancelled";

class ServiceRequestSignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnected = false;
  private categoryId: string | null = null;
  private customerId: string | null = null;
  private providerId: string | null = null;

  private eventHandlers: Record<EventTypes, EventHandler[]> = {
    NewRequestCreated: [],
    RequestStatusUpdated: [],
    YourRequestStatusUpdated: [],
    RequestCancelled: [],
    ProviderRequestCancelled: [],
  };

  async connect(): Promise<boolean> {
    if (this.isConnected && this.connection?.state === signalR.HubConnectionState.Connected) {
      return true;
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${BACKEND_API_URL}/requestHub`, {
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 0s, 2s, 5s, 10s
            const delays = [0, 2000, 5000, 10000];
            return delays[retryContext.previousRetryCount] ?? 10000;
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.serverTimeoutInMilliseconds = 60000; // Wait for 60 seconds
      this.connection.keepAliveIntervalInMilliseconds = 10000; // Send ping every 15s

      // Event handlers
      Object.keys(this.eventHandlers).forEach((eventName) => {
        this.connection!.on(eventName, (data) => {
          this.trigger(eventName as EventTypes, data);
        });
      });

      this.connection.onreconnecting((error) => {
        console.warn("Reconnecting due to error:", error);
      });

      this.connection.onreconnected(() => {
        console.log("SignalR reconnected");
        this.isConnected = true;
        this.rejoinGroups();
      });

      this.connection.onclose((error) => {
        console.error("SignalR disconnected:", error);
        this.isConnected = false;
      });

      await this.connection.start();
      this.isConnected = true;
      console.log("SignalR connected");
      await this.rejoinGroups();
      return true;
    } catch (err) {
      console.error("SignalR connection failed:", err);
      this.isConnected = false;
      return false;
    }
  }

  private async rejoinGroups() {
    try {
      if (this.categoryId) await this.subscribeToCategoryRequests(this.categoryId);
      if (this.customerId) await this.joinCustomerGroup(this.customerId);
      if (this.providerId) await this.joinProviderGroup(this.providerId);
    } catch (err) {
      console.error("Failed to rejoin groups:", err);
    }
  }

  async subscribeToCategoryRequests(categoryId: string): Promise<boolean> {
    this.categoryId = categoryId;
    if (!this.isConnected) return false;
    await this.connection!.invoke("JoinCategoryGroup", categoryId);
    return true;
  }

  async unsubscribeFromCategoryRequests(categoryId: string): Promise<boolean> {
    if (!this.isConnected) return false;
    await this.connection!.invoke("LeaveCategoryGroup", categoryId);
    return true;
  }

  async joinProviderGroup(providerId: string): Promise<boolean> {
    this.providerId = providerId;
    if (!this.isConnected) return false;
    await this.connection!.invoke("JoinProviderGroup", providerId);
    return true;
  }

  async joinCustomerGroup(customerId: string): Promise<boolean> {
    this.customerId = customerId;
    if (!this.isConnected) return false;
    await this.connection!.invoke("JoinCustomerGroup", customerId);
    return true;
  }

  on(eventName: EventTypes, callback: EventHandler): void {
    this.eventHandlers[eventName].push(callback);
  }

  off(eventName: EventTypes, callback: EventHandler): void {
    this.eventHandlers[eventName] = this.eventHandlers[eventName].filter((h) => h !== callback);
  }

  private trigger(eventName: EventTypes, data: any) {
    this.eventHandlers[eventName].forEach((handler) => handler(data));
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
    }
    this.isConnected = false;
  }
}

const serviceRequestSignalR = new ServiceRequestSignalRService();
export default serviceRequestSignalR;
