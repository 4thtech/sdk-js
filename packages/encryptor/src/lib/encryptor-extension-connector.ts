import { BlockLabsEncryptor, EncryptorState } from '@4thtech-sdk/types';
import { EncryptorEventHandler } from './encryptor-event-handler';

export class EncryptorExtensionConnector implements BlockLabsEncryptor {
  private readonly encryptorEventHandler: EncryptorEventHandler;

  constructor() {
    this.encryptorEventHandler = new EncryptorEventHandler();
  }

  public isInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
      this.encryptorEventHandler.requestHandshake(() => {
        resolve(true);
      });

      // Assume that Encryptor is not installed if there is no handshake inside 2s
      setTimeout(() => {
        resolve(false);
      }, 2000);
    });
  }

  public async isInitialized(): Promise<boolean> {
    return (await this.getState()) !== EncryptorState.NOT_GENERATED;
  }

  public async isLocked(): Promise<boolean> {
    return (await this.getState()) === EncryptorState.LOCKED;
  }

  public async isUnlocked(): Promise<boolean> {
    return (await this.getState()) === EncryptorState.UNLOCKED;
  }

  public getState(): Promise<EncryptorState> {
    return new Promise((resolve) => {
      this.encryptorEventHandler.getState((res) => {
        resolve(res.state);
      });
    });
  }

  public getPublicKey(): Promise<string | undefined> {
    return new Promise((resolve) => {
      this.encryptorEventHandler.getPublicKey((res) => {
        resolve(res?.publicKey);
      });
    });
  }

  public getPublicKeyType(): string {
    return 'BL_ENCRYPTOR_EC';
  }

  public computeSharedSecretKey(publicKey: string): Promise<string | undefined> {
    return new Promise((resolve) => {
      this.encryptorEventHandler.computeSharedSecretKey(publicKey, (res) => {
        resolve(res?.sharedSecret);
      });
    });
  }
}
