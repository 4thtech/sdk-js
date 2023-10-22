import { Address, AppId, EthereumTransactionResponse, TransactionHash } from './ethereum.types';
import { LocalFileInfo, RemoteFileInfo } from './storage.types';
import { Encryption } from './encryption.types';
import { WatchContractEventReturnType } from 'viem';

export type Attachment = LocalFileInfo | RemoteFileInfo;

export type Envelope = {
  content: {
    subject: string;
    body?: string;
    attachments?: Attachment[];
  };
  receiver: Address;
  sender: Address;
};

export type ReceivedEnvelope = Envelope & {
  sentAt: bigint;
  openedAt: bigint;
  index: bigint;
  isDeleted: boolean;
  metadata: {
    URL: string;
    checksum: string;
    transactionHash: TransactionHash | undefined;
  };
};

export interface Mailable {
  send(options: MailSendOptions): Promise<EthereumTransactionResponse>;

  setOpenedAt(mailIndex: bigint): Promise<EthereumTransactionResponse>;

  deleteMail(mailIndex: bigint): Promise<EthereumTransactionResponse>;

  deleteMails(mailIndexes: bigint[]): Promise<EthereumTransactionResponse>;

  fetch(receiver: Address, mailIndex: bigint): Promise<ReceivedEnvelope>;

  fetchAll(receiver: Address): Promise<ReceivedEnvelope[]>;

  fetchPaginated(receiver: Address, page: bigint, pageSize: bigint): Promise<ReceivedEnvelope[]>;

  fetchByTransactionHash(transactionHash: TransactionHash): Promise<ReceivedEnvelope>;

  count(receiver: Address): Promise<bigint>;

  getUserAppIds(user: Address): Promise<ReadonlyArray<AppId>>;

  downloadAttachment(attachment: RemoteFileInfo): Promise<ArrayBufferLike>;

  onNew(
    sender: Address | null,
    receiver: Address | null,
    callback: (envelope: ReceivedEnvelope) => void,
  ): WatchContractEventReturnType;

  onOpened(
    receiver: Address | null,
    index: bigint | null,
    callback: (index: bigint, openedAt: bigint) => void,
  ): WatchContractEventReturnType;

  onDeleted(
    receiver: Address | null,
    index: bigint | null,
    callback: (index: bigint, deletedAt: bigint) => void,
  ): WatchContractEventReturnType;
}

export type MailSendOptions = {
  envelope: Envelope;
  encryption?: Encryption;
  onStateChange?: (state: MailSendState) => void;
  onUploadProgress?: (progressInfo: FileProgressInfo) => void;
};

export enum MailSendState {
  ENCRYPTING_STORING_ATTACHMENTS = 'ENCRYPTING_STORING_ATTACHMENTS',
  STORING_ATTACHMENTS = 'STORING_ATTACHMENTS',
  ENCRYPTING_STORING_ENVELOPE = 'ENCRYPTING_STORING_ENVELOPE',
  STORING_ENVELOPE = 'STORING_ENVELOPE',
  SENDING_TRANSACTION = 'SENDING_TRANSACTION',
}

export type FileProgressInfo = {
  percent: number; // Value between 0 and 100
  fileName?: string;
};

export type ContractMailOutput = {
  sender: Address;
  envelopeUrl: string;
  envelopeChecksum: string;
  sentAt: bigint;
  openedAt: bigint;
  metadata: string;
  index: bigint;
  isDeleted: boolean;
};

export type ContractMailOutputs = ReadonlyArray<ContractMailOutput>;

export type MailSentEventOutput = {
  appId: AppId;
  sender: Address;
  receiver: Address;
  envelopeUrl: string;
  envelopeChecksum: string;
  sentAt: bigint;
  openedAt: bigint;
  metadata: string;
  index: bigint;
  isDeleted: boolean;
};

export type MailOpenedEventOutput = {
  appId: AppId;
  receiver: Address;
  index: bigint;
  openedAt: bigint;
};

export type MailDeletedEventOutput = {
  appId: AppId;
  receiver: Address;
  index: bigint;
  deletedAt: bigint;
};

export type EnvelopeTransactionFilter = {
  sender: Address;
  receiver: Address;
  envelopeUrl: string;
  envelopeChecksum: string;
  sentAt: bigint;
  metadata: string;
  index: bigint;
};
