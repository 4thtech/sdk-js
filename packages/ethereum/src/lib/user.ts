import { UserContract } from './contract/user-contract';
import {
  ContractUserOutput,
  EthereumTransactionResponse,
  Signer,
  UserReadyChain,
  UserStruct,
} from '@4thtech-sdk/types';

export type UserConfig = {
  signer: Signer;
  chain: UserReadyChain;
};

/**
 * Class that handles storing, retrieving and listening for events related to user storage on-chain.
 * @extends UserContract
 */
export class User extends UserContract {
  /**
   * Initialize a new user client.
   * @param {UserConfig} config - The configuration for the user client.
   */
  constructor(config: UserConfig) {
    super(config);
  }

  /**
   * Sets encryption public key.
   * @param {string} publicKey The user's public key of an encryption method.
   * @param {string} publicKeyType The public key type for an encryption method.
   * @returns {Promise<EthereumTransactionResponse>} Response of transaction.
   */
  public async setEncryptionPublicKey(
    publicKey: string,
    publicKeyType: string,
  ): Promise<EthereumTransactionResponse> {
    const populatedTx = await this.contract.populateTransaction['setUserEncryptionPublicKey'](
      publicKey,
      publicKeyType,
    );

    return this.sendTransaction(populatedTx);
  }

  /**
   * Fetches a specific user.
   * @param {string} user The user address.
   * @returns {Promise<UserStruct | undefined>} A promise that resolves to user structure or undefined.
   */
  public async fetch(user: string): Promise<UserStruct | undefined> {
    const contractUserOutput: ContractUserOutput = await this.contract['getUser'](user);

    return contractUserOutput ? this.processContractUserOutput(contractUserOutput) : undefined;
  }

  /**
   * Listener for when encryption public key is set event.
   * @param {string} user The user address.
   * @param {Function} callback A callback function.
   */
  public onEncryptionPublicKeySet(
    user: string,
    callback: (user: string, publicKey: string, publicKeyType: string) => void,
  ): void {
    const filter = this.contract.filters['EncryptionPublicKeySet'](user);

    this.contract.on(filter, (user, publicKey, publicKeyType) => {
      callback(user, publicKey, publicKeyType);
    });
  }
}
