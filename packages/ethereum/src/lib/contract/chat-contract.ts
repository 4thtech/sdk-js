import { ChatConfig } from '../chat';
import { chatAbi } from './abi/chat-abi';
import {
  Address,
  ContractConversationOutput,
  ContractConversationOutputs,
  ContractEncryptedSecretKeyDataOutput,
  ContractMessageOutput,
  ContractMessageOutputs,
  Conversation,
  ConversationHash,
  EncryptedMessage,
  EncryptedSecretKeyData,
  Encryption,
  EncryptionType,
  Message,
  MessageMetaData,
  MessageSentEventOutput,
  ReceivedMessage,
} from '@4thtech-sdk/types';
import { FeeCollectorContract } from './fee-collector-contract';
import { AesEncryption, EncryptionHandler, EncryptorAesEncryption } from '@4thtech-sdk/encryption';
import { validateChainContractExistence } from '../utils';

export class ChatContract extends FeeCollectorContract<typeof chatAbi> {
  protected readonly encryptionHandler?: EncryptionHandler;

  constructor(config: ChatConfig) {
    const { walletClient, appId, encryptor } = config;

    validateChainContractExistence(walletClient.chain.contracts, 'chat');

    super({
      walletClient,
      contractConfig: {
        address: walletClient.chain.contracts.chat.address,
        abi: chatAbi,
      },
      appId,
    });

    if (encryptor) {
      this.encryptionHandler = new EncryptionHandler({
        encryptionImplementations: [new AesEncryption(), new EncryptorAesEncryption(encryptor)],
      });
    }
  }

  protected async encryptMessage(
    message: Message,
    encryption: Encryption,
  ): Promise<EncryptedMessage> {
    const encryptedContent = await encryption.encrypt(Buffer.from(message.content));

    return {
      content: this.convertArrayBufferToBase64(encryptedContent),
      metadata: {
        encryption: await encryption.getMetadata(),
      },
    };
  }

  protected async decryptMessage(
    conversationHash: ConversationHash,
    encryptedMessage: EncryptedMessage,
  ): Promise<string> {
    if (!this.encryptionHandler) {
      throw new Error(
        'Failed to use encryption: Encryption handler is not initialized. Ensure you have configured an Encryptor instance during Chat class initialization.',
      );
    }

    const encryptionType = encryptedMessage.metadata.encryption.type;
    if (encryptionType === EncryptionType.AES) {
      await this.getEncryptionForGroupConversation(conversationHash);
    }

    const decryptedMessage = await this.encryptionHandler.decrypt(
      this.convertBase64ToBuffer(encryptedMessage.content),
      encryptedMessage.metadata.encryption,
    );

    return Buffer.from(decryptedMessage).toString();
  }

  protected async generateSecretKey(): Promise<string> {
    if (!this.encryptionHandler) {
      throw new Error(
        'Failed to use encryption: Encryption handler is not initialized. Ensure you have configured an Encryptor instance during Chat class initialization.',
      );
    }

    const aesEncryption = this.encryptionHandler.getEncryption(EncryptionType.AES) as AesEncryption;
    await aesEncryption.generateSecretKey();
    return await aesEncryption.exportSecretKey();
  }

  protected async encryptSecretKey(secretKey: string, user: string): Promise<string> {
    if (!this.encryptionHandler) {
      throw new Error(
        'Failed to use encryption: Encryption handler is not initialized. Ensure you have configured an Encryptor instance during Chat class initialization.',
      );
    }

    const encryptorAesEncryption = this.encryptionHandler.getEncryption(
      EncryptionType.ENCRYPTOR_AES,
    ) as EncryptorAesEncryption;
    await encryptorAesEncryption.initialize(user);
    const secretKeyForUser = await encryptorAesEncryption.encrypt(Buffer.from(secretKey));

    return this.encodeMetaData<EncryptedSecretKeyData>({
      secretKey: this.convertArrayBufferToBase64(secretKeyForUser),
      metadata: {
        encryption: await encryptorAesEncryption.getMetadata(),
        encoding: 'base64',
      },
    });
  }

  protected async decryptSecretKey(
    encryptedSecretKey: ContractEncryptedSecretKeyDataOutput,
  ): Promise<ArrayBuffer> {
    if (!this.encryptionHandler) {
      throw new Error(
        'Failed to use encryption: Encryption handler is not initialized. Ensure you have configured an Encryptor instance during Chat class initialization.',
      );
    }

    const encryptedSecretKeyData = this.decodeMetaData<EncryptedSecretKeyData>(
      encryptedSecretKey.encryptedSecretKey,
    );
    return await this.encryptionHandler.decrypt(
      this.convertBase64ToBuffer(encryptedSecretKeyData.secretKey),
      encryptedSecretKeyData.metadata.encryption,
    );
  }

  protected async encryptSecretKeyForMembers(
    secretKey: string,
    members: Address[],
  ): Promise<string[]> {
    return Promise.all(members.map((member) => this.encryptSecretKey(secretKey, member)));
  }

