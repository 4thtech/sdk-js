import { EncryptorState, ResponseData } from '@4thtech-sdk/types';

enum EventName {
  EMIT_HEARTBEAT = 'emitHeartbeat',
  EMIT_ENCRYPTOR_STATE_CHANGE = 'emitEncryptorStateChange',
}

type RequestData = {
  publicKey?: string;
};

export class EncryptorEventHandler {
  private static instance: EncryptorEventHandler;
  private readonly extensionId = 'feolajpinjjfikmmeknkdjbllbppojij';
  private onHeartbeatCallback: (() => void) | null = null;
  private onStateChangeCallback: ((state: EncryptorState) => void) | null = null;

  constructor() {
    this.setupEventListener();
  }

  public static getInstance(): EncryptorEventHandler {
    if (!EncryptorEventHandler.instance) {
      EncryptorEventHandler.instance = new EncryptorEventHandler();
    }
    return EncryptorEventHandler.instance;
  }

  public async getAppVersion(): Promise<string | undefined> {
    const response = await this.sendMessageToExtension('getAppVersion').catch(() => {});

    return response?.version;
  }

  public async getState(): Promise<EncryptorState | undefined> {
    const response = await this.sendMessageToExtension('getEncryptorState').catch(() => {});

    return response ? response.state : EncryptorState.NOT_GENERATED;
  }

  public async getPublicKey(): Promise<string | undefined> {
    const response = await this.sendMessageToExtension('getPublicKey').catch(() => {});

    return response?.publicKey;
  }

  public async computeSharedSecretKey(publicKey: string): Promise<string | undefined> {
    const response = await this.sendMessageToExtension('computeSharedSecretKey', {
      publicKey,
    }).catch(() => {});

    return response?.sharedSecret;
  }

  public onHeartbeat(callback: () => void): void {
    this.onHeartbeatCallback = callback;
  }

  public onStateChange(callback: (state: EncryptorState) => void): void {
    this.onStateChangeCallback = callback;
  }

  private async sendMessageToExtension(action: string, data?: RequestData): Promise<ResponseData> {
    // Check if chrome.runtime and chrome.runtime.sendMessage are available
    if (!chrome.runtime || !chrome.runtime.sendMessage) {
      throw new Error(
        'Extension is not installed or the environment does not support chrome.runtime.',
      );
    }

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(this.extensionId, { action, data }, (response) => {
        // Check for no response scenario which could indicate the extension is not installed or has no listener
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        }

        // Check if the response includes an error property, which is an application-specific error
        if (response && response.error) {
          reject(new Error(response.error));
        }

        resolve(response);
      });
    });
  }

  private setupEventListener(): void {
    window.addEventListener('message', this.handleMessageEvent.bind(this), false);
  }

  private handleMessageEvent(event: MessageEvent): void {
    if (event.source !== window) return;

    const { action, data } = event.data;

    switch (action) {
      case EventName.EMIT_HEARTBEAT:
        this.onHeartbeatCallback?.();
        break;

      case EventName.EMIT_ENCRYPTOR_STATE_CHANGE:
        this.onStateChangeCallback?.(data.state);
        break;
    }
  }
}
