// import * as signalR from "@microsoft/signalr";

// type EventHandler = (data: any) => void;

// export type ServiceOfferEventTypes =
//   | "NewOfferReceived"
//   | "YourOfferAccepted"
//   | "RequestOfferAccepted"
//   | "YourOfferRejected"
//   | "OfferStatusUpdated"
//   | "YourOfferStatusUpdated"
//   | "YourOfferExpired"
//   | "OfferExpired";

// class ServiceOfferSignalRService {
//   private connection: signalR.HubConnection | null = null;
//   private isConnected = false;
//   private providerId: string | null = null;
//   private requestId: string | null = null;
//   private eventHandlers: Record<ServiceOfferEventTypes, EventHandler[]> = {
//     NewOfferReceived: [],
//     YourOfferAccepted: [],
//     RequestOfferAccepted: [],
//     YourOfferRejected: [],
//     OfferStatusUpdated: [],
//     YourOfferStatusUpdated: [],
//     YourOfferExpired: [],
//     OfferExpired: [],
//   };

//   async connect(): Promise<boolean> {
//     if (this.connection?.state === signalR.HubConnectionState.Connected) {
//       return true;
//     }

//     try {
//       this.connection = new signalR.HubConnectionBuilder()
//         .withUrl("http://10.0.2.2:5039/serviceOfferHub")
//         .withAutomaticReconnect()
//         .configureLogging(signalR.LogLevel.Warning)
//         .build();

//       this.connection.serverTimeoutInMilliseconds = 30000;
//       this.connection.keepAliveIntervalInMilliseconds = 15000;

//       // Register backend events
//       Object.keys(this.eventHandlers).forEach((eventName) => {
//         this.connection!.on(eventName, (data) => {
//           this.triggerEvent(eventName as ServiceOfferEventTypes, data);
//         });
//       });

//       this.connection.onreconnected(() => {
//         console.log("ServiceOffer SignalR reconnected");
//         this.rejoinGroups();
//       });

//       this.connection.onclose(() => {
//         console.log("ServiceOffer SignalR disconnected");
//         this.isConnected = false;
//       });

//       await this.connection.start();
//       console.log("ServiceOffer SignalR connected");
//       this.isConnected = true;
//       return true;
//     } catch (error) {
//       console.error("ServiceOffer SignalR connection error:", error);
//       return false;
//     }
//   }

//   private async rejoinGroups() {
//     if (this.providerId) {
//       await this.joinProviderOffersGroup(this.providerId);
//     }
//     if (this.requestId) {
//       await this.joinRequestOffersGroup(this.requestId);
//     }
//   }

//   async joinProviderOffersGroup(providerId: string) {
//     this.providerId = providerId;
//     if (this.isConnected) {
//       await this.connection?.invoke("JoinProviderOffersGroup", providerId);
//     }
//   }

//   async joinRequestOffersGroup(requestId: string) {
//     this.requestId = requestId;
//     if (this.isConnected) {
//       await this.connection?.invoke("JoinRequestOffersGroup", requestId);
//     }
//   }

//   on(eventName: ServiceOfferEventTypes, callback: EventHandler) {
//     this.eventHandlers[eventName].push(callback);
//   }

//   off(eventName: ServiceOfferEventTypes, callback: EventHandler) {
//     this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(
//       (h) => h !== callback
//     );
//   }

//   private triggerEvent(eventName: ServiceOfferEventTypes, data: any) {
//     this.eventHandlers[eventName].forEach((cb) => cb(data));
//   }

//   async disconnect() {
//     await this.connection?.stop();
//     this.isConnected = false;
//   }
// }

// const serviceOfferSignalR = new ServiceOfferSignalRService();
// export default serviceOfferSignalR;
import * as signalR from "@microsoft/signalr";

type EventHandler = (data: any) => void;

export type ServiceOfferEventTypes =
  | "NewOfferReceived"
  | "YourOfferAccepted"
  | "RequestOfferAccepted"
  | "YourOfferRejected"
  | "OfferStatusUpdated"
  | "YourOfferStatusUpdated"
  | "YourOfferExpired"
  | "OfferExpired";

class ServiceOfferSignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnected = false;
  private providerId: string | null = null;
  private requestId: string | null = null;
  private eventHandlers: Record<ServiceOfferEventTypes, EventHandler[]> = {
    NewOfferReceived: [],
    YourOfferAccepted: [],
    RequestOfferAccepted: [],
    YourOfferRejected: [],
    OfferStatusUpdated: [],
    YourOfferStatusUpdated: [],
    YourOfferExpired: [],
    OfferExpired: [],
  };

  async connect(): Promise<boolean> {
    if (
      this.isConnected &&
      this.connection?.state === signalR.HubConnectionState.Connected
    ) {
      return true;
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("http://10.0.2.2:5039/serviceOfferHub", {
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            const delays = [0, 2000, 5000, 10000];
            return delays[retryContext.previousRetryCount] ?? 10000;
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.serverTimeoutInMilliseconds = 60000; // 60s timeout
      this.connection.keepAliveIntervalInMilliseconds = 10000; // 15s ping

      // Register event handlers
      Object.keys(this.eventHandlers).forEach((eventName) => {
        this.connection!.on(eventName, (data) => {
          this.triggerEvent(eventName as ServiceOfferEventTypes, data);
        });
      });

      this.connection.onreconnecting((error) => {
        console.warn("ServiceOffer SignalR reconnecting due to:", error);
      });

      this.connection.onreconnected(() => {
        console.log("ServiceOffer SignalR reconnected");
        this.isConnected = true;
        this.rejoinGroups();
      });

      this.connection.onclose((error) => {
        console.error("ServiceOffer SignalR disconnected:", error);
        this.isConnected = false;
      });

      await this.connection.start();
      console.log("ServiceOffer SignalR connected");
      this.isConnected = true;
      await this.rejoinGroups();
      return true;
    } catch (error) {
      console.error("ServiceOffer SignalR connection error:", error);
      this.isConnected = false;
      return false;
    }
  }

  private async rejoinGroups() {
    try {
      if (this.providerId) await this.joinProviderOffersGroup(this.providerId);
      if (this.requestId) await this.joinRequestOffersGroup(this.requestId);
    } catch (error) {
      console.error("Failed to rejoin ServiceOffer groups:", error);
    }
  }

  async joinProviderOffersGroup(providerId: string) {
    this.providerId = providerId;
    if (this.isConnected) {
      await this.connection!.invoke("JoinProviderOffersGroup", providerId);
    }
  }

  async joinRequestOffersGroup(requestId: string) {
    this.requestId = requestId;
    if (this.isConnected) {
      await this.connection!.invoke("JoinRequestOffersGroup", requestId);
    }
  }

  on(eventName: ServiceOfferEventTypes, callback: EventHandler) {
    this.eventHandlers[eventName].push(callback);
  }

  off(eventName: ServiceOfferEventTypes, callback: EventHandler) {
    this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(
      (h) => h !== callback
    );
  }

  private triggerEvent(eventName: ServiceOfferEventTypes, data: any) {
    this.eventHandlers[eventName].forEach((cb) => cb(data));
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
    }
    this.isConnected = false;
  }
}

const serviceOfferSignalR = new ServiceOfferSignalRService();
export default serviceOfferSignalR;
