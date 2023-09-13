import {
  ChatReadyChain,
  ContractConversationOutput,
  ContractMessageOutput,
  Conversation,
  EthereumTransactionResponse,
  Message,
  MessageMetaData,
  MessageSentEventOutput,
  ReceivedMessage,
  Signer,
} from '@4thtech-sdk/types';
import { EncryptionHandler } from '@4thtech-sdk/encryption';
import { ChatContract } from './contract/chat-contract';
import { BigNumber, BigNumberish } from 'ethers';
import { arrayify, getAddress, keccak256 } from 'ethers/lib/utils';

/**
 * Configuration for the Chat class.
 *
 * @typedef {Object} ChatConfig
 * @property {Signer} signer The signer instance.
 * @property {ChatReadyChain} chain A chat-ready blockchain instance.
 * @property {string} appId The application’s identifier.
 * @property {EncryptionHandler} encryptionHandler A handler for message encryption.
 */
export type ChatConfig = {
  signer: Signer;
  chain: ChatReadyChain;
  appId?: string;
  encryptionHandler?: EncryptionHandler;
};

/**
 * Class that handles sending, retrieving and listening for events related to chat storage on-chain.
 * @extends ChatContract
 */
export class Chat extends ChatContract {
  constructor(config: ChatConfig) {
    super(config);
  }

  /**
   * Sends a message to a receiver.
   *
   * @param {string} receiver The receiver of the message.
   * @param {Message} message The message to be sent.
   * @param {boolean} [encryptMessage=true] Whether the message should be encrypted before sending. Default is true.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async sendMessage(
    receiver: string,
    message: Message,
    encryptMessage = true,
  ): Promise<EthereumTransactionResponse> {
    const metadata: MessageMetaData = {};
    if (encryptMessage) {
      // TODO: initialize encryptor aes encryption (ECDH)
      // message = await this.encryptMessage(message, encryption);
    }

    const populatedTx = await this.contract.populateTransaction['sendMessage'](
      this.appId,
      receiver,
      message.content,
      metadata,
    );

    await this.appendAppRequiredFee(populatedTx);

    return this.sendTransaction(populatedTx);
  }

  /**
   * Adds a message to an existing conversation.
   *
   * @param {string} conversationHash The target conversation's hash.
   * @param {Message} message The message to be added to the conversation.
   * @param {boolean} [encryptMessage=true] Whether the message should be encrypted before sending. Default is true.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async addMessageToConversation(
    conversationHash: string,
    message: Message,
    encryptMessage = true,
  ): Promise<EthereumTransactionResponse> {
    const metadata: MessageMetaData = {};
    if (encryptMessage) {
      // TODO: initialize encryption;
      //  - set aes encryption if it is a group conversation
      //  - otherwise set encryptor aes encryption (ECDH)
      // message = await this.encryptMessage(message, encryption);
    }

    const populatedTx = await this.contract.populateTransaction['addMessageToConversation'](
      this.appId,
      conversationHash,
      message.content,
      metadata,
    );

    await this.appendAppRequiredFee(populatedTx);

    return this.sendTransaction(populatedTx);
  }

  /**
   * Deletes a message from a conversation.
   *
   * @param {string} conversationHash The target conversation's hash.
   * @param {BigNumberish} index The index of the message to be deleted in the conversation.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async deleteMessage(
    conversationHash: string,
    index: BigNumberish,
  ): Promise<EthereumTransactionResponse> {
    const populatedTx = await this.contract.populateTransaction['deleteMessage'](
      conversationHash,
      index,
    );

    return this.sendTransaction(populatedTx);
  }

  /**
   * Creates a new group conversation.
   *
   * @param {string} conversationName The name of the new group conversation.
   * @param {boolean} isOnlyCreatorAllowedToAddMembers Specifies whether only the creator can add members to the group conversation.
   * @param {string[]} members The initial members of the group conversation.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async createGroupConversation(
    conversationName: string,
    isOnlyCreatorAllowedToAddMembers: boolean,
    members: string[],
  ): Promise<EthereumTransactionResponse> {
    // TODO: randomly generate secret key and encrypt it for each member
    const creatorEncryptedSecretKey = '';
    const membersEncryptedSecretKeys: string[] = [];

    const populatedTx = await this.contract.populateTransaction['createGroupConversation'](
      this.appId,
      conversationName,
      isOnlyCreatorAllowedToAddMembers,
      members,
      membersEncryptedSecretKeys,
      creatorEncryptedSecretKey,
    );

    return this.sendTransaction(populatedTx);
  }

  /**
   * Removes a conversation.
   *
   * @param {string} conversationHash The target conversation's hash.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async removeConversation(conversationHash: string): Promise<EthereumTransactionResponse> {
    const populatedTx = await this.contract.populateTransaction['removeConversation'](
      this.appId,
      conversationHash,
    );

    return this.sendTransaction(populatedTx);
  }

  /**
   * Adds members to a group conversation.
   *
   * @param {string} conversationHash The target group conversation's hash.
   * @param {string[]} members The members to be added to the group conversation.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async addMembersToGroupConversation(
    conversationHash: string,
    members: string[],
  ): Promise<EthereumTransactionResponse> {
    // TODO: retrieve conversation secret key and encrypt it for each member
    const membersEncryptedSecretKeys: string[] = [];

    const populatedTx = await this.contract.populateTransaction['addMembersToGroupConversation'](
      this.appId,
      conversationHash,
      members,
      membersEncryptedSecretKeys,
    );

    return this.sendTransaction(populatedTx);
  }

  /**
   * Removes a member from a group conversation.
   *
   * @param {string} conversationHash The target group conversation's hash.
   * @param {string} member The member to be removed from the group conversation.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async removeMemberFromGroupConversation(
    conversationHash: string,
    member: string,
  ): Promise<EthereumTransactionResponse> {
    const populatedTx = await this.contract.populateTransaction[
      'removeMemberFromGroupConversation'
    ](this.appId, conversationHash, member);

    return this.sendTransaction(populatedTx);
  }

  /**
   * Removes members from a group conversation.
   *
   * @param {string} conversationHash The target group conversation's hash.
   * @param {string[]} members The members to be removed from the group conversation.
   * @returns {Promise<EthereumTransactionResponse>} A promise that represents the Ethereum transaction response.
   */
  public async removeMembersFromGroupConversation(
    conversationHash: string,
    members: string[],
  ): Promise<EthereumTransactionResponse> {
    const populatedTx = await this.contract.populateTransaction[
      'removeMembersFromGroupConversation'
    ](this.appId, conversationHash, members);

    return this.sendTransaction(populatedTx);
  }

