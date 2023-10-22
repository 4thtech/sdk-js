import {
  Address,
  Attachment,
  ContractMailOutput,
  ContractMailOutputs,
  Envelope,
  EnvelopeTransactionFilter,
  isLocalFileInfo,
  isRemoteFileInfo,
  LocalFileInfo,
  MailSendOptions,
  MailSendState,
  MailSentEventOutput,
  PromiseFulfilledResult,
  ReceivedEnvelope,
  RemoteFileInfo,
  TransactionHash,
} from '@4thtech-sdk/types';
import { mailsAbi } from './abi/mails-abi';
import { RemoteStorage } from '@4thtech-sdk/storage';
import { MailConfig } from '../mail';
import { FeeCollectorContract } from './fee-collector-contract';
import { validateChainContractExistence } from '../utils';

export class MailContract extends FeeCollectorContract<typeof mailsAbi> {
  protected remoteStorage: RemoteStorage;

  constructor(config: MailConfig) {
    const { walletClient, remoteStorageProvider, appId, encryptionHandler } = config;

    validateChainContractExistence(walletClient.chain.contracts, 'mail');

    super({
      walletClient,
      contractConfig: {
        address: walletClient.chain.contracts.mail.address,
        abi: mailsAbi,
      },
      appId,
    });

    this.remoteStorage = new RemoteStorage({
      storageProvider: remoteStorageProvider,
      encryptionHandler,
    });
  }

  protected async processContractMailOutputs(
    contractMailOutputs: ContractMailOutputs,
    receiver: Address,
  ): Promise<ReceivedEnvelope[]> {
    const processedOutputs = await Promise.allSettled(
      contractMailOutputs.map(async (contractMailOutput) => {
        return this.processContractMailOutput(contractMailOutput, receiver);
      }),
    );

    // TODO: what to do with rejected promises??
    return processedOutputs
      .filter((output) => output.status === 'fulfilled')
      .map((output) => (output as PromiseFulfilledResult<ReceivedEnvelope>).value);
  }

  protected async processContractMailOutput(
    contractMailOutput: ContractMailOutput | MailSentEventOutput,
    receiver: Address,
  ): Promise<ReceivedEnvelope> {
    const { sender, envelopeUrl, envelopeChecksum, sentAt, openedAt, metadata, index, isDeleted } =
      contractMailOutput;

    const remoteEnvelope: RemoteFileInfo = {
      name: '',
      URL: envelopeUrl,
      checksum: envelopeChecksum,
      metadata: metadata,
    };

    const [envelopeResult, envelopeTxHashResult] = await Promise.allSettled([
      this.retrieveEnvelope(remoteEnvelope),
      this.getEnvelopeTransactionHash({
        sender,
        receiver,
        envelopeUrl,
        envelopeChecksum,
        sentAt,
        metadata,
        index,
      }),
    ]);

    if (envelopeResult.status === 'rejected') {
      throw envelopeResult.reason;
    }

    const envelopeTxHash =
      envelopeTxHashResult.status === 'fulfilled' ? envelopeTxHashResult.value : undefined;

    return {
      content: envelopeResult.value.content,
      receiver,
      sender,
      sentAt,
      openedAt,
      index,
      isDeleted,
      metadata: {
        URL: envelopeUrl,
        checksum: envelopeChecksum,
        transactionHash: envelopeTxHash,
      },
    };
  }

  protected async storeEnvelope(options: MailSendOptions): Promise<RemoteFileInfo> {
    // Store attachments
    if (options.envelope.content.attachments?.length) {
      const [localFiles, remoteFiles] = this.separateLocalAndRemoteAttachments(
        options.envelope.content.attachments,
      );

      // Track storing attachments state
      options.onStateChange?.(
        options.encryption
          ? MailSendState.ENCRYPTING_STORING_ATTACHMENTS
          : MailSendState.STORING_ATTACHMENTS,
      );

      const storedLocalFiles = await this.remoteStorage.store(
        localFiles,
        options.encryption,
        options.onUploadProgress,
      );

      options.envelope.content.attachments = remoteFiles.concat(storedLocalFiles);
    }

    // Track storing envelope state
    options.onStateChange?.(
      options.encryption
        ? MailSendState.ENCRYPTING_STORING_ENVELOPE
        : MailSendState.STORING_ENVELOPE,
    );

    const storedEnvelope = await this.remoteStorage.store(
      {
        name: 'envelope.json',
        content: Buffer.from(JSON.stringify(options.envelope)),
      },
      options.encryption,
      options.onUploadProgress,
    );

    if (Array.isArray(storedEnvelope)) {
      throw new Error('An array was not expected, but received one.');
    }

    return storedEnvelope;
  }

  protected async getEnvelopeByTransactionHash(
    transactionHash: TransactionHash,
    receiver?: Address,
  ): Promise<ReceivedEnvelope> {
    const allMatchingEvents = await this.publicClient.getContractEvents({
      ...this.contractConfig,
      eventName: 'MailSent',
      args: {
        receiver,
      },
      fromBlock: 'earliest',
      strict: true,
    });

    const event = allMatchingEvents.find((event) => {
      return transactionHash === event.transactionHash;
    });

    if (!event) {
      throw new Error('Mail with this transaction hash was not sent.');
    }

    return this.processContractMailOutput(event.args, event.args.receiver);
  }

  private separateLocalAndRemoteAttachments(
    attachments: Attachment[],
  ): [LocalFileInfo[], RemoteFileInfo[]] {
    const localFiles: LocalFileInfo[] = [];
    const remoteFiles: RemoteFileInfo[] = [];

    attachments.forEach((attachment) => {
      if (isLocalFileInfo(attachment)) {
        localFiles.push(attachment);
      } else if (isRemoteFileInfo(attachment)) {
        remoteFiles.push(attachment);
      }
    });

    return [[...localFiles], [...remoteFiles]];
  }

  private async retrieveEnvelope(remoteFileInfo: RemoteFileInfo): Promise<Envelope> {
    // TODO: handle error if it's not valid JSON
    // TODO: check checksum match; or check it in storage which would be better
    return JSON.parse(Buffer.from(await this.remoteStorage.retrieve(remoteFileInfo)).toString());
  }

  private async getEnvelopeTransactionHash(
    filterData: EnvelopeTransactionFilter,
  ): Promise<TransactionHash | undefined> {
    const allMatchingEvents = await this.publicClient.getContractEvents({
      ...this.contractConfig,
      eventName: 'MailSent',
      args: {
        sender: filterData.sender,
        receiver: filterData.receiver,
        index: filterData.index,
      },
      fromBlock: 'earliest',
      strict: true,
    });

    const event = allMatchingEvents.find(({ args: { appId, envelopeUrl, envelopeChecksum } }) => {
      return (
        appId === this.appId &&
        envelopeUrl === filterData.envelopeUrl &&
        envelopeChecksum === filterData.envelopeChecksum
      );
    });

    return event?.transactionHash;
  }
}
