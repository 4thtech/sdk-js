import {
  Address,
  EncryptorExtension,
  EncryptorService,
  EncryptorState,
  EthereumTransactionResponse,
  WalletClient,
} from '@4thtech-sdk/types';
import { User } from './user';

/**
 * Configuration for creating an instance of the Encryptor.
 *
 * @property {EncryptorExtension} encryptorExtension - The encryption extension to be used by the Encryptor.
 * @property {WalletClient} walletClient - The WalletClient instance.
 */
export type EncryptorConfig = {
  encryptorExtension: EncryptorExtension;
  walletClient: WalletClient;
};

/**
 * Provides functionality for public key retrieval and storage, as well as shared secret key computation using the Encryptor extension.
 */
export class Encryptor implements EncryptorService {
  private readonly encryptorExtension: EncryptorExtension;
  private readonly user: User;

  /**
   * Initializes a new instance of the Encryptor class.
   *
   * @param {EncryptorConfig} config - Configuration parameters for the Encryptor.
   */
  constructor(config: EncryptorConfig) {
    this.encryptorExtension = config.encryptorExtension;
    this.user = new User({
      walletClient: config.walletClient,
    });
  }

  /**
   * Checks if the user address has an associated public key.
   *
   * @param {Address} address - User's address.
   * @returns {Promise<boolean>} - True if the user address has an associated public key, otherwise false.
   */
  public async isUserAddressInitialized(address: Address): Promise<boolean> {
    return !!(await this.retrieveUserPublicKey(address));
  }

  /**
   * Retrieves the public key associated with the given user address.
   *
   * @param {Address} address - User's address.
   * @returns {Promise<string | undefined>} - The public key or undefined if not found.
   */
  public async retrieveUserPublicKey(address: Address): Promise<string | undefined> {
    const user = await this.user.fetch(address).catch(() => undefined);

    return user?.encryptionPublicKey.publicKey;
  }

  /**
   * Stores the user's public key.
   *
   * @returns {Promise<EthereumTransactionResponse>} - The Ethereum transaction response.
   */
  public async storePublicKey(): Promise<EthereumTransactionResponse> {
    const publicKey = await this.getPublicKey();

    if (!publicKey) {
      throw new Error("Encryptor public key doesn't exist.");
    }

    return this.user.setEncryptionPublicKey(publicKey, this.encryptorExtension.getPublicKeyType());
  }

  /**
   * Retrieves the state of the Encryptor extension.
   *
   * @returns {Promise<EncryptorState>} - The current state of the Encryptor extension.
   */
  public getState(): Promise<EncryptorState> {
    const state = this.encryptorExtension.getState();
    return Promise.resolve(state);
  }

  /**
   * Retrieves the user's public key from the Encryptor extension.
   *
   * @returns {Promise<string | undefined>} - The public key or undefined if not found.
   */
  public getPublicKey(): Promise<string | undefined> {
    const publicKey = this.encryptorExtension.getPublicKey();
    return Promise.resolve(publicKey);
  }

  /**
   * Retrieves the type of the user's public key.
   *
   * @returns {string} - The type of the public key.
   */
  public getPublicKeyType(): string {
    return this.encryptorExtension.getPublicKeyType();
  }

  /**
   * Computes a shared secret key with the provided public key.
   *
   * @param {string} publicKey - The public key to compute the shared secret with.
   * @returns {Promise<string | undefined>} - The computed shared secret key or undefined if computation failed.
   */
  public computeSharedSecretKey(publicKey: string): Promise<string | undefined> {
    const secretKey = this.encryptorExtension.computeSharedSecretKey(publicKey);
    return Promise.resolve(secretKey);
  }
}
