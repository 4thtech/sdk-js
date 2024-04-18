import { EthereumTransactionResponse } from './ethereum.types';

export enum EncryptorState {
  NOT_GENERATED = 'not-generated',
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
}

export type ResponseData = {
  version?: string;
  publicKey?: string;
  sharedSecret?: string;
  state?: EncryptorState;
};

export interface EncryptorExtension {
  getState(): Promise<EncryptorState | undefined>;

  getPublicKey(): Promise<string | undefined>;

  getPublicKeyType(): string;

  computeSharedSecretKey(publicKey: string): Promise<string | undefined>;
}

export interface EncryptorService extends EncryptorExtension {
  isUserAddressInitialized(address: string): Promise<boolean>;

  retrieveUserPublicKey(address: string): Promise<string | undefined>;

  storePublicKey(): Promise<EthereumTransactionResponse>;
}
