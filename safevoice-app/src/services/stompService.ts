// src/services/stompService.ts
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { storage } from './storage';

import { Platform } from 'react-native';

const getWsUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_WS_BASE_URL;
  if (envUrl) {
    if (Platform.OS === 'android' && envUrl.includes('localhost')) {
      return envUrl.replace('localhost', '10.0.2.2');
    }
    return envUrl;
  }
  if (Platform.OS === 'android') {
    return 'ws://10.0.2.2:8080/ws';
  }
  return 'ws://localhost:8080/ws';
};

const WS_BASE_URL = getWsUrl();

class StompService {
  private client: Client | null = null;
  private isConnected = false;

  public async connect(): Promise<void> {
    if (this.client && this.isConnected) return;

    const accessToken = await storage.getAccessToken();

    this.client = new Client({
      brokerURL: WS_BASE_URL,
      connectHeaders: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {},
      debug: (str: string) => {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('[STOMP]', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      this.isConnected = true;
    };

    this.client.onDisconnect = () => {
      this.isConnected = false;
    };

    this.client.onStompError = (frame: any) => {
      // eslint-disable-next-line no-console
      console.error('[STOMP Error]', frame.headers['message'], frame.body);
    };

    this.client.activate();
  }

  public subscribe(
    destination: string,
    callback: (message: IMessage) => void
  ): StompSubscription | null {
    if (!this.client || !this.client.active) {
      return null;
    }
    return this.client.subscribe(destination, callback);
  }

  public disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }
}

export const stompService = new StompService();
