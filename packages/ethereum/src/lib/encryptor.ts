import { EncryptorExtensionConnector } from '@4thtech-sdk/encryptor';
import { EncryptorService, EthereumTransactionResponse } from '@4thtech-sdk/types';
import { User } from './user';
import { UserConfig } from './user';

export type EncryptorConfig = {
  userContractConfig: UserConfig;
};

export class Encryptor extends EncryptorExtensionConnector implements EncryptorService {
  private readonly user: User;

  constructor(config: EncryptorConfig) {
    super();

    this.user = new User(config.userContractConfig);
  }

  public async isUserAddressInitialized(address: string): Promise<boolean> {
    return !!(await this.retrieveUserPublicKey(address));
  }

  public async retrieveUserPublicKey(address: string): Promise<string | undefined> {
    const user = await this.user.fetch(address);

    return user ? user.encryptionPublicKey.publicKey : undefined;
  }

  public async storePublicKey(): Promise<EthereumTransactionResponse> {
    const publicKey = await this.getPublicKey();

    if (!publicKey) {
      throw new Error("Encryptor public key doesn't exist.");
    }

    return this.user.setEncryptionPublicKey(publicKey, this.getPublicKeyType());
  }
}
