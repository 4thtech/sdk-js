import { RequestCallback } from '@4thtech-sdk/types';

enum EventName {
  BLOCK_LABS_ENCRYPTOR_HANDSHAKE = 'block_labs_encryptor_handshake',
  BLOCK_LABS_ENCRYPTOR_ERROR = 'block_labs_encryptor_error',
  BLOCK_LABS_ENCRYPTOR_RESPONSE = 'block_labs_encryptor_response',
  BLOCK_LABS_ENCRYPTOR_REQUEST = 'block_labs_encryptor_request',
}

type RequestData = {
  type?: string;
  publicKey?: string;
};

export class EncryptorEventHandler {
  private currentId = 1;
  private requests: Record<number, RequestCallback> = {};
  private handshakeCallback: (() => void) | null = null;

  constructor() {
    this.setupEventListener();
  }

  public requestHandshake(callback: () => void): void {
    this.handshakeCallback = callback;
    this.dispatchCustomEvent(EventName.BLOCK_LABS_ENCRYPTOR_HANDSHAKE, {});
  }

  public getState(callback: RequestCallback): void {
    this.dispatchCustomEvent(
      EventName.BLOCK_LABS_ENCRYPTOR_REQUEST,
      { type: 'getEncryptorState' },
      callback,
    );
  }

  public getPublicKey(callback: RequestCallback): void {
    this.dispatchCustomEvent(
      EventName.BLOCK_LABS_ENCRYPTOR_REQUEST,
      { type: 'getPublicKey' },
      callback,
    );
  }

  public computeSharedSecretKey(publicKey: string, callback: RequestCallback): void {
    this.dispatchCustomEvent(
      EventName.BLOCK_LABS_ENCRYPTOR_REQUEST,
      { type: 'computeSharedSecretKey', publicKey },
      callback,
    );
  }

  private dispatchCustomEvent(name: string, data: RequestData, callback?: RequestCallback): void {
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
