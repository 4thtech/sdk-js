import {
  AddedToWhitelistEventOutput,
  Address,
  AppId,
  ContractMailOutput,
  ContractMailOutputs,
  EthereumTransactionResponse,
  Mailable,
  MailDeletedEventOutput,
  MailOpenedEventOutput,
  MailSendOptions,
  MailSendState,
  MailSentEventOutput,
  ReceivedEnvelope,
  RemoteFileInfo,
  RemovedFromWhitelistEventOutput,
  TransactionHash,
  WalletClient,
} from '@4thtech-sdk/types';
import { MailContract } from './contract/mail-contract';
import { RemoteStorageProvider } from '@4thtech-sdk/storage';
import { EncryptionHandler } from '@4thtech-sdk/encryption';
import { WatchContractEventReturnType } from 'viem';

/**
 * Configuration for creating an instance of the Mail.
 *
 * @property {WalletClient} walletClient - The WalletClient instance.
 * @property {RemoteStorageProvider} remoteStorageProvider - The remote storage provider instance.
 * @property {AppId} appId - Optional application’s identifier.
 * @property {EncryptionHandler} encryptionHandler - Optional EncryptionHandler instance used for decrypting mails.
 */
export type MailConfig = {
  walletClient: WalletClient;
  remoteStorageProvider: RemoteStorageProvider;
  appId?: AppId;
  encryptionHandler?: EncryptionHandler;
};

/**
 * Class that handles sending, retrieving and listening for events related to on-chain mail storage.
 *
 * @extends MailContract
 * @implements Mailable
 */
export class Mail extends MailContract implements Mailable {
  /**
   * Initialize a new mail client.
   *
   * @param {MailConfig} config - The configuration for the mail client.
   */
  constructor(config: MailConfig) {
    super(config);
  }

  /**
   * Send a new mail.
   *
   * @param {MailSendOptions} options - Configuration for sending mail.
   * @param {Envelope} options.envelope - The mail envelope to send.
   * @param {Encryption} [options.encryption] - Optional encryption method.
   * @param {function} [options.onStateChange] - Optional callback to track state changes during sending.
   * @param {function} [options.onUploadProgress] - Optional callback to track files upload progress.
   * @returns {Promise<EthereumTransactionResponse>} Response of transaction.
   */
  public async send(options: MailSendOptions): Promise<EthereumTransactionResponse> {
    const storedEnvelope = await this.storeEnvelope(options);

    // Track transaction state
    if (options.onStateChange) {
      options.onStateChange(MailSendState.SENDING_TRANSACTION);
    }

    return this.sendContractTransaction({
      functionName: 'sendMail',
      args: [
        this.appId,
        options.envelope.receiver,
        storedEnvelope.URL,
        storedEnvelope.checksum,
        storedEnvelope.metadata,
      ],
      fee: await this.getAppRequiredFee(),
    });
  }

  /**
   * Set opened time for a specific mail. This method can only perform a receiver of the mail.
   *
   * @param {BigInt} mailIndex - The index of the mail to set opened time.
   * @returns {Promise<EthereumTransactionResponse>} Response of transaction.
   */
  public async setOpenedAt(mailIndex: bigint): Promise<EthereumTransactionResponse> {
    return this.sendContractTransaction({
      functionName: 'setOpenedAt',
      args: [this.appId, mailIndex],
    });
  }

  /**
   * Add users to whitelist.
   *
   * @param {Address[]} users - The users addresses to be whitelisted.
   * @returns {Promise<EthereumTransactionResponse>} Response of transaction.
   */
  public async addToWhitelist(users: Address[]): Promise<EthereumTransactionResponse> {
    return this.sendContractTransaction({
      functionName: 'addToWhitelist',
      args: [this.appId, users],
    });
  }

  /**
   *  Deletes a specific mail. This method can only perform a receiver of the mail.
   *
   * @param {BigInt} mailIndex - The index of the mail to be deleted.
   * @returns {Promise<EthereumTransactionResponse>} Response of transaction.
   */
  public async deleteMail(mailIndex: bigint): Promise<EthereumTransactionResponse> {
    return this.sendContractTransaction({
      functionName: 'deleteMail',
      args: [this.appId, mailIndex],
    });
  }

  /**
   *  Deletes multiple mails. This method can only perform a receiver of the mails.
   *
   * @param {BigInt[]} mailIndexes - The indexes of mails to be deleted.
   * @returns {Promise<EthereumTransactionResponse>} Response of transaction.
   */
  public async deleteMails(mailIndexes: bigint[]): Promise<EthereumTransactionResponse> {
    return this.sendContractTransaction({
      functionName: 'deleteMails',
      args: [this.appId, mailIndexes],
    });
  }

