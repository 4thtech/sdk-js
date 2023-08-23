import {
  ContractMailOutput,
  Encryption,
  Envelope,
  EthereumTransactionResponse,
  Mailable,
  MailReadyChain,
  MailSendOptions,
  MailSendState,
  MailSentEventOutput,
  ReceivedEnvelope,
  RemoteFileInfo,
  Signer,
  TransactionHash,
} from '@4thtech-sdk/types';
import { BigNumber, BigNumberish } from 'ethers';
import { MailContract } from './contract/mail-contract';
import { RemoteStorageProvider } from '@4thtech-sdk/storage';
import { EncryptionHandler } from '@4thtech-sdk/encryption';

export type MailConfig = {
  signer: Signer;
  chain: MailReadyChain;
  remoteStorageProvider: RemoteStorageProvider;
  appId?: string;
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

    const populatedTx = await this.contract.populateTransaction['sendMail'](
      this.appId,
      options.envelope.receiver,
      storedEnvelope.URL,
      storedEnvelope.checksum,
      storedEnvelope.metadata,
    );

    // Track transaction state
    if (options.onStateChange) {
      options.onStateChange(MailSendState.SENDING_TRANSACTION);
    }

    return this.sendTransaction(populatedTx);
  }

  /**
   * Set opened time for a specific mail. This method can only perform a receiver of the mail.
   * @param {BigNumberish} mailIndex - The index of the mail to set opened time.
   * @returns {Promise<EthereumTransactionResponse>} Response of transaction.
   */
  public async setOpenedAt(mailIndex: BigNumberish): Promise<EthereumTransactionResponse> {
    const populatedTx = await this.contract.populateTransaction['setOpenedAt'](
      this.appId,
      mailIndex,
    );

    return this.sendTransaction(populatedTx);
  }

  /**
   *  Deletes a specific mail. This method can only perform a receiver of the mail.
   * @param {BigNumberish} mailIndex - The index of the mail to be deleted.
   * @returns {Promise<EthereumTransactionResponse>} Response of transaction.
   */
  public async deleteMail(mailIndex: BigNumberish): Promise<EthereumTransactionResponse> {
    const populatedTx = await this.contract.populateTransaction['deleteMail'](
      this.appId,
      mailIndex,
    );

    return this.sendTransaction(populatedTx);
  }

  /**
   *  Deletes multiple mails. This method can only perform a receiver of the mails.
   * @param {BigNumberish[]} mailIndexes - The indexes of mails to be deleted.
   * @returns {Promise<EthereumTransactionResponse>} Response of transaction.
   */
  public async deleteMails(mailIndexes: BigNumberish[]): Promise<EthereumTransactionResponse> {
    const populatedTx = await this.contract.populateTransaction['deleteMails'](
      this.appId,
      mailIndexes,
    );

    return this.sendTransaction(populatedTx);
  }

  /**
   *  Fetch a specific mail.
   * @param {string} receiver - The mail receiver address.
   * @param {BigNumberish} mailIndex - The index of the mail.
   * @returns {Promise<ReceivedEnvelope>} The received mail Envelope.
   */
  public async fetch(receiver: string, mailIndex: BigNumberish): Promise<ReceivedEnvelope> {
    const contractMailOutput: ContractMailOutput = await this.contract['getMail'](
      this.appId,
      receiver,
      mailIndex,
    );

    return this.processContractMailOutput(contractMailOutput, receiver);
  }

  /**
   *  Fetch all mails.
   * @param {string} receiver - The mail receiver address.
   * @returns {Promise<ReceivedEnvelope[]>} Array of received mail Envelopes.
   */
  public async fetchAll(receiver: string): Promise<ReceivedEnvelope[]> {
    const contractMailOutputs: ContractMailOutput[] = await this.contract['getMails'](
      this.appId,
      receiver,
    );

    return this.processContractMailOutputs(contractMailOutputs, receiver);
  }

  /**
   *  Fetch mails paginated.
   * @param {string} receiver - The mail receiver address.
   * @param {BigNumberish} pageNumber - The page number.
   * @param {BigNumberish} pageSize - The page size.
   * @returns {Promise<ReceivedEnvelope[]>} Array of received mail Envelopes.
   */
  public async fetchPaginated(
    receiver: string,
    pageNumber: BigNumberish,
    pageSize: BigNumberish,
  ): Promise<ReceivedEnvelope[]> {
    const contractMailOutputs: ContractMailOutput[] = await this.contract['getMailsPaginated'](
      this.appId,
      receiver,
      pageNumber,
      pageSize,
    );

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
   * @param {string} receiver - The mail receiver address.
   * @returns {Promise<BigNumber>} Number of mails.
   */
  public count(receiver: string): Promise<BigNumber> {
    return this.contract['getMailsCount'](this.appId, receiver);
  }

  /**
   *  Retrieves the user's App ID's.
   * @param {string} user - The user address.
   * @returns {Promise<string[]>} Array of App ID's.
   */
  public async getUserAppIds(user: string): Promise<string[]> {
    return this.contract['getUserAppIds'](user);
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
   * @param {string | null } sender - The mail sender address.
   * @param {string | null } receiver - The mail receiver address.
   * @param {Function} callback - The callback function.
   */
  public onNew(
    sender: string | null,
    receiver: string | null,
    callback: (envelope: ReceivedEnvelope) => void,
  ): void {
    const filter = this.contract.filters['MailSent'](null, sender, receiver);

    this.contract.on(
      filter,
      async (
        appId,
        sender,
        receiver,
        envelopeUrl,
        envelopeChecksum,
        sentAt,
        openedAt,
        metadata,
        index,
        isDeleted,
      ) => {
        const eventOutput: MailSentEventOutput = {
          appId,
          sender,
          receiver,
          envelopeUrl,
          envelopeChecksum,
          sentAt,
          openedAt,
          metadata,
          index,
          isDeleted,
        };

        if (appId === this.appId) {
          callback(await this.processContractMailOutput(eventOutput, receiver));
        }
      },
    );
  }

  /**
   *  Listener for opened mail event.
   * @param {string | null } receiver - The mail receiver address.
   * @param {BigNumberish | null } index - The index of the mail.
   * @param {Function} callback - The callback function.
   */
  public onOpened(
    receiver: string | null,
    index: BigNumberish | null,
    callback: (index: number, openedAt: number) => void,
  ): void {
    const filter = this.contract.filters['MailOpened'](this.appId, receiver, index);

    this.contract.on(filter, (appId, receiver, index, openedAt) => {
      callback(index.toNumber(), openedAt.toNumber());
    });
  }

  /**
   *  Listener for deleted mail event.
   * @param {string | null } receiver - The mail receiver address.
   * @param {BigNumberish | null } index - The index of the mail.
   * @param {Function} callback - The callback function.
   */
  public onDeleted(
    receiver: string | null,
    index: BigNumberish | null,
    callback: (index: number, deletedAt: number) => void,
  ): void {
    const filter = this.contract.filters['MailDeleted'](this.appId, receiver, index);

    this.contract.on(filter, (appId, receiver, index, deletedAt) => {
      callback(index.toNumber(), deletedAt.toNumber());
    });
  }
}

// TODO: create and put in a new method - can be used to also retrieve all sent mails
/*const allReceivedEvents = await this.contract.queryFilter(filter);
console.log('=============== Event ==================');
console.log(allReceivedEvents);
console.log('=============== End event ==================');*/
