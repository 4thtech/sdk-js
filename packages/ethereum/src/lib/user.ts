import { UserContract } from './contract/user-contract';
import { Address, EthereumTransactionResponse, UserStruct, WalletClient } from '@4thtech-sdk/types';
import { WatchContractEventReturnType } from 'viem';

/**
 * Configuration for creating an instance of the User.
 *
 * @property {WalletClient} walletClient - The WalletClient instance.
 */
export type UserConfig = {
  walletClient: WalletClient;
};

/**
 * Class that handles storing, retrieving and listening for events related to user storage on-chain.
 *
 * @extends UserContract
 */
export class User extends UserContract {
  /**
   * Initialize a new user client.
   *
   * @param {UserConfig} config - The configuration for the user client.
   */
  constructor(config: UserConfig) {
    super(config);
  }

  /**
   * Sets encryption public key.
   *
   * @param {string} publicKey - The user's public key of an encryption method.
   * @param {string} publicKeyType - The public key type for an encryption method.
   * @returns {Promise<EthereumTransactionResponse>} Response of transaction.
   */
  public async setEncryptionPublicKey(
    publicKey: string,
    publicKeyType: string,
  ): Promise<EthereumTransactionResponse> {
    return this.sendContractTransaction({
      functionName: 'setUserEncryptionPublicKey',
      args: [publicKey, publicKeyType],
    });
  }

  /**
   * Fetches a specific user.
   *
   * @param {Address} user - The user address.
   * @returns {Promise<UserStruct>} A promise that resolves to user structure.
   */
  public async fetch(user: Address): Promise<UserStruct> {
    return this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getUser',
      args: [user],
    });
  }

  /**
   * Listener for when encryption public key is set event.
   *
   * @param {Address | undefined} user - The user address.
   * @param {Function} callback - A callback function.
   * @returns {WatchContractEventReturnType} A function that can be invoked to stop watching for new event logs.
   */
  public onEncryptionPublicKeySet(
    user: Address | undefined,
    callback: (user: Address, publicKey: string, publicKeyType: string) => void,
  ): WatchContractEventReturnType {
    return this.publicClient.watchContractEvent({
      ...this.contractConfig,
      eventName: 'EncryptionPublicKeySet',
      args: { user },
      onLogs: (logs) =>
        logs.forEach(({ args: { user, publicKey, publicKeyType } }) => {
          if (user && publicKey && publicKeyType) {
            callback(user, publicKey, publicKeyType);
          }
        }),
    });
  }
}
