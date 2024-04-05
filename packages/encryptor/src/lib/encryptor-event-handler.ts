import { EncryptorExtensionCallback, EncryptorState } from '@4thtech-sdk/types';

enum EventName {
  BLOCK_LABS_ENCRYPTOR_ERROR = 'block_labs_encryptor_error',
  BLOCK_LABS_ENCRYPTOR_HANDSHAKE = 'block_labs_encryptor_handshake',
  BLOCK_LABS_ENCRYPTOR_HEARTBEAT = 'block_labs_encryptor_heartbeat',
  BLOCK_LABS_ENCRYPTOR_RESPONSE = 'block_labs_encryptor_response',
  BLOCK_LABS_ENCRYPTOR_REQUEST = 'block_labs_encryptor_request',
  BLOCK_LABS_ENCRYPTOR_STATE_CHANGE = 'block_labs_encryptor_state_change',
}

type RequestData = {
  type?: string;
  publicKey?: string;
};

export class EncryptorEventHandler {
  private static instance: EncryptorEventHandler;
  private currentId = 1;
  private requests: Record<number, EncryptorExtensionCallback> = {};
  private handshakeCallback: (() => void) | null = null;
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

  public requestHandshake(callback: () => void): void {
    this.handshakeCallback = callback;
    this.dispatchCustomEvent(EventName.BLOCK_LABS_ENCRYPTOR_HANDSHAKE, {});
  }

  public getState(callback: EncryptorExtensionCallback): void {
    this.dispatchCustomEvent(
      EventName.BLOCK_LABS_ENCRYPTOR_REQUEST,
      { type: 'getEncryptorState' },
      callback,
    );
  }

  public getPublicKey(callback: EncryptorExtensionCallback): void {
    this.dispatchCustomEvent(
      EventName.BLOCK_LABS_ENCRYPTOR_REQUEST,
      { type: 'getPublicKey' },
      callback,
    );
  }

  public computeSharedSecretKey(publicKey: string, callback: EncryptorExtensionCallback): void {
    this.dispatchCustomEvent(
      EventName.BLOCK_LABS_ENCRYPTOR_REQUEST,
      { type: 'computeSharedSecretKey', publicKey },
      callback,
    );
  }

  public onHeartbeat(callback: () => void): void {
    this.onHeartbeatCallback = callback;
  }

  public onStateChange(callback: (state: EncryptorState) => void): void {
    this.onStateChangeCallback = callback;
  }

  private dispatchCustomEvent(
    name: string,
    data: RequestData,
    callback?: EncryptorExtensionCallback,
  ): void {
    if (callback) {
      this.requests[this.currentId] = callback;
    }

    document.dispatchEvent(
      new CustomEvent(name, {
        detail: {
          ...data,
          request_id: this.currentId,
        },
      }),
    );

    this.currentId++;
  }

  private setupEventListener(): void {
    window.addEventListener('message', this.handleMessageEvent.bind(this), false);

    document.addEventListener(EventName.BLOCK_LABS_ENCRYPTOR_HEARTBEAT, () => {
      this.onHeartbeatCallback?.();
    });

    document.addEventListener(EventName.BLOCK_LABS_ENCRYPTOR_STATE_CHANGE, (e) => {
      const newState = (e as CustomEvent).detail.state;
      this.onStateChangeCallback?.(newState);
    });
  }

  private handleMessageEvent(event: MessageEvent): void {
    if (event.source !== window) return;

    const { type, response } = event.data;

    switch (type) {
      case EventName.BLOCK_LABS_ENCRYPTOR_RESPONSE:
        this.requests[response.request_id]?.(response);
        delete this.requests[response.request_id];
        break;

      case EventName.BLOCK_LABS_ENCRYPTOR_HANDSHAKE:
        this.handshakeCallback?.();
        break;

      case EventName.BLOCK_LABS_ENCRYPTOR_ERROR:
        console.error(response);
        break;
    }
  }
}
