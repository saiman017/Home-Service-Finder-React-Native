// import * as signalR from "@microsoft/signalr";

// type EventHandler = (data: any) => void;
// type EventTypes =
//   | "onNewRequest"
//   | "onRequestStatusUpdated"
//   | "onRequestCancelled";

// interface ServiceRequestSignalRService {
//   connect: (token?: string) => Promise<boolean>;
//   subscribeToCategoryRequests: (categoryId: string) => Promise<boolean>;
//   unsubscribeFromCategoryRequests: (categoryId: string) => Promise<boolean>;
//   joinProviderGroup: (providerId: string) => Promise<boolean>;
//   on: (eventName: EventTypes, callback: EventHandler) => void;
//   off: (eventName: EventTypes, callback: EventHandler) => void;
//   disconnect: () => Promise<void>;
// }

// export class ServiceRequestSignalRServiceImpl
//   implements ServiceRequestSignalRService
// {
//   private connection: signalR.HubConnection | null = null;
//   private isConnected: boolean = false;
//   private eventHandlers: Record<EventTypes, EventHandler[]> = {
//     onNewRequest: [],
//     onRequestStatusUpdated: [],
//     onRequestCancelled: [],
//   };

//   async connect(token?: string): Promise<boolean> {
//     if (
//       this.isConnected &&
//       this.connection?.state === signalR.HubConnectionState.Connected
//     ) {
//       return true;
//     }

//     try {
//       const connectionBuilder = new signalR.HubConnectionBuilder()
//         .withUrl(
//           "http://10.0.2.2:5039/requestHub",
//           token ? { accessTokenFactory: () => token } : {}
//         )
//         .withAutomaticReconnect({
//           nextRetryDelayInMilliseconds: (retryContext) =>
//             Math.min(
//               Math.pow(2, retryContext.previousRetryCount) * 1000,
//               30000
//             ),
//         })
//         .configureLogging(signalR.LogLevel.Warning);

//       this.connection = connectionBuilder.build();

//       this.connection.on("NewRequestCreated", (request) => {
//         console.log("New service request received:", request);
//         this.eventHandlers.onNewRequest.forEach((handler) => handler(request));
//       });

//       this.connection.on("RequestStatusUpdated", (request) => {
//         console.log("Service request status updated:", request);
//         this.eventHandlers.onRequestStatusUpdated.forEach((handler) =>
//           handler(request)
//         );
//       });

//       this.connection.on("RequestCancelled", (request) => {
//         console.log("Service request cancelled:", request);
//         this.eventHandlers.onRequestCancelled.forEach((handler) =>
//           handler(request)
//         );
//       });

//       this.connection.onreconnected(() => {
//         console.log("SignalR reconnected");
//         this.isConnected = true;
//       });

//       this.connection.onclose(() => {
//         console.log("SignalR connection closed");
//         this.isConnected = false;
//       });

//       await this.connection.start();
//       console.log("SignalR connection established");
//       this.isConnected = true;

//       return true;
//     } catch (error) {
//       console.error("Error establishing SignalR connection:", error);
//       this.isConnected = false;
//       return false;
//     }
//   }

//   async subscribeToCategoryRequests(categoryId: string): Promise<boolean> {
//     if (!this.isConnected || !this.connection) return false;

//     try {
//       await this.connection.invoke("JoinCategoryGroup", categoryId);
//       console.log(`Subscribed to category ${categoryId}`);
//       return true;
//     } catch (error) {
//       console.error(`Error subscribing to category ${categoryId}:`, error);
//       return false;
//     }
//   }

//   async unsubscribeFromCategoryRequests(categoryId: string): Promise<boolean> {
//     if (!this.isConnected || !this.connection) return false;

//     try {
//       await this.connection.invoke("LeaveCategoryGroup", categoryId);
//       console.log(`Unsubscribed from category ${categoryId}`);
//       return true;
//     } catch (error) {
//       console.error(`Error unsubscribing from category ${categoryId}:`, error);
//       return false;
//     }
//   }

//   async joinProviderGroup(providerId: string): Promise<boolean> {
//     if (!this.isConnected || !this.connection) return false;

//     try {
//       await this.connection.invoke("JoinProviderGroup", providerId);
//       console.log(`Joined provider group ${providerId}`);
//       return true;
//     } catch (error) {
//       console.error(`Error joining provider group ${providerId}:`, error);
//       return false;
//     }
//   }

//   on(eventName: EventTypes, callback: EventHandler): void {
//     if (this.eventHandlers[eventName]) {
//       this.eventHandlers[eventName].push(callback);
//     }
//   }