  /**
   * Calculates a conversation hash given two account addresses.
   *
   * @param {string} account1 The first account address.
   * @param {string} account2 The second account address.
   * @returns {string} The calculated conversation hash.
   */
  public calculateConversationHash(account1: string, account2: string): string {
    // Ensure the addresses are in a consistent format
    account1 = getAddress(account1);
    account2 = getAddress(account2);

    if (account1 < account2) {
      return keccak256(new Uint8Array([...arrayify(account1), ...arrayify(account2)]));
    }

    return keccak256(new Uint8Array([...arrayify(account2), ...arrayify(account1)]));
  }

  /**
   * Counts the number of messages in a conversation.
   *
   * @param {string} conversationHash The target conversation's hash.
   * @returns {Promise<BigNumber>} A promise that resolves to the number of messages in the conversation.
   */
  public async countMessages(conversationHash: string): Promise<BigNumber> {
    return this.contract['getMessagesCount'](conversationHash);
  }

  /**
   * Fetches the conversation hashes related to an account.
   *
   * @param {string} account The target account.
   * @returns {Promise<string[]>} A promise that resolves to an array of conversation hashes related to the account.
   */
  public async fetchConversationHashes(account: string): Promise<string[]> {
    return this.contract['getConversationHashes'](this.appId, account);
  }

  /**
   * Fetches a conversation given its hash.
   *
   * @param {string} conversationHash The target conversation's hash.
   * @returns {Promise<Conversation>} A promise that resolves to the fetched conversation.
   */
  public async fetchConversation(conversationHash: string): Promise<Conversation> {
    const contactConversationOutput: ContractConversationOutput = await this.contract[
      'getConversation'
    ](conversationHash);

    return this.processContractConversationOutput(contactConversationOutput);
  }

  /**
   * Fetches all the conversations related to an account.
   *
   * @param {string} account The target account.
   * @returns {Promise<Conversation[]>} A promise that resolves to an array of conversations related to the account.
   */
  public async fetchConversations(account: string): Promise<Conversation[]> {
    const contactConversationOutputs: ContractConversationOutput[] = await this.contract[
      'getConversations'
    ](this.appId, account);

    return this.processContractConversationOutputs(contactConversationOutputs);
  }

  /**
   * Fetches the messages of a conversation in a paginated manner.
   *
   * @param {string} conversationHash The target conversation's hash.
   * @param {BigNumberish} pageNumber The page number.
   * @param {BigNumberish} pageSize The page size.
   * @returns {Promise<ReceivedMessage[]>} A promise that resolves to an array of messages of the conversation.
   */
  public async fetchConversationMessagesPaginated(
    conversationHash: string,
    pageNumber: BigNumberish,
    pageSize: BigNumberish,
  ): Promise<ReceivedMessage[]> {
    const contractMessageOutputs: ContractMessageOutput[] = await this.contract[
      'getConversationMessagesPaginated'
    ](conversationHash, pageNumber, pageSize);

    return this.processContractMessageOutputs(contractMessageOutputs);
  }

  /**
   * Fetches the app IDs a user is related to.
   *
   * @param {string} user The target user address.
   * @returns {Promise<string[]>} A promise that resolves to an array of app IDs the user is related to.
   */
  public async getUserAppIds(user: string): Promise<string[]> {
    return this.contract['getUserAppIds'](user);
  }

