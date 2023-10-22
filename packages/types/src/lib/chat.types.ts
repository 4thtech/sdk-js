import { EncryptionMetaData } from './encryption.types';
import { Address, AppId } from './ethereum.types';

export type ConversationHash = `0x${string}`;

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
  sender: Address;
  content: string;
  sentAt: bigint;
  index: bigint;
  isDeleted: boolean;
};

export type Conversation = {
  hash: ConversationHash;
  isGroup: boolean;
  name: string;
  creator: Address;
  isOnlyCreatorAllowedToAddMembers: boolean;
  isEncrypted: boolean;
  members: readonly Address[];
};

export type ContractMessageOutput = {
  sender: Address;
  content: string;
  sentAt: bigint;
  metadata: string;
  index: bigint;
  isDeleted: boolean;
};

export type ContractMessageOutputs = ReadonlyArray<ContractMessageOutput>;

export type ContractConversationOutput = {
  hash: ConversationHash;
  isGroup: boolean;
  name: string;
  creator: Address;
  isOnlyCreatorAllowedToAddMembers: boolean;
  isEncrypted: boolean;
  members: readonly Address[];
};

export type ContractConversationOutputs = ReadonlyArray<ContractConversationOutput>;

export type ContractEncryptedSecretKeyDataOutput = {
  userWhoEncrypted: Address;
  encryptedSecretKey: string;
};

export type MessageSentEventOutput = {
  sender: Address;
  conversationHash: ConversationHash;
  content: string;
  sentAt: bigint;
  metadata: string;
  index: bigint;
  isDeleted: boolean;
};

export type MessageDeletedEventOutput = {
  conversationHash: ConversationHash;
  sender: Address;
  index: bigint;
};

export type GroupConversationCreatedEventOutput = {
  sender: Address;
  conversationHash: ConversationHash;
  conversationName: string;
  members: Address[];
};

export type ConversationRemovedEventOutput = {
  sender: Address;
  conversationHash: ConversationHash;
};

export type MemberAddedToConversationEventOutput = {
  appId: AppId;
  conversationHash: ConversationHash;
  member: Address;
};

export type MemberRemovedFromConversationEventOutput = {
  appId: AppId;
  conversationHash: ConversationHash;
  member: Address;
};
