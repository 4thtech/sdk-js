import { BigNumber } from 'ethers';
import { EncryptionMetaData } from './encryption.types';

export type MessageMetaData = {
  encryption?: EncryptionMetaData;
};

export type Message = {
  content: string;
};

export type EncryptedMessage = {
  content: string;
  metadata: {
    encryption: EncryptionMetaData;
  };
};

export type EncryptedSecretKeyData = {
  secretKey: string;
  metadata: {
    encryption: EncryptionMetaData;
    encoding: string;
  };
};

export type ReceivedMessage = {
  sender: string;
  content: string;
  sentAt: number;
  index: number;
  isDeleted: boolean;
};

export type Conversation = {
  hash: string;
  isGroup: boolean;
  name: string;
  creator: string;
  isOnlyCreatorAllowedToAddMembers: boolean;
  isEncrypted: boolean;
  members: string[];
};

export type ContractMessageOutput = [string, string, BigNumber, string, BigNumber, boolean] & {
  sender: string;
  content: string;
  sentAt: BigNumber;
  metadata: string;
  index: BigNumber;
  isDeleted: boolean;
};

export type ContractConversationOutput = [
  string,
  boolean,
  string,
  string,
  boolean,
  boolean,
  string[],
] & {
  hash: string;
  isGroup: boolean;
  name: string;
  creator: string;
  isOnlyCreatorAllowedToAddMembers: boolean;
  isEncrypted: boolean;
  members: string[];
};

export type ContractEncryptedSecretKeyDataOutput = [string, string] & {
  userWhoEncrypted: string;
  encryptedSecretKey: string;
};

export type MessageSentEventOutput = {
  sender: string;
  conversationHash: string;
  content: string;
  sentAt: BigNumber;
  metadata: string;
  index: BigNumber;
  isDeleted: boolean;
};
