import {
  Address,
  EncryptorExtension,
  EncryptorService,
  EncryptorState,
  EthereumTransactionResponse,
} from '@4thtech-sdk/types';
import { User } from './user';
import { UserConfig } from './user';

export type EncryptorConfig = {
  encryptorExtension: EncryptorExtension;
  userConfig: UserConfig;
};

export class Encryptor implements EncryptorService {
  private readonly encryptorExtension: EncryptorExtension;
  private readonly user: User;

  constructor(config: EncryptorConfig) {
    this.encryptorExtension = config.encryptorExtension;
    this.user = new User(config.userConfig);
  }

  public async isUserAddressInitialized(address: Address): Promise<boolean> {
    return !!(await this.retrieveUserPublicKey(address));
  }

  public async retrieveUserPublicKey(address: Address): Promise<string | undefined> {
    const user = await this.user.fetch(address).catch(() => undefined);

    return user?.encryptionPublicKey.publicKey;
  }

  public async storePublicKey(): Promise<EthereumTransactionResponse> {
    const publicKey = await this.getPublicKey();

    if (!publicKey) {
      throw new Error("Encryptor public key doesn't exist.");
    }

    return this.user.setEncryptionPublicKey(publicKey, this.encryptorExtension.getPublicKeyType());
  }

  public getState(): Promise<EncryptorState> {
    const state = this.encryptorExtension.getState();
    return Promise.resolve(state);
  }

  public getPublicKey(): Promise<string | undefined> {
    const publicKey = this.encryptorExtension.getPublicKey();
    return Promise.resolve(publicKey);
  }

  public getPublicKeyType(): string {
    return this.encryptorExtension.getPublicKeyType();
  }

  public computeSharedSecretKey(publicKey: string): Promise<string | undefined> {
    const secretKey = this.encryptorExtension.computeSharedSecretKey(publicKey);
    return Promise.resolve(secretKey);
  }
}
