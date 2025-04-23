// import * as signalR from "@microsoft/signalr";

// type EventHandler = (data: any) => void;

// type ServiceOfferEventTypes =
//   | "onNewOfferReceived" // Matches "NewOfferReceived" from backend
//   | "onYourOfferAccepted" // Matches "YourOfferAccepted"
//   | "onRequestOfferAccepted" // Matches "RequestOfferAccepted"
//   | "onYourOfferRejected" // Matches "YourOfferRejected"
//   | "onOfferStatusUpdated" // Matches "OfferStatusUpdated"
//   | "onYourOfferStatusUpdated" // Matches "YourOfferStatusUpdated"
//   | "onYourOfferExpired" // Matches "YourOfferExpired"
//   | "onOfferExpired"; // Matches "OfferExpired"

// interface ServiceOfferSignalRService {
//   connect: (token?: string) => Promise<boolean>;
//   joinProviderOffersGroup: (providerId: string) => Promise<boolean>;
//   joinRequestOffersGroup: (requestId: string) => Promise<boolean>;
//   on: (eventName: ServiceOfferEventTypes, callback: EventHandler) => void;
//   off: (eventName: ServiceOfferEventTypes, callback: EventHandler) => void;
//   disconnect: () => Promise<void>;
// }

// export class ServiceOfferSignalRServiceImpl
//   implements ServiceOfferSignalRService
// {
//   private connection: signalR.HubConnection | null = null;
//   private isConnected: boolean = false;
//   private eventHandlers: Record<ServiceOfferEventTypes, EventHandler[]> = {
//     onNewOfferReceived: [],
//     onYourOfferAccepted: [],
//     onRequestOfferAccepted: [],
//     onYourOfferRejected: [],
//     onOfferStatusUpdated: [],
//     onYourOfferStatusUpdated: [],
//     onYourOfferExpired: [],
//     onOfferExpired: [],
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
//           "http://10.0.2.2:5039/serviceOfferHub",
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

//       // Setup handlers with backend method names
//       this.connection.on("NewOfferReceived", (offer) => {
//         console.log("New offer received:", offer);
//         this.eventHandlers.onNewOfferReceived.forEach((handler) =>
//           handler(offer)
//         );
//       });

//       this.connection.on("YourOfferAccepted", (offer) => {
//         console.log("Your offer was accepted:", offer);
//         this.eventHandlers.onYourOfferAccepted.forEach((handler) =>
//           handler(offer)
//         );
//       });

//       this.connection.on("RequestOfferAccepted", (offer) => {
//         console.log("Request offer accepted:", offer);
//         this.eventHandlers.onRequestOfferAccepted.forEach((handler) =>
//           handler(offer)
//         );
//       });

//       this.connection.on("YourOfferRejected", (offer) => {
//         console.log("Your offer was rejected:", offer);
//         this.eventHandlers.onYourOfferRejected.forEach((handler) =>
//           handler(offer)
//         );
//       });

//       this.connection.on("OfferStatusUpdated", (offer) => {
//         console.log("Offer status updated:", offer);
//         this.eventHandlers.onOfferStatusUpdated.forEach((handler) =>
//           handler(offer)
//         );
//       });

//       this.connection.on("YourOfferStatusUpdated", (offer) => {
//         console.log("Your offer status updated:", offer);
//         this.eventHandlers.onYourOfferStatusUpdated.forEach((handler) =>
//           handler(offer)
//         );
//       });

//       this.connection.on("YourOfferExpired", (offer) => {
//         console.log("Your offer expired:", offer);
//         this.eventHandlers.onYourOfferExpired.forEach((handler) =>
//           handler(offer)
//         );
//       });

//       this.connection.on("OfferExpired", (offer) => {
//         console.log("Offer expired:", offer);
//         this.eventHandlers.onOfferExpired.forEach((handler) => handler(offer));
//       });

//       this.connection.onreconnected(() => {
//         console.log("ServiceOffer SignalR reconnected");
//         this.isConnected = true;
//       });

//       this.connection.onclose(() => {
//         console.log("ServiceOffer SignalR connection closed");
//         this.isConnected = false;
//       });

//       await this.connection.start();
//       console.log("ServiceOffer SignalR connection established");
//       this.isConnected = true;
//       return true;
//     } catch (error) {
//       console.error(
//         "Error establishing ServiceOffer SignalR connection:",
//         error
//       );
//       this.isConnected = false;
//       return false;
//     }
//   }

//   async joinProviderOffersGroup(providerId: string): Promise<boolean> {
//     if (!this.isConnected || !this.connection) return false;

//     try {
//       await this.connection.invoke("JoinProviderOffersGroup", providerId);
//       console.log(`Joined provider offers group ${providerId}`);
//       return true;
//     } catch (error) {
//       console.error(
//         `Error joining provider offers group ${providerId}:`,
//         error
//       );
//       return false;
//     }
//   }

//   async joinRequestOffersGroup(requestId: string): Promise<boolean> {
//     if (!this.isConnected || !this.connection) return false;

//     try {
//       await this.connection.invoke("JoinRequestOffersGroup", requestId);
//       console.log(`Joined request offers group ${requestId}`);
//       return true;
//     } catch (error) {
//       console.error(`Error joining request offers group ${requestId}:`, error);
//       return false;
//     }
//   }

//   on(eventName: ServiceOfferEventTypes, callback: EventHandler): void {
//     if (this.eventHandlers[eventName]) {
//       this.eventHandlers[eventName].push(callback);
//     }
//   }

//   off(eventName: ServiceOfferEventTypes, callback: EventHandler): void {
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
//         console.log("ServiceOffer SignalR connection closed");
//       } catch (error) {
//         console.error("Error while disconnecting ServiceOffer SignalR:", error);
//       }
//     }
//   }
// }

// const serviceOfferSignalR = new ServiceOfferSignalRServiceImpl();
// export default serviceOfferSignalR;
// ServiceOfferSignalRService.ts
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
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return true;
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("http://10.0.2.2:5039/serviceOfferHub")
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.connection.serverTimeoutInMilliseconds = 30000;
      this.connection.keepAliveIntervalInMilliseconds = 15000;

      // Register backend events
      Object.keys(this.eventHandlers).forEach((eventName) => {
        this.connection!.on(eventName, (data) => {
          this.triggerEvent(eventName as ServiceOfferEventTypes, data);
        });
      });

      this.connection.onreconnected(() => {
        console.log("ServiceOffer SignalR reconnected");
        this.rejoinGroups();
      });

      this.connection.onclose(() => {
        console.log("ServiceOffer SignalR disconnected");
        this.isConnected = false;
      });

      await this.connection.start();
      console.log("ServiceOffer SignalR connected");
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("ServiceOffer SignalR connection error:", error);
      return false;
    }
  }

  private async rejoinGroups() {
    if (this.providerId) {
      await this.joinProviderOffersGroup(this.providerId);
    }
    if (this.requestId) {
      await this.joinRequestOffersGroup(this.requestId);
    }
  }

  async joinProviderOffersGroup(providerId: string) {
    this.providerId = providerId;
    if (this.isConnected) {
      await this.connection?.invoke("JoinProviderOffersGroup", providerId);
    }
  }

  async joinRequestOffersGroup(requestId: string) {
    this.requestId = requestId;
    if (this.isConnected) {
      await this.connection?.invoke("JoinRequestOffersGroup", requestId);
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
    await this.connection?.stop();
    this.isConnected = false;
  }
}

const serviceOfferSignalR = new ServiceOfferSignalRService();
export default serviceOfferSignalR;
