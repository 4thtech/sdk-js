import {
  Attachment,
  ContractMailOutput,
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
import mailsAbi from './abi/mails-abi.json';
import { RemoteStorage } from '@4thtech-sdk/storage';
import { MailConfig } from '@4thtech-sdk/ethereum';
import { FeeCollectorContract } from './fee-collector-contract';

export class MailContract extends FeeCollectorContract {
  protected remoteStorage: RemoteStorage;

  constructor(config: MailConfig) {
    const { signer, chain, remoteStorageProvider, appId, encryptionHandler } = config;

    super({
      signer,
      contractParams: {
        address: chain.contracts.mail.address,
        abi: chain.contracts.mail.abi ?? JSON.stringify(mailsAbi),
      },
      chain,
      appId,
    });

    this.remoteStorage = new RemoteStorage({
      storageProvider: remoteStorageProvider,
      encryptionHandler,
    });
  }

  protected async processContractMailOutputs(
    contractMailOutputs: ContractMailOutput[],
    receiver: string,
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
    receiver: string,
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
      sentAt: sentAt.toNumber(),
      openedAt: openedAt.toNumber(),
      index: index.toNumber(),
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
  ): Promise<ReceivedEnvelope> {
    const filter = this.contract.filters['MailSent']();
    const allReceivedEvents = await this.contract.queryFilter(filter);

    const filtered = allReceivedEvents.filter(
      (
        event,
      ): event is Exclude<
        typeof event,
        {
          args: null;
        }
      > => event.transactionHash === transactionHash && event.args !== null,
    );

    if (!filtered[0].args) {
      throw new Error('Mail with this transaction hash was not sent.');
    }

    const {
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
    } = filtered[0].args;

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

    return this.processContractMailOutput(eventOutput, receiver);
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
  ): Promise<TransactionHash> {
    const filter = this.contract.filters['MailSent'](
      null,
      filterData.sender,
      filterData.receiver,
      null,
      null,
      null,
      null,
      null,
      filterData.index,
    );
    const allReceivedEvents = await this.contract.queryFilter(filter);

    const filtered = allReceivedEvents.filter((event) => {
      if (!event.args) {
        return;
      }
      return (
        event.args['appId'] === this.appId &&
        event.args['envelopeUrl'] === filterData.envelopeUrl &&
        event.args['envelopeChecksum'] === filterData.envelopeChecksum
      );
    });

    return filtered[0].transactionHash as TransactionHash;
  }
}
