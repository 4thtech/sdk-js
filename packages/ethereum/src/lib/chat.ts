import {
  Address,
  AppId,
  ContractConversationOutput,
  ContractConversationOutputs,
  ContractMessageOutputs,
  Conversation,
  ConversationHash,
  ConversationRemovedEventOutput,
  EthereumTransactionResponse,
  GroupConversationCreatedEventOutput,
  MemberAddedToConversationEventOutput,
  MemberRemovedFromConversationEventOutput,
  Message,
  MessageDeletedEventOutput,
  MessageMetaData,
  MessageSentEventOutput,
  ReceivedMessage,
  WalletClient,
} from '@4thtech-sdk/types';
import { ChatContract } from './contract/chat-contract';
import { Encryptor } from './encryptor';
import { getAddress, keccak256, toBytes, WatchContractEventReturnType } from 'viem';

/**
 * Configuration for creating an instance of the Chat.
 *
 * @property {WalletClient} walletClient - The WalletClient instance.
 * @property {AppId} appId - Optional application’s identifier.
 * @property {Encryptor} encryptor - Optional Encryptor service which is used for message encryption/decryption.
 */
export type ChatConfig = {
  walletClient: WalletClient;
  appId?: AppId;
  encryptor?: Encryptor;
};

/**
 * Class that handles sending, retrieving and listening for events related to chat on-chain storage.
 *
 * @extends ChatContract
 */
export class Chat extends ChatContract {
  constructor(config: ChatConfig) {
    super(config);
  }

