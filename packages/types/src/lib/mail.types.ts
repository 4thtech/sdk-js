import { BigNumber, BigNumberish } from 'ethers';
import { EthereumTransactionResponse } from './ethereum.types';
import { LocalFileInfo, RemoteFileInfo } from './storage.types';
import { Encryption } from './encryption.types';

export type Attachment = LocalFileInfo | RemoteFileInfo;

export type TransactionHash = `0x${string}` | string;

export type EnvelopeContent = {
  subject: string;
  body?: string;
  attachments?: Attachment[];
};

export type Envelope = {
  content: EnvelopeContent;
  receiver: string;
  sender: string;
};

export type ReceivedEnvelope = Envelope & {
  sentAt: number;
  openedAt: number;
  index: number;
  isDeleted: boolean;
  metadata: {
    URL: string;
    checksum: string;
    transactionHash: TransactionHash | undefined;
  };
};

export interface Mailable {
  send(options: MailSendOptions): Promise<EthereumTransactionResponse>;

  setOpenedAt(mailIndex: BigNumberish): Promise<EthereumTransactionResponse>;

  deleteMail(mailIndex: BigNumberish): Promise<EthereumTransactionResponse>;

  deleteMails(mailIndexes: BigNumberish[]): Promise<EthereumTransactionResponse>;

  fetch(receiver: string, mailIndex: BigNumberish): Promise<ReceivedEnvelope>;

  fetchAll(receiver: string): Promise<ReceivedEnvelope[]>;

  fetchPaginated(receiver: string, page: number, pageSize: number): Promise<ReceivedEnvelope[]>;

  fetchByTransactionHash(transactionHash: TransactionHash): Promise<ReceivedEnvelope>;

  count(receiver: string): Promise<BigNumber>;

  getUserAppIds(user: string): Promise<string[]>;

  downloadAttachment(attachment: RemoteFileInfo): Promise<ArrayBufferLike>;

  onNew(
    sender: string | null,
    receiver: string | null,
    callback: (envelope: ReceivedEnvelope) => void,
  ): void;

  onOpened(
    receiver: string | null,
    index: BigNumberish | null,
    callback: (index: number, openedAt: number) => void,
  ): void;

  onDeleted(
    receiver: string | null,
    index: BigNumberish | null,
    callback: (index: number, deletedAt: number) => void,
  ): void;
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

export type ContractMailOutput = [
  string,
  string,
  string,
  BigNumber,
  BigNumber,
  string,
  BigNumber,
  boolean,
] & {
  sender: string;
  envelopeUrl: string;
  envelopeChecksum: string;
  sentAt: BigNumber;
  openedAt: BigNumber;
  metadata: string;
  index: BigNumber;
  isDeleted: boolean;
};

export type MailSentEventOutput = {
  appId: string;
  sender: string;
  receiver: string;
  envelopeUrl: string;
  envelopeChecksum: string;
  sentAt: BigNumber;
  openedAt: BigNumber;
  metadata: string;
  index: BigNumber;
  isDeleted: boolean;
};

export type MailOpenedEventOutput = {
  appId: string;
  receiver: string;
  index: BigNumber;
  openedAt: BigNumber;
};

export type MailDeletedEventOutput = {
  appId: string;
  receiver: string;
  index: BigNumber;
  deletedAt: BigNumber;
};

export type EnvelopeTransactionFilter = {
  sender: string;
  receiver: string;
  envelopeUrl: string;
  envelopeChecksum: string;
  sentAt: BigNumber;
  metadata: string;
  index: BigNumber;
};