  /**
   * Retrieves the encryption secret key for a specific user within a given conversation.
   *
   * @param {string} conversationHash - The target conversation's hash.
   * @param {string} user - The target user address of the user for whom the secret key needs to be retrieved.
   * @returns {Promise<string>} Returns a promise that resolves to the encryption secret key for the specified user in the given conversation.
   */
  public async getEncryptionSecretKeyForGroupConversation(
    conversationHash: string,
    user: string,
  ): Promise<string> {
    const encryptedSecretKey = await this.contract['getEncryptedSecretKey'](conversationHash, user);

    // TODO: decrypt encryptedSecretKey
    const encryptionSecretKey = '';

    return encryptionSecretKey;
  }

  /**
   * Listener for when a message is sent.
   *
   * @param {string | null} sender The sender of the message.
   * @param {string | null} conversationHash The hash of the conversation where the message belongs to.
   * @param {BigNumberish | null} index The index of the message in the conversation.
   * @param {Function} callback The callback function that is invoked when a message is sent.
   */
  public onMessageSent(
    sender: string | null,
    conversationHash: string | null,
    index: BigNumberish | null,
    callback: (conversationHash: string, receivedMessage: ReceivedMessage) => void,
  ): void {
    const filter = this.contract.filters['MessageSent'](sender, conversationHash, index);

    this.contract.on(
      filter,
      async (sender, conversationHash, content, sentAt, metadata, index, isDeleted) => {
        const eventOutput: MessageSentEventOutput = {
          sender,
          conversationHash,
          content,
          sentAt,
          metadata,
          index,
          isDeleted,
        };

        callback(conversationHash, this.processContractMessageOutput(eventOutput));
      },
    );
  }

  /**
   * Listener for when a message is deleted.
   *
   * @param {string | null} conversationHash The hash of the conversation where the message belongs to.
   * @param {string | null} sender The sender of the message.
   * @param {BigNumberish | null} index The index of the message in the conversation.
   * @param {Function} callback The callback function that is invoked when a message is deleted.
   */
  public onMessageDeleted(
    conversationHash: string | null,
    sender: string | null,
    index: BigNumberish | null,
    callback: (conversationHash: string, sender: string, index: number) => void,
  ): void {
    const filter = this.contract.filters['MessageDeleted'](conversationHash, sender, index);

    this.contract.on(filter, (conversationHash, sender, index) => {
      callback(conversationHash, sender, index.toNumber());
    });
  }

  /**
   * Listener for when a group conversation is created.
   *
   * @param {string | null} sender The sender of the group creation (group creator).
   * @param {Function} callback The callback function that is invoked when a group conversation is created.
   */
  public onGroupConversationCreated(
    sender: string | null,
    callback: (
      sender: string,
      conversationHash: string,
      conversationName: string,
      members: string[],
    ) => void,
  ): void {
    const filter = this.contract.filters['GroupConversationCreated'](sender);

    this.contract.on(filter, (sender, conversationHash, conversationName, members) => {
      callback(sender, conversationHash, conversationName, members);
    });
  }

  /**
   * Listener for when a conversation is removed.
   *
   * @param {string | null} sender The sender of the conversation deletion (conversation creator).
   * @param {string | null} conversationHash The hash of the conversation being removed.
   * @param {Function} callback The callback function that is invoked when a conversation is removed.
   */
  public onConversationRemoved(
    sender: string | null,
    conversationHash: string | null,
    callback: (sender: string, conversationHash: string) => void,
  ): void {
    const filter = this.contract.filters['ConversationRemoved'](sender, conversationHash);

    this.contract.on(filter, (sender, conversationHash) => {
      callback(sender, conversationHash);
    });
  }

  /**
   * Listener for when a member is added to a group conversation.
   *
   * @param {string | null} appId The app ID of the chat.
   * @param {string | null} conversationHash The hash of the conversation to which a member is being added.
   * @param {string | null} member The member being added to the group conversation.
   * @param {Function} callback The callback function that is invoked when a member is added to a group conversation.
   */
  public onMemberAddedToConversation(
    appId: string | null,
    conversationHash: string | null,
    member: string | null,
    callback: (appId: string, conversationHash: string, member: string) => void,
  ): void {
    const filter = this.contract.filters['MemberAddedToConversation'](
      appId,
      conversationHash,
      member,
    );

    this.contract.on(filter, (appId, conversationHash, member) => {
      callback(appId, conversationHash, member);
    });
  }

  /**
   * Listener for when a member is removed from a group conversation.
   *
   * @param {string | null} appId The app ID of the chat.
   * @param {string | null} conversationHash The hash of the conversation from which a member is being removed.
   * @param {string | null} member The member being removed from the group conversation.
   * @param {Function} callback The callback function that is invoked when a member is removed from a group conversation.
   */
  public onMemberRemovedFromConversation(
    appId: string | null,
    conversationHash: string | null,
    member: string | null,
    callback: (appId: string, conversationHash: string, member: string) => void,
  ): void {
    const filter = this.contract.filters['MemberRemovedFromConversation'](
      appId,
      conversationHash,
      member,
    );

    this.contract.on(filter, (appId, conversationHash, member) => {
      callback(appId, conversationHash, member);
    });
  }
}
