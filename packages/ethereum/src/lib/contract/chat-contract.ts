import { ethers } from 'ethers';
import { BaseContract } from './base-contract';
import { ChatConfig } from '../chat';
import chatAbi from './abi/chat-abi.json';
import {
  ContractConversationOutput,
  ContractMessageOutput,
  Conversation,
  Encryption,
  Message,
  MessageMetaData,
  MessageSentEventOutput,
  ReceivedMessage,
  RemoteFileMetaData,
} from '@4thtech-sdk/types';

export class ChatContract extends BaseContract {
  protected appId: string;

  constructor(config: ChatConfig) {
    const { signer, chain, appId } = config;

    super({
      signer,
      contractParams: {
        address: chain.contracts.chat.address,
        abi: chain.contracts.chat.abi ?? JSON.stringify(chatAbi),
      },
      chain,
    });

    this.appId = appId ?? ethers.utils.hexZeroPad('0x0', 32);
  }

  // protected async encryptMessage(message: Message, encryption: Encryption): Promise<Message> {
  //   const encryptedContent = await encryption.encrypt(Buffer.from(message.content));
  //   message.metadata = {
  //     encryption: await encryption.getMetadata(),
  //   };
  //   message.content = encryptedContent.toString();
  //
  //   return message;
  // }

  protected processContractConversationOutput(
    contactConversationOutput: ContractConversationOutput,
  ): Conversation {
    const { hash, isGroup, name, creator, isOnlyCreatorAllowedToAddMembers, members, messages } =
      contactConversationOutput;

    return {
      hash,
      isGroup,
      name,
      creator,
      isOnlyCreatorAllowedToAddMembers,
      members,
      messages: this.processContractMessageOutputs(messages),
    };
  }

  protected processContractConversationOutputs(
    contactConversationOutputs: ContractConversationOutput[],
  ): Conversation[] {
    return contactConversationOutputs.map((contactConversationOutput) =>
      this.processContractConversationOutput(contactConversationOutput),
    );
  }

  protected processContractMessageOutput(
    contractMessageOutput: ContractMessageOutput | MessageSentEventOutput,
  ): ReceivedMessage {
    const { sender, content, sentAt, metadata, index, isDeleted } = contractMessageOutput;

    return {
      sender,
      content,
      sentAt: sentAt.toNumber(),
      metadata: this.decodeMetaData(metadata),
      index: index.toNumber(),
      isDeleted,
    };
  }

  protected processContractMessageOutputs(
    contractMessageOutputs: ContractMessageOutput[],
  ): ReceivedMessage[] {
    return contractMessageOutputs.map((contractMessageOutput) =>
      this.processContractMessageOutput(contractMessageOutput),
    );
  }

  private encodeMetaData(metadata: MessageMetaData): string {
    return JSON.stringify(metadata);
  }

  private decodeMetaData(metadata: string): MessageMetaData {
    try {
      return JSON.parse(metadata) as MessageMetaData;
    } catch {
      return {};
    }
  }
}