  /**
   * Remove users from whitelist.
   *
   * @param {Address[]} users - The users addresses to be removed from whitelist.
   * @returns {Promise<EthereumTransactionResponse>} Response of transaction.
   */
  public async removeFromWhitelist(users: Address[]): Promise<EthereumTransactionResponse> {
    return this.sendContractTransaction({
      functionName: 'removeFromWhitelist',
      args: [this.appId, users],
    });
  }

  /**
   *  Fetch a specific mail.
   *
   * @param {Address} receiver - The mail receiver address.
   * @param {BigInt} mailIndex - The index of the mail.
   * @returns {Promise<ReceivedEnvelope>} The received mail Envelope.
   */
  public async fetch(receiver: Address, mailIndex: bigint): Promise<ReceivedEnvelope> {
    const contractMailOutput: ContractMailOutput = await this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getMail',
      args: [this.appId, receiver, mailIndex],
    });

    return this.processContractMailOutput(contractMailOutput, receiver);
  }

  /**
   *  Fetch mails paginated.
   *
   * @param {Address} receiver - The mail receiver address.
   * @param {BigInt} pageNumber - The page number.
   * @param {BigInt} pageSize - The page size.
   * @returns {Promise<ReceivedEnvelope[]>} Array of received mail Envelopes.
   */
  public async fetchPaginated(
    receiver: Address,
    pageNumber: bigint,
    pageSize: bigint,
  ): Promise<ReceivedEnvelope[]> {
    const contractMailOutputs: ContractMailOutputs = await this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getMailsPaginated',
      args: [this.appId, receiver, pageNumber, pageSize],
    });

    return this.processContractMailOutputs(contractMailOutputs, receiver);
  }

  /**
   *  Fetches mail by transaction hash.
   *
   * @param {TransactionHash} transactionHash - The transaction hash.
   * @returns {Promise<ReceivedEnvelope>} The received mail Envelope.
   */
  public async fetchByTransactionHash(transactionHash: TransactionHash): Promise<ReceivedEnvelope> {
    return this.getEnvelopeByTransactionHash(transactionHash);
  }

  /**
   *  Counts the number of mails of a receiver.
   *
   * @param {Address} receiver - The mail receiver address.
   * @returns {Promise<BigInt>} Number of mails.
   */
  public async count(receiver: Address): Promise<bigint> {
    return this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getMailsCount',
      args: [this.appId, receiver],
    });
  }

  /**
   *  Fetch whitelisted users paginated.
   *
   * @param {Address} user - The users address.
   * @param {BigInt} pageNumber - The page number.
   * @param {BigInt} pageSize - The page size.
   * @returns {Promise<Address[]>} Array of whitelisted users.
   */
  public async fetchWhitelistedUsersPaginated(
    user: Address,
    pageNumber: bigint,
    pageSize: bigint,
  ): Promise<readonly Address[]> {
    return this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getWhitelistedUsersPaginated',
      args: [this.appId, user, pageNumber, pageSize],
    });
  }

  /**
   *  Counts the number of whitelisted users of a user.
   *
   * @param {Address} user - The user address.
   * @returns {Promise<BigInt>} Number of whitelisted users.
   */
  public async getWhitelistedUsersCount(user: Address): Promise<bigint> {
    return this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getWhitelistedUsersCount',
      args: [this.appId, user],
    });
  }

  /**
   *  Checks if a sender is whitelisted to interact with a receiver.
   *
   * @param {Address} receiver - The receiver address.
   * @param {Address} sender - The sender address.
   * @returns {Promise<boolean>} Whether the user is whitelisted.
   */
  public async isWhitelisted(receiver: Address, sender: Address): Promise<boolean> {
    return this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'isWhitelisted',
      args: [this.appId, receiver, sender],
    });
  }

  /**
   *  Retrieves the user's App ID's.
   *
   * @param {Address} user - The user address.
   * @param {BigInt} pageNumber - The page number.
   * @param {BigInt} pageSize - The page size.
   * @returns {Promise<AppId[]>} Array of App ID's.
   */
  public async getUserAppIdsPaginated(
    user: Address,
    pageNumber: bigint,
    pageSize: bigint,
  ): Promise<readonly AppId[]> {
    return this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getUserAppIdsPaginated',
      args: [user, pageNumber, pageSize],
    });
  }

  /**
   *  Counts the number of apps of a user.
   *
   * @param {Address} user - The user address.
   * @returns {Promise<BigInt>} Number of apps.
   */
  public async getUserAppIdsCount(user: Address): Promise<bigint> {
    return this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getUserAppIdsCount',
      args: [user],
    });
  }

  /**
   *  Downloads an attachment of a mail.
   *
   * @param {RemoteFileInfo} attachment - The attachment information.
   * @returns {Promise<ArrayBuffer>} Array buffer of the downloaded file.
   */
  public downloadAttachment(attachment: RemoteFileInfo): Promise<ArrayBuffer> {
    return this.remoteStorage.retrieve(attachment);
  }

  /**
   *  Listener for new mail event.
   *
   * @param {Address | null } sender - The mail sender address.
   * @param {Address | null } receiver - The mail receiver address.
   * @param {Function} callback - The callback function.
   * @returns {WatchContractEventReturnType} A function that can be invoked to stop watching for new event logs.
   */
  public onNew(
    sender: Address | null,
    receiver: Address | null,
    callback: (envelope: ReceivedEnvelope) => void,
  ): WatchContractEventReturnType {
    return this.publicClient.watchContractEvent({
      ...this.contractConfig,
      eventName: 'MailSent',
      args: { sender, receiver },
      onLogs: (logs) =>
        logs.forEach(async ({ args }) => {
          if (args.appId === this.appId) {
            const eventOutput = args as MailSentEventOutput;
            callback(await this.processContractMailOutput(eventOutput, eventOutput.receiver));
          }
        }),
    });
  }

  /**
   *  Listener for opened mail event.
   *
   * @param {Address | null } receiver - The mail receiver address.
   * @param {BigInt | null } index - The index of the mail.
   * @param {Function} callback - The callback function.
   * @returns {WatchContractEventReturnType} A function that can be invoked to stop watching for new event logs.
   */
  public onOpened(
    receiver: Address | null,
    index: bigint | null,
    callback: (index: bigint, openedAt: bigint) => void,
  ): WatchContractEventReturnType {
    return this.publicClient.watchContractEvent({
      ...this.contractConfig,
      eventName: 'MailOpened',
      args: { appId: this.appId, receiver, index },
      onLogs: (logs) =>
        logs.forEach(async ({ args }) => {
          if (args.appId) {
            const eventOutput = args as MailOpenedEventOutput;
            callback(eventOutput.index, eventOutput.openedAt);
          }
        }),
    });
  }

  /**
   *  Listener for deleted mail event.
   *
   * @param {Address | null } receiver - The mail receiver address.
   * @param {BigInt | null } index - The index of the mail.
   * @param {Function} callback - The callback function.
   * @returns {WatchContractEventReturnType} A function that can be invoked to stop watching for new event logs.
   */
  public onDeleted(
    receiver: Address | null,
    index: bigint | null,
    callback: (index: bigint, deletedAt: bigint) => void,
  ): WatchContractEventReturnType {
    return this.publicClient.watchContractEvent({
      ...this.contractConfig,
      eventName: 'MailDeleted',
      args: { appId: this.appId, receiver, index },
      onLogs: (logs) =>
        logs.forEach(async ({ args }) => {
          if (args.appId) {
            const eventOutput = args as MailDeletedEventOutput;
            callback(eventOutput.index, eventOutput.deletedAt);
          }
        }),
    });
  }

  /**
   *  Listener for user added whitelist event.
   *
   * @param {Address | null } user - The whitelist user address.
   * @param {Address | null } whitelistedSender - The whitelisted sender address.
   * @param {Function} callback - The callback function.
   * @returns {WatchContractEventReturnType} A function that can be invoked to stop watching for new event logs.
   */
  public onUserAddedToWhitelist(
    user: Address | null,
    whitelistedSender: Address | null,
    callback: (user: Address, whitelistedSender: Address) => void,
  ): WatchContractEventReturnType {
    return this.publicClient.watchContractEvent({
      ...this.contractConfig,
      eventName: 'AddedToWhitelist',
      args: { appId: this.appId, user, whitelistedSender },
      onLogs: (logs) =>
        logs.forEach(async ({ args }) => {
          if (args.appId) {
            const eventOutput = args as AddedToWhitelistEventOutput;
            callback(eventOutput.user, eventOutput.whitelistedSender);
          }
        }),
    });
  }

  /**
   *  Listener for user removed whitelist event.
   *
   * @param {Address | null } user - The whitelist user address.
   * @param {Address | null } whitelistedSender - The whitelisted sender address.
   * @param {Function} callback - The callback function.
   * @returns {WatchContractEventReturnType} A function that can be invoked to stop watching for new event logs.
   */
  public onUserRemovedFromWhitelist(
    user: Address | null,
    whitelistedSender: Address | null,
    callback: (user: Address, whitelistedSender: Address) => void,
  ): WatchContractEventReturnType {
    return this.publicClient.watchContractEvent({
      ...this.contractConfig,
      eventName: 'RemovedFromWhitelist',
      args: { appId: this.appId, user, whitelistedSender },
      onLogs: (logs) =>
        logs.forEach(async ({ args }) => {
          if (args.appId) {
            const eventOutput = args as RemovedFromWhitelistEventOutput;
            callback(eventOutput.user, eventOutput.whitelistedSender);
          }
        }),
    });
  }
}

// TODO: create and put in a new method - can be used to also retrieve all sent mails
/*const allReceivedEvents = await this.contract.queryFilter(filter);
console.log('=============== Event ==================');
console.log(allReceivedEvents);
console.log('=============== End event ==================');*/