  /**
   * Sends a message to a receiver.
   *
   * @param {string} receiver - The receiver of the message.
   * @param {Message} message - The message to be sent.
   * @param [encryptMessage=true] - Whether the message should be encrypted before sending.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async sendMessage(
    receiver: Address,
    message: Message,
    encryptMessage = true,
  ): Promise<EthereumTransactionResponse> {
    let { content } = message;
    let metaData: MessageMetaData = {};

    if (encryptMessage) {
      const encryption = await this.getEncryptionForOneToOneConversation(receiver);
      const encryptedMessage = await this.encryptMessage(message, encryption);

      content = encryptedMessage.content;
      metaData = encryptedMessage.metadata;
    }

    return this.sendContractTransaction({
      functionName: 'sendMessage',
      args: [
        this.appId,
        receiver,
        encryptMessage,
        content,
        this.encodeMetaData<MessageMetaData>(metaData),
      ],
      fee: await this.getAppRequiredFee(),
    });
  }

  /**
   * Adds a message to an existing conversation.
   *
   * @param {string} conversationHash - The target conversation's hash.
   * @param {Message} message - The message to be added to the conversation.
   * @param [encryptMessage=true] - Whether the message should be encrypted before sending.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async addMessageToConversation(
    conversationHash: ConversationHash,
    message: Message,
    encryptMessage = true,
  ): Promise<EthereumTransactionResponse> {
    let { content } = message;
    let metaData: MessageMetaData = {};

    if (encryptMessage) {
      const conversation = await this.fetchConversation(conversationHash); // TODO: read from cache
      const encryption = await this.getEncryptionForConversation(conversation);
      const encryptedMessage = await this.encryptMessage(message, encryption);

      content = encryptedMessage.content;
      metaData = encryptedMessage.metadata;
    }

    return this.sendContractTransaction({
      functionName: 'addMessageToConversation',
      args: [this.appId, conversationHash, content, this.encodeMetaData<MessageMetaData>(metaData)],
      fee: await this.getAppRequiredFee(),
    });
  }

  /**
   * Deletes a message from a conversation.
   *
   * @param {ConversationHash} conversationHash - The target conversation's hash.
   * @param {BigInt} index - The index of the message to be deleted in the conversation.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async deleteMessage(
    conversationHash: ConversationHash,
    index: bigint,
  ): Promise<EthereumTransactionResponse> {
    return this.sendContractTransaction({
      functionName: 'deleteMessage',
      args: [conversationHash, index],
    });
  }

  /**
   * Creates a new group conversation.
   *
   * @param {string} conversationName - The name of the new group conversation.
   * @param {boolean} isOnlyCreatorAllowedToAddMembers - Specifies whether only the creator can add members to the group conversation.
   * @param {boolean} isEncrypted - Specifies whether the group conversation should be encrypted.
   * @param {Address[]} members - The initial members of the group conversation.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async createGroupConversation(
    conversationName: string,
    isOnlyCreatorAllowedToAddMembers: boolean,
    isEncrypted: boolean,
    members: Address[],
  ): Promise<EthereumTransactionResponse> {
    let creatorEncryptedSecretKey = '';
    let membersEncryptedSecretKeys: string[] = [];

    if (isEncrypted) {
      const secretKey = await this.generateSecretKey();
      const creatorAddress = await this.getSignerAddress();

      creatorEncryptedSecretKey = await this.encryptSecretKey(secretKey, creatorAddress);
      membersEncryptedSecretKeys = await this.encryptSecretKeyForMembers(secretKey, members);
    }

    return this.sendContractTransaction({
      functionName: 'createGroupConversation',
      args: [
        this.appId,
        conversationName,
        isOnlyCreatorAllowedToAddMembers,
        isEncrypted,
        members,
        membersEncryptedSecretKeys,
        creatorEncryptedSecretKey,
      ],
    });
  }

  /**
   * Removes a conversation.
   *
   * @param {ConversationHash} conversationHash - The target conversation's hash.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async removeConversation(
    conversationHash: ConversationHash,
  ): Promise<EthereumTransactionResponse> {
    return this.sendContractTransaction({
      functionName: 'removeConversation',
      args: [this.appId, conversationHash],
    });
  }

  /**
   * Adds members to a group conversation.
   *
   * @param {ConversationHash} conversationHash - The target group conversation's hash.
   * @param {Address[]} members - The members to be added to the group conversation.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async addMembersToGroupConversation(
    conversationHash: ConversationHash,
    members: Address[],
  ): Promise<EthereumTransactionResponse> {
    let membersEncryptedSecretKeys: string[] = [];

    const conversation = await this.fetchConversation(conversationHash);
    if (conversation.isEncrypted) {
      const secretKey = await this.getEncryptionSecretKeyForGroupConversation(conversationHash);
      membersEncryptedSecretKeys = await this.encryptSecretKeyForMembers(secretKey, members);
    }

    return this.sendContractTransaction({
      functionName: 'addMembersToGroupConversation',
      args: [this.appId, conversationHash, members, membersEncryptedSecretKeys],
    });
  }

  /**
   * Removes a member from a group conversation.
   *
   * @param {ConversationHash} conversationHash - The target group conversation's hash.
   * @param {Address} member - The member to be removed from the group conversation.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async removeMemberFromGroupConversation(
    conversationHash: ConversationHash,
    member: Address,
  ): Promise<EthereumTransactionResponse> {
    return this.sendContractTransaction({
      functionName: 'removeMemberFromGroupConversation',
      args: [this.appId, conversationHash, member],
    });
  }

  /**
   * Removes members from a group conversation.
   *
   * @param {ConversationHash} conversationHash - The target group conversation's hash.
   * @param {Address[]} members - The members to be removed from the group conversation.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async removeMembersFromGroupConversation(
    conversationHash: ConversationHash,
    members: Address[],
  ): Promise<EthereumTransactionResponse> {
    return this.sendContractTransaction({
      functionName: 'removeMembersFromGroupConversation',
      args: [this.appId, conversationHash, members],
    });
  }

  /**
   * Calculates a conversation hash given two account addresses.
   *
   * @param {Address} account1 - The first account address.
   * @param {Address} account2 - The second account address.
   * @returns {ConversationHash} The calculated conversation hash.
   */
  public calculateConversationHash(account1: Address, account2: Address): ConversationHash {
    // Ensure the addresses are in a consistent format
    account1 = getAddress(account1);
    account2 = getAddress(account2);

    if (account1 < account2) {
      return keccak256(new Uint8Array([...toBytes(account1), ...toBytes(account2)]));
    }

    return keccak256(new Uint8Array([...toBytes(account2), ...toBytes(account1)]));
  }

