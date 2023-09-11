import { EthereumTransactionResponse } from './ethereum.types';

export enum EncryptorState {
  NOT_GENERATED = 'not-generated',
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
}

type ResponseObject = {
  publicKey?: string;
  sharedSecret?: string;
  state: EncryptorState;
};

export type RequestCallback = (response: ResponseObject) => void;

export interface EncryptorExtension {
  getState(): Promise<EncryptorState> | EncryptorState;

  getPublicKey(): Promise<string | undefined> | string;

  getPublicKeyType(): string;

  computeSharedSecretKey(publicKey: string): Promise<string | undefined> | string;
}

export interface EncryptorService extends EncryptorExtension {
  isUserAddressInitialized(address: string): Promise<boolean>;

  retrieveUserPublicKey(address: string): Promise<string | undefined>;

  storePublicKey(): Promise<EthereumTransactionResponse>;
}
