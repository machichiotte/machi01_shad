declare module 'web-push' {
  interface Subscription {
    endpoint: string;
    expirationTime: number | null;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  interface PushSubscriptionOptions {
    userVisibleOnly: boolean;
    applicationServerKey: string;
  }

  interface PushMessageData {
    [key: string]: string | number | boolean;
  }

  function generateVAPIDKeys(): { publicKey: string; privateKey: string };

  function sendNotification(
    subscription: Subscription,
    payload: PushMessageData | string,
    options?: {
      TTL?: number;
      headers?: { [key: string]: string };
      contentEncoding?: string;
      vapidDetails?: {
        subject: string;
        publicKey: string;
        privateKey: string;
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any>;

  function setVapidDetails(
    options: {
      subject: string;
      publicKey: string;
      privateKey: string;
    }
  ): void;
}