  /**
   * Counts the number of messages in a conversation.
   *
   * @param {ConversationHash} conversationHash - The target conversation's hash.
   * @returns {Promise<BigInt>} A promise that resolves to the number of messages in the conversation.
   */
  public async countMessages(conversationHash: ConversationHash): Promise<bigint> {
    return this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getConversationMessagesCount',
      args: [conversationHash],
    });
  }

  /**
   * Fetches the conversation hashes related to an account.
   *
   * @param {Address} account - The target account.
   * @param {BigInt} pageNumber - The page number.
   * @param {BigInt} pageSize - The page size.
   * @returns {Promise<ConversationHash[]>} A promise that resolves to an array of conversation hashes related to the account.
   */
  public async fetchConversationHashesPaginated(
    account: Address,
    pageNumber: bigint,
    pageSize: bigint,
  ): Promise<readonly ConversationHash[]> {
    return this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getConversationHashesPaginated',
      args: [this.appId, account, pageNumber, pageSize],
    });
  }

  /**
   *  Counts the number of conversations for an account.
   *
   * @param {Address} account - The target account.
   * @returns {Promise<BigInt>} Number of conversations.
   */
  public async getConversationsCount(account: Address): Promise<bigint> {
    return this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getConversationsCount',
      args: [this.appId, account],
    });
  }

  /**
   * Fetches a conversation given its hash.
   *
   * @param {ConversationHash} conversationHash - The target conversation's hash.
   * @returns {Promise<Conversation>} A promise that resolves to the fetched conversation.
   */
  public async fetchConversation(conversationHash: ConversationHash): Promise<Conversation> {
    const contractConversationOutputs: ContractConversationOutput =
      await this.publicClient.readContract({
        ...this.contractConfig,
        functionName: 'getConversation',
        args: [conversationHash],
      });

    const conversation = await this.processContractConversationOutput(contractConversationOutputs);

    if (!conversation.isGroup) {
      conversation.members = [
        ...(await this.fetchConversationMembersPaginated(conversationHash, 1n, 2n)),
      ];
    }

    return conversation;
  }

  /**
   * Fetches all the conversations related to an account.
   *
   * @param {Address} account - The target account.
   * @param {BigInt} pageNumber - The page number.
   * @param {BigInt} pageSize - The page size.
   * @returns {Promise<Conversation[]>} A promise that resolves to an array of conversations related to the account.
   */
  public async fetchConversationsPaginated(
    account: Address,
    pageNumber: bigint,
    pageSize: bigint,
  ): Promise<Conversation[]> {
    const contractConversationOutputs: ContractConversationOutputs =
      await this.publicClient.readContract({
        ...this.contractConfig,
        functionName: 'getConversationsPaginated',
        args: [this.appId, account, pageNumber, pageSize],
      });

    return this.processContractConversationOutputs(contractConversationOutputs);
  }

  /**
   * Fetches the members of a conversation in a paginated manner.
   *
   * @param {ConversationHash} conversationHash - The target conversation's hash.
   * @param {BigInt} pageNumber - The page number.
   * @param {BigInt} pageSize - The page size.
   * @returns {Promise<Address[]>} A promise that resolves to an array of members of the conversation.
   */
  public async fetchConversationMembersPaginated(
    conversationHash: ConversationHash,
    pageNumber: bigint,
    pageSize: bigint,
  ): Promise<readonly Address[]> {
    return await this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getConversationMembersPaginated',
      args: [conversationHash, pageNumber, pageSize],
    });
  }

  /**
   *  Counts the number of members of a conversation.
   *
   * @param {ConversationHash} conversationHash - The conversation's hash.
   * @returns {Promise<BigInt>} Number of members.
   */
  public async getConversationMembersCount(conversationHash: ConversationHash): Promise<bigint> {
    return this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getConversationMembersCount',
      args: [conversationHash],
    });
  }

  /**
   * Fetches the messages of a conversation in a paginated manner.
   *
   * @param {ConversationHash} conversationHash - The target conversation's hash.
   * @param {BigInt} pageNumber - The page number.
   * @param {BigInt} pageSize - The page size.
   * @returns {Promise<ReceivedMessage[]>} A promise that resolves to an array of messages of the conversation.
   */
  public async fetchConversationMessagesPaginated(
    conversationHash: ConversationHash,
    pageNumber: bigint,
    pageSize: bigint,
  ): Promise<ReceivedMessage[]> {
    const contractMessageOutputs: ContractMessageOutputs = await this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getConversationMessagesPaginated',
      args: [conversationHash, pageNumber, pageSize],
    });

    return this.processContractMessageOutputs(contractMessageOutputs, conversationHash);
  }

  /**
   * Fetches the app IDs a user is related to.
   *
   * @param {Address} user - The target user address.
   * @param {BigInt} pageNumber - The page number.
   * @param {BigInt} pageSize - The page size.
   * @returns {Promise<AppId[]>} A promise that resolves to an array of app IDs the user is related to.
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
   * Listener for when a message is sent.
   *
   * @param {Address | null} sender - The sender of the message.
   * @param {ConversationHash | null} conversationHash - The hash of the conversation where the message belongs to.
   * @param {BigInt | null} index - The index of the message in the conversation.
   * @param {Function} callback - The callback function that is invoked when a message is sent.
   * @returns {WatchContractEventReturnType} A function that can be invoked to stop watching for new event logs
   */
  public onMessageSent(
    sender: Address | null,
    conversationHash: ConversationHash | null,
    index: bigint | null,
    callback: (conversationHash: ConversationHash, receivedMessage: ReceivedMessage) => void,
  ): WatchContractEventReturnType {
    return this.publicClient.watchContractEvent({
      ...this.contractConfig,
      eventName: 'MessageSent',
      args: { sender, conversationHash, index },
      onLogs: (logs) =>
        logs.forEach(async ({ args }) => {
          const eventOutput = args as MessageSentEventOutput;
          callback(
            eventOutput.conversationHash,
            await this.processContractMessageOutput(eventOutput, eventOutput.conversationHash),
          );
        }),
    });
  }

  /**
   * Listener for when a message is deleted.
   *
   * @param {Address | null} sender - The sender of the message.
   * @param {ConversationHash | null} conversationHash - The hash of the conversation where the message belongs to.
   * @param {BigInt | null} index - The index of the message in the conversation.
   * @param {Function} callback - The callback function that is invoked when a message is deleted.
   * @returns {WatchContractEventReturnType} A function that can be invoked to stop watching for new event logs
   */
  public onMessageDeleted(
    sender: Address | null,
    conversationHash: ConversationHash | null,
    index: bigint | null,
    callback: (conversationHash: ConversationHash, sender: Address, index: bigint) => void,
  ): WatchContractEventReturnType {
    return this.publicClient.watchContractEvent({
      ...this.contractConfig,
      eventName: 'MessageDeleted',
      args: { conversationHash, sender, index },
      onLogs: (logs) =>
        logs.forEach(async ({ args }) => {
          const eventOutput = args as MessageDeletedEventOutput;
          callback(eventOutput.conversationHash, eventOutput.sender, eventOutput.index);
        }),
    });
  }

  /**
   * Listener for when a group conversation is created.
   *
   * @param {Address | null} sender - The sender of the group creation (group creator).
   * @param {Function} callback - The callback function that is invoked when a group conversation is created.
   * @returns {WatchContractEventReturnType} A function that can be invoked to stop watching for new event logs
   */
  public onGroupConversationCreated(
    sender: Address | null,
    callback: (
      sender: Address,
      conversationHash: ConversationHash,
      conversationName: string,
      members: Address[],
    ) => void,
  ): WatchContractEventReturnType {
    return this.publicClient.watchContractEvent({
      ...this.contractConfig,
      eventName: 'GroupConversationCreated',
      args: { sender },
      onLogs: (logs) =>
        logs.forEach(async ({ args }) => {
          const eventOutput = args as GroupConversationCreatedEventOutput;
          callback(
            eventOutput.sender,
            eventOutput.conversationHash,
            eventOutput.conversationName,
            eventOutput.members,
          );
        }),
    });
  }

  /**
   * Listener for when a conversation is removed.
   *
   * @param {Address | null} sender - The sender of the conversation deletion (conversation creator).
   * @param {ConversationHash | null} conversationHash - The hash of the conversation being removed.
   * @param {Function} callback - The callback function that is invoked when a conversation is removed.
   * @returns {WatchContractEventReturnType} A function that can be invoked to stop watching for new event logs
   */
  public onConversationRemoved(
    sender: Address | null,
    conversationHash: ConversationHash | null,
    callback: (sender: Address, conversationHash: ConversationHash) => void,
  ): WatchContractEventReturnType {
    return this.publicClient.watchContractEvent({
      ...this.contractConfig,
      eventName: 'ConversationRemoved',
      args: { sender, conversationHash },
      onLogs: (logs) =>
        logs.forEach(async ({ args }) => {
          const eventOutput = args as ConversationRemovedEventOutput;
          callback(eventOutput.sender, eventOutput.conversationHash);
        }),
    });
  }

  /**
   * Listener for when a member is added to a conversation.
   *
   * @param {ConversationHash | null} conversationHash - The hash of the conversation to which a member is being added.
   * @param {Address | null} member - The member being added to the group conversation.
   * @param {Function} callback - The callback function that is invoked when a member is added to a group conversation.
   * @returns {WatchContractEventReturnType} A function that can be invoked to stop watching for new event logs
   */
  public onMemberAddedToConversation(
    conversationHash: ConversationHash | null,
    member: Address | null,
    callback: (conversationHash: ConversationHash, member: Address) => void,
  ): WatchContractEventReturnType {
    return this.publicClient.watchContractEvent({
      ...this.contractConfig,
      eventName: 'MemberAddedToConversation',
      args: { appId: this.appId, conversationHash, member },
      onLogs: (logs) =>
        logs.forEach(async ({ args }) => {
          const eventOutput = args as MemberAddedToConversationEventOutput;
          callback(eventOutput.conversationHash, eventOutput.member);
        }),
    });
  }

  /**
   * Listener for when a member is removed from a group conversation.
   *
   * @param {ConversationHash | null} conversationHash - The hash of the conversation from which a member is being removed.
   * @param {Address | null} member - The member being removed from the group conversation.
   * @param {Function} callback - The callback function that is invoked when a member is removed from a group conversation.
   * @returns {WatchContractEventReturnType} A function that can be invoked to stop watching for new event logs
   */
  public onMemberRemovedFromConversation(
    conversationHash: ConversationHash | null,
    member: Address | null,
    callback: (conversationHash: ConversationHash, member: Address) => void,
  ): WatchContractEventReturnType {
    return this.publicClient.watchContractEvent({
      ...this.contractConfig,
      eventName: 'MemberRemovedFromConversation',
      args: { appId: this.appId, conversationHash, member },
      onLogs: (logs) =>
        logs.forEach(async ({ args }) => {
          const eventOutput = args as MemberRemovedFromConversationEventOutput;
          callback(eventOutput.conversationHash, eventOutput.member);
        }),
    });
  }
}