//   off(eventName: EventTypes, callback: EventHandler): void {
//     if (this.eventHandlers[eventName]) {
//       const index = this.eventHandlers[eventName].indexOf(callback);
//       if (index !== -1) {
//         this.eventHandlers[eventName].splice(index, 1);
//       }
//     }
//   }

//   async disconnect(): Promise<void> {
//     if (this.connection) {
//       try {
//         await this.connection.stop();
//         this.isConnected = false;
//         console.log("SignalR connection closed");
//       } catch (error) {
//         console.error("Error while disconnecting SignalR:", error);
//       }
//     }
//   }
// }

// const serviceRequestSignalR = new ServiceRequestSignalRServiceImpl();
// export default serviceRequestSignalR;

// import * as signalR from "@microsoft/signalr";

// type EventHandler = (data: any) => void;

// // Updated to match backend exactly
// type EventTypes =
//   | "onNewRequestCreated" // Matches "NewRequestCreated" from backend
//   | "onRequestStatusUpdated" // Matches "RequestStatusUpdated"
//   | "onYourRequestStatusUpdated" // Matches "YourRequestStatusUpdated"
//   | "onRequestCancelled" // Matches "requestcancelled" (note lowercase)
//   | "onProviderRequestCancelled"; // Matches "ProviderRequestCancelled"

// interface ServiceRequestSignalRService {
//   connect: (token?: string) => Promise<boolean>;
//   subscribeToCategoryRequests: (categoryId: string) => Promise<boolean>;
//   unsubscribeFromCategoryRequests: (categoryId: string) => Promise<boolean>;
//   joinProviderGroup: (providerId: string) => Promise<boolean>;
//   joinCustomerGroup: (customerId: string) => Promise<boolean>;
//   on: (eventName: EventTypes, callback: EventHandler) => void;
//   off: (eventName: EventTypes, callback: EventHandler) => void;
//   disconnect: () => Promise<void>;
// }

// export class ServiceRequestSignalRServiceImpl
//   implements ServiceRequestSignalRService
// {
//   private connection: signalR.HubConnection | null = null;
//   private isConnected: boolean = false;
//   private eventHandlers: Record<EventTypes, EventHandler[]> = {
//     onNewRequestCreated: [],
//     onRequestStatusUpdated: [],
//     onYourRequestStatusUpdated: [],
//     onRequestCancelled: [], // Changed to match backend
//     onProviderRequestCancelled: [],
//   };

//   async connect(token?: string): Promise<boolean> {
//     if (
//       this.isConnected &&
//       this.connection?.state === signalR.HubConnectionState.Connected
//     ) {
//       return true;
//     }

//     try {
//       const connectionBuilder = new signalR.HubConnectionBuilder()
//         .withUrl(
//           "http://10.0.2.2:5039/requestHub",
//           token ? { accessTokenFactory: () => token } : {}
//         )
//         .withAutomaticReconnect({
//           nextRetryDelayInMilliseconds: (retryContext) =>
//             Math.min(
//               Math.pow(2, retryContext.previousRetryCount) * 1000,
//               30000
//             ),
//         })
//         .configureLogging(signalR.LogLevel.Warning);

//       this.connection = connectionBuilder.build();

//       // Setup handlers with EXACT backend method names
//       this.connection.on("NewRequestCreated", (request) => {
//         console.log("New request received:", request);
//         this.eventHandlers.onNewRequestCreated.forEach((handler) =>
//           handler(request)
//         );
//       });

//       this.connection.on("RequestStatusUpdated", (request) => {
//         console.log("Status update received:", request);
//         this.eventHandlers.onRequestStatusUpdated.forEach((handler) =>
//           handler(request)
//         );
//       });

//       this.connection.on("YourRequestStatusUpdated", (request) => {
//         console.log("Your request update received:", request);
//         this.eventHandlers.onYourRequestStatusUpdated.forEach((handler) =>
//           handler(request)
//         );
//       });

//       // Critical fix: Match backend's lowercase method name
//       this.connection.on("RequestCancelled", (request) => {
//         console.log("Cancellation received:", request);
//         this.eventHandlers.onRequestCancelled.forEach((handler) =>
//           handler(request)
//         );
//       });

//       this.connection.on("ProviderRequestCancelled", (request) => {
//         console.log("Provider cancellation received:", request);
//         this.eventHandlers.onProviderRequestCancelled.forEach((handler) =>
//           handler(request)
//         );
//       });

//       this.connection.onreconnected(() => {
//         console.log("SignalR reconnected");
//         this.isConnected = true;
//       });

//       this.connection.onclose(() => {
//         console.log("SignalR connection closed");
//         this.isConnected = false;
//       });

