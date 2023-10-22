import {
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
  TransactionHash,
  WalletClient,
} from '@4thtech-sdk/types';
import { MailContract } from './contract/mail-contract';
import { RemoteStorageProvider } from '@4thtech-sdk/storage';
import { EncryptionHandler } from '@4thtech-sdk/encryption';
import { WatchContractEventReturnType } from 'viem';

export type MailConfig = {
  walletClient: WalletClient;
  remoteStorageProvider: RemoteStorageProvider;
  appId?: AppId;
  encryptionHandler?: EncryptionHandler;
};

/**
 * Class that handles sending, retrieving and listening for events related to mail storage on-chain.
 * @extends MailContract
 * @implements Mailable
 */
export class Mail extends MailContract implements Mailable {
  /**
   * Initialize a new mail client.
   * @param {MailConfig} config - The configuration for the mail client.
   */
  constructor(config: MailConfig) {
    super(config);
  }

  /**
   * Send a new mail.
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
   *  Deletes a specific mail. This method can only perform a receiver of the mail.
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
   *  Fetch a specific mail.
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
   *  Fetch all mails.
   * @param {Address} receiver - The mail receiver address.
   * @returns {Promise<ReceivedEnvelope[]>} Array of received mail Envelopes.
   */
  public async fetchAll(receiver: Address): Promise<ReceivedEnvelope[]> {
    const contractMailOutputs: ContractMailOutputs = await this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getMails',
      args: [this.appId, receiver],
    });

    return this.processContractMailOutputs(contractMailOutputs, receiver);
  }

  /**
   *  Fetch mails paginated.
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
   * @param {TransactionHash} transactionHash - The transaction hash.
   * @returns {Promise<ReceivedEnvelope>} The received mail Envelope.
   */
  public async fetchByTransactionHash(transactionHash: TransactionHash): Promise<ReceivedEnvelope> {
    return this.getEnvelopeByTransactionHash(transactionHash);
  }

  /**
   *  Counts the number of mails of a receiver.
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
   *  Retrieves the user's App ID's.
   * @param {Address} user - The user address.
   * @returns {Promise<AppId[]>} Array of App ID's.
   */
  public async getUserAppIds(user: Address): Promise<readonly AppId[]> {
    return this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getUserAppIds',
      args: [user],
    });
  }

  /**
   *  Downloads an attachment of a mail.
   * @param {RemoteFileInfo} attachment - The attachment information.
   * @returns {Promise<ArrayBufferLike>} Array buffer of the downloaded file.
   */
  public downloadAttachment(attachment: RemoteFileInfo): Promise<ArrayBufferLike> {
    return this.remoteStorage.retrieve(attachment);
  }

  /**
   *  Listener for new mail event.
   * @param {Address | null } sender - The mail sender address.
   * @param {Address | null } receiver - The mail receiver address.
   * @param {Function} callback - The callback function.
   * @returns {WatchContractEventReturnType} A function that can be invoked to stop watching for new event logs
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
   * @param {Address | null } receiver - The mail receiver address.
   * @param {BigInt | null } index - The index of the mail.
   * @param {Function} callback - The callback function.
   * @returns {WatchContractEventReturnType} A function that can be invoked to stop watching for new event logs
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
   * @param {Address | null } receiver - The mail receiver address.
   * @param {BigInt | null } index - The index of the mail.
   * @param {Function} callback - The callback function.
   * @returns {WatchContractEventReturnType} A function that can be invoked to stop watching for new event logs
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
}

// TODO: create and put in a new method - can be used to also retrieve all sent mails
/*const allReceivedEvents = await this.contract.queryFilter(filter);
console.log('=============== Event ==================');
console.log(allReceivedEvents);
console.log('=============== End event ==================');*/
