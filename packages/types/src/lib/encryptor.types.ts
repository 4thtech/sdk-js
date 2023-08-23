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

export interface BlockLabsEncryptor {
  getState(): Promise<EncryptorState>;

  getPublicKey(): Promise<string | undefined>;

  computeSharedSecretKey(publicKey: string): Promise<string | undefined>;
}

export interface EncryptorService extends BlockLabsEncryptor {
  isUserAddressInitialized(address: string): Promise<boolean>;

  retrieveUserPublicKey(address: string): Promise<string | undefined>;

  storePublicKey(): Promise<EthereumTransactionResponse>;
}