//       await this.connection.start();
//       console.log("SignalR connection established");
//       this.isConnected = true;
//       return true;
//     } catch (error) {
//       console.error("Error establishing SignalR connection:", error);
//       this.isConnected = false;
//       return false;
//     }
//   }

//   async subscribeToCategoryRequests(categoryId: string): Promise<boolean> {
//     if (!this.isConnected || !this.connection) return false;

//     try {
//       await this.connection.invoke("JoinCategoryGroup", categoryId);
//       console.log(`Subscribed to category ${categoryId}`);
//       return true;
//     } catch (error) {
//       console.error(`Error subscribing to category ${categoryId}:`, error);
//       return false;
//     }
//   }

//   async unsubscribeFromCategoryRequests(categoryId: string): Promise<boolean> {
//     if (!this.isConnected || !this.connection) return false;

//     try {
//       await this.connection.invoke("LeaveCategoryGroup", categoryId);
//       console.log(`Unsubscribed from category ${categoryId}`);
//       return true;
//     } catch (error) {
//       console.error(`Error unsubscribing from category ${categoryId}:`, error);
//       return false;
//     }
//   }

//   async joinProviderGroup(providerId: string): Promise<boolean> {
//     if (!this.isConnected || !this.connection) return false;

//     try {
//       await this.connection.invoke("JoinProviderGroup", providerId);
//       console.log(`Joined provider group ${providerId}`);
//       return true;
//     } catch (error) {
//       console.error(`Error joining provider group ${providerId}:`, error);
//       return false;
//     }
//   }

//   async joinCustomerGroup(customerId: string): Promise<boolean> {
//     if (!this.isConnected || !this.connection) return false;

//     try {
//       await this.connection.invoke("JoinCustomerGroup", customerId);
//       console.log(`Joined customer group ${customerId}`);
//       return true;
//     } catch (error) {
//       console.error(`Error joining customer group ${customerId}:`, error);
//       return false;
//     }
//   }

//   on(eventName: EventTypes, callback: EventHandler): void {
//     if (this.eventHandlers[eventName]) {
//       this.eventHandlers[eventName].push(callback);
//     }
//   }

//   off(eventName: EventTypes, callback: EventHandler): void {
//     if (this.eventHandlers[eventName]) {
//       const index = this.eventHandlers[eventName].indexOf(callback);
//       if (index !== -1) {
//         this.eventHandlers[eventName].splice(index, 1);
//       }
//     }
//   }

//   async disconnect(): Promise<void> {
//     if (this.connection) {
//       try {
//         await this.connection.stop();
//         this.isConnected = false;
//         console.log("SignalR connection closed");
//       } catch (error) {
//         console.error("Error while disconnecting SignalR:", error);
//       }
//     }
//   }
// }

// const serviceRequestSignalR = new ServiceRequestSignalRServiceImpl();
// export default serviceRequestSignalR;
import * as signalR from "@microsoft/signalr";

type EventHandler = (data: any) => void;

export type EventTypes =
  | "NewRequestCreated"
  | "RequestStatusUpdated"
  | "YourRequestStatusUpdated"
  | "RequestCancelled"
  | "ProviderRequestCancelled";

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
    if (
      this.isConnected &&
      this.connection?.state === signalR.HubConnectionState.Connected
    ) {
      return true;
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("http://10.0.2.2:5039/requestHub")
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Register backend event handlers
      Object.keys(this.eventHandlers).forEach((eventName) => {
        this.connection!.on(eventName, (data) => {
          this.trigger(eventName as EventTypes, data);
        });
      });

      this.connection.onreconnected(() => {
        console.log("ServiceRequest SignalR reconnected");
        this.rejoinGroups();
      });

      this.connection.onclose(() => {
        console.log("ServiceRequest SignalR disconnected");
        this.isConnected = false;
      });

      await this.connection.start();
      this.isConnected = true;
      console.log("ServiceRequest SignalR connected");
      return true;
    } catch (err) {
      console.error("ServiceRequest SignalR connection failed:", err);
      this.isConnected = false;
      return false;
    }
  }

  private async rejoinGroups() {
    if (this.categoryId) {
      await this.subscribeToCategoryRequests(this.categoryId);
    }
    if (this.customerId) {
      await this.joinCustomerGroup(this.customerId);
    }
    if (this.providerId) {
      await this.joinProviderGroup(this.providerId);
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
    this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(
      (h) => h !== callback
    );
  }

  private trigger(eventName: EventTypes, data: any) {
    this.eventHandlers[eventName].forEach((handler) => handler(data));
  }

  async disconnect(): Promise<void> {
    await this.connection?.stop();
    this.isConnected = false;
  }
}

const serviceRequestSignalR = new ServiceRequestSignalRService();
export default serviceRequestSignalR;