  protected async getEncryptionForConversation(
    conversation: Conversation,
  ): Promise<AesEncryption | EncryptorAesEncryption> {
    if (!this.encryptionHandler) {
      throw new Error(
        'Failed to use encryption: Encryption handler is not initialized. Ensure you have configured an Encryptor instance during Chat class initialization.',
      );
    }

    const signerAddress = await this.getSignerAddress();

    return conversation.isGroup
      ? this.getEncryptionForGroupConversation(conversation.hash)
      : this.getEncryptionForOneToOneConversation(
          this.getReceiverFromConversation(conversation, signerAddress),
        );
  }

  protected async getEncryptionForOneToOneConversation(
    receiver: Address,
  ): Promise<EncryptorAesEncryption> {
    if (!this.encryptionHandler) {
      throw new Error(
        'Failed to use encryption: Encryption handler is not initialized. Ensure you have configured an Encryptor instance during Chat class initialization.',
      );
    }

    const encryption = this.encryptionHandler.getEncryption(
      EncryptionType.ENCRYPTOR_AES,
    ) as EncryptorAesEncryption;
    await encryption.initialize(receiver);

    return encryption;
  }

  protected async getEncryptionForGroupConversation(
    conversationHash: ConversationHash,
  ): Promise<AesEncryption> {
    if (!this.encryptionHandler) {
      throw new Error(
        'Failed to use encryption: Encryption handler is not initialized. Ensure you have configured an Encryptor instance during Chat class initialization.',
      );
    }

    const secretKey = await this.getEncryptionSecretKeyForGroupConversation(conversationHash);

    const encryption = this.encryptionHandler.getEncryption(EncryptionType.AES) as AesEncryption;
    await encryption.importSecretKey(secretKey);

    return encryption;
  }

  protected async processContractConversationOutput(
    contactConversationOutput: ContractConversationOutput,
  ): Promise<Conversation> {
    const { hash, isGroup, name, creator, isOnlyCreatorAllowedToAddMembers, isEncrypted, members } =
      contactConversationOutput;

    return {
      hash,
      isGroup,
      name,
      creator,
      isOnlyCreatorAllowedToAddMembers,
      isEncrypted,
      members,
    };
  }

  protected async processContractConversationOutputs(
    contactConversationOutputs: ContractConversationOutputs,
  ): Promise<Conversation[]> {
    const processedOutputs = await Promise.allSettled(
      contactConversationOutputs.map(async (contactConversationOutput) => {
        return this.processContractConversationOutput(contactConversationOutput);
      }),
    );

    // TODO: what to do with rejected promises??
    return processedOutputs
      .filter((output) => output.status === 'fulfilled')
      .map((output) => (output as PromiseFulfilledResult<Conversation>).value);
  }

  protected async processContractMessageOutput(
    contractMessageOutput: ContractMessageOutput | MessageSentEventOutput,
    conversationHash: ConversationHash,
  ): Promise<ReceivedMessage> {
    const { sender, sentAt, metadata, index, isDeleted } = contractMessageOutput;
    let { content } = contractMessageOutput;

    const parsedMetadata = this.decodeMetaData<MessageMetaData>(metadata);

    if (parsedMetadata?.encryption) {
      content = await this.decryptMessage(conversationHash, {
        content,
        metadata: {
          encryption: parsedMetadata.encryption,
        },
      });
    }

    return {
      sender,
      content,
      sentAt,
      index,
      isDeleted,
    };
  }

  protected async processContractMessageOutputs(
    contractMessageOutputs: ContractMessageOutputs,
    conversationHash: ConversationHash,
  ): Promise<ReceivedMessage[]> {
    const processedOutputs = await Promise.allSettled(
      contractMessageOutputs.map(async (contractMessageOutput) => {
        return this.processContractMessageOutput(contractMessageOutput, conversationHash);
      }),
    );

    // TODO: what to do with rejected promises??
    return processedOutputs
      .filter((output) => output.status === 'fulfilled')
      .map((output) => (output as PromiseFulfilledResult<ReceivedMessage>).value);
  }

  protected encodeMetaData<T>(metadata: T): string {
    return JSON.stringify(metadata);
  }

  protected decodeMetaData<T>(metadata: string): T {
    try {
      return JSON.parse(metadata) as T;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? `Failed to decode metadata: ${error.message}`
          : 'Failed to decode metadata';
      throw new Error(errorMessage);
    }
  }

  private async getEncryptionSecretKeyForGroupConversation(
    conversationHash: ConversationHash,
  ): Promise<string> {
    const signerAddress = await this.getSignerAddress();

    // TODO: implement caching

    const encryptedSecretKeyDataOutput = await this.publicClient.readContract({
      ...this.contractConfig,
      functionName: 'getEncryptedSecretKey',
      args: [conversationHash, signerAddress],
    });

    const encryptionSecretKey = await this.decryptSecretKey(encryptedSecretKeyDataOutput);

    return Buffer.from(encryptionSecretKey).toString();
  }

  private getReceiverFromConversation(conversation: Conversation, signerAddress: Address): Address {
    return signerAddress === conversation.members[0]
      ? conversation.members[1]
      : conversation.members[0];
  }

  private convertArrayBufferToBase64(data: ArrayBuffer): string {
    return Buffer.from(data).toString('base64');
  }

  private convertBase64ToBuffer(data: string): Buffer {
    return Buffer.from(data, 'base64');
  }
}
