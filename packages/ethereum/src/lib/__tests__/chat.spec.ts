import { beforeEach, describe, expect, it } from 'vitest';
import { prepareEncryptor, TestSigner } from './utils.spec';
import { BigNumber } from 'ethers';
import { Chat } from '../chat';
import { localhost } from '../chains';
import {
  ChatReadyChain,
  Conversation,
  EthereumTransactionResponse,
  Message,
} from '@4thtech-sdk/types';

// Initialize signer
const signer = new TestSigner();
const receiver = new TestSigner(1);
const member1 = new TestSigner(2);
const member2 = new TestSigner(3);

// Define chain
const testChain = localhost;

// Define chat objects
const chat = new Chat({
  signer,
  chain: testChain as ChatReadyChain,
});

describe('Chat', () => {
  let senderAddress: string;
  let receiverAddress: string;
  let message: Message;
  let conversationHash: string;
  let messageCountBefore: BigNumber;

  beforeEach(async () => {
    senderAddress = await signer.getAddress();
    receiverAddress = await receiver.getAddress();
    message = {
      content: 'Test Message',
    };
    conversationHash = chat.calculateConversationHash(senderAddress, receiverAddress);
  });

  async function testMessageReception(
    chat: Chat,
    sendFunction: () => Promise<EthereumTransactionResponse>,
  ) {
    messageCountBefore = await chat.countMessages(conversationHash);

    const txResponse = await sendFunction();

    expect(txResponse.hash).toBeDefined();
    expect(txResponse.hash).toMatch(/^0x([A-Fa-f0-9]{64})$/);

    // Check if message count increased by 1 after sending the message
    const messageCountAfter = await chat.countMessages(conversationHash);
    expect(messageCountAfter.sub(messageCountBefore)).toEqual(BigNumber.from(1));

    const receivedMessages = await chat.fetchConversationMessagesPaginated(
      conversationHash,
      messageCountAfter,
      1,
    );

    expect(receivedMessages[0]).toMatchObject({
      ...message,
      sender: senderAddress,
      index: messageCountAfter.sub(1).toNumber(),
      isDeleted: false,
    });

    expect(receivedMessages[0].sentAt).toBeGreaterThan(0);
  }

  describe('Storing', () => {
    describe('One-to-one Conversations', () => {
      describe('Unencrypted messages', () => {
        it('Should send and store message correctly', async () => {
          await testMessageReception(chat, () => chat.sendMessage(receiverAddress, message, false));
        });

        it('Should add message to one-to-one conversations', async () => {
          await testMessageReception(chat, () =>
            chat.addMessageToConversation(conversationHash, message, false),
          );
        });
      });

      describe('Encrypted messages', async () => {
        const encryptor = await prepareEncryptor(signer, testChain);
        await prepareEncryptor(receiver, testChain);

        const chat = new Chat({
          signer,
          chain: testChain as ChatReadyChain,
          encryptor,
        });

        it('Should send and store message correctly', async () => {
          await testMessageReception(chat, () => chat.sendMessage(receiverAddress, message));
        });

        it('Should add message to one-to-one conversations', async () => {
          await testMessageReception(chat, () =>
            chat.addMessageToConversation(conversationHash, message),
          );
        });
      });

      it('Should delete message', async () => {
        await chat.sendMessage(receiverAddress, message, false);
        const messageCount = await chat.countMessages(conversationHash);
        const messageIndex = messageCount.sub(1);

        await chat.deleteMessage(conversationHash, messageIndex);

        const receivedMessages = await chat.fetchConversationMessagesPaginated(
          conversationHash,
          messageCount,
          1,
        );

        expect(receivedMessages[0].content).to.be.equal('');
        expect(receivedMessages[0].isDeleted).to.be.equal(true);
      });

      it('Should remove conversation', async () => {
        await chat.sendMessage(receiverAddress, message, false);
        await chat.removeConversation(conversationHash);

        expect(chat.fetchConversation(conversationHash)).rejects.toThrowError(
          'Chat: the conversation does not exist',
        );
      });
    });

    describe('Group Conversations', () => {
      describe('Unencrypted', () => {
        const conversationName = 'Group Conversation';
        let lastConversation: Conversation;

        beforeEach(async () => {
          const members = [await receiver.getAddress()];

          await chat.createGroupConversation(conversationName, true, false, members);

          const conversations = await chat.fetchConversations(senderAddress);

          if (conversations.length) {
            lastConversation = conversations[conversations.length - 1];
            conversationHash = lastConversation.hash;
          }
        });

        it('Should create group conversation', async () => {
          expect(lastConversation).toBeDefined();
          expect(lastConversation?.isGroup).to.be.equal(true);
          expect(lastConversation?.name).to.be.equal(conversationName);
        });

        it('Should add members to group conversation', async () => {
          await chat.addMembersToGroupConversation(lastConversation.hash, [
            await member1.getAddress(),
            await member2.getAddress(),
          ]);
          const conversation = await chat.fetchConversation(lastConversation.hash);

          expect(conversation.members.length).to.be.equal(4);
        });

        it('Should remove member from group conversation', async () => {
          await chat.removeMemberFromGroupConversation(
            lastConversation.hash,
            await receiver.getAddress(),
          );
          const conversation = await chat.fetchConversation(lastConversation.hash);

          expect(conversation.members.length).to.be.equal(lastConversation.members.length - 1);
        });

        it('Should remove members from group conversation', async () => {
          await chat.addMembersToGroupConversation(lastConversation.hash, [
            await member1.getAddress(),
            await member2.getAddress(),
          ]);
          const conversationBefore = await chat.fetchConversation(lastConversation.hash);
          await chat.removeMembersFromGroupConversation(lastConversation.hash, [
            await receiver.getAddress(),
            await member1.getAddress(),
          ]);
          const conversationAfter = await chat.fetchConversation(lastConversation.hash);

          expect(conversationAfter.members.length).to.be.equal(
            conversationBefore.members.length - 2,
          );
        });

        it('Should add message to a group conversations', async () => {
          await testMessageReception(chat, () =>
            chat.addMessageToConversation(lastConversation.hash, message, false),
          );
        });
      });

      describe('Encrypted', async () => {
        const conversationName = 'Encrypted Group Conversation';
        let lastConversation: Conversation;

        const encryptor = await prepareEncryptor(signer, testChain);
        await prepareEncryptor(receiver, testChain);

        const chat = new Chat({
          signer,
          chain: testChain as ChatReadyChain,
          encryptor,
        });

        beforeEach(async () => {
          const members = [await receiver.getAddress()];

          await chat.createGroupConversation(conversationName, true, true, members);

          const conversations = await chat.fetchConversations(senderAddress);

          if (conversations.length) {
            lastConversation = conversations[conversations.length - 1];
            conversationHash = lastConversation.hash;
          }
        });

        it('Should add encrypted message to a group conversations', async () => {
          // Test on clean chat instance which doesn't have initialized any encryption's
          const chatClean = new Chat({
            signer,
            chain: testChain as ChatReadyChain,
            encryptor,
          });

          await testMessageReception(chatClean, () =>
            chat.addMessageToConversation(lastConversation.hash, message),
          );
        });
      });
    });
  });

  describe('Retrieving', () => {
    beforeEach(async () => {
      await chat.sendMessage(receiverAddress, message, false);
    });

    it('Should fetch conversation hashes', async () => {
      const conversationHashes = await chat.fetchConversationHashes(receiverAddress);

      expect(conversationHashes).toBeDefined();
      expect(conversationHashes.length).to.be.greaterThanOrEqual(1);
    });

    it('Should fetch conversation', async () => {
      const conversation = await chat.fetchConversation(conversationHash);

      expect(conversation).toBeDefined();
      expect(conversation.members.length).to.be.greaterThanOrEqual(2);
      expect((await chat.countMessages(conversationHash)).toNumber()).to.be.greaterThanOrEqual(1);
    });

    it('Should fetch conversations', async () => {
      const conversations = await chat.fetchConversations(receiverAddress);

      expect(conversations.length).to.be.greaterThanOrEqual(1);
    });

    it('Should fetch messages paginated', async () => {
      const pageNumber = 1;
      const pageSize = 10;
      const messages = await chat.fetchConversationMessagesPaginated(
        conversationHash,
        pageNumber,
        pageSize,
      );

      expect(messages).toBeDefined();
      expect(messages.length).to.be.lessThanOrEqual(10);
    });

    it('Should get user app ids', async () => {
      const senderAppIds = await chat.getUserAppIds(senderAddress);
      const receiverAppIds = await chat.getUserAppIds(receiverAddress);

      expect(senderAppIds.length).to.be.equal(1);
      expect(receiverAppIds.length).to.be.equal(1);
    });
  });

  describe('Events', () => {
    it('Should emit event on message sent', async () => {
      chat.onMessageSent(null, null, null, (conversationHash, receivedMessage) => {
        console.log(conversationHash);
        console.log(receivedMessage);
      });

      await chat.sendMessage(receiverAddress, message, false);
    });

    it('Should emit event on message deleted', async () => {
      chat.onMessageDeleted(null, null, null, (conversationHash, sender, index) => {
        console.log(conversationHash);
        console.log(sender);
        console.log(index);
      });

      await chat.sendMessage(receiverAddress, message, false);
      const messageCount = await chat.countMessages(conversationHash);
      const messageIndex = messageCount.sub(1);

      await chat.deleteMessage(conversationHash, messageIndex);
    });

    it('Should emit event on group conversation created', async () => {
      chat.onGroupConversationCreated(
        null,
        (sender, conversationHash, conversationName, members) => {
          console.log(sender);
          console.log(conversationHash);
          console.log(conversationName);
          console.log(members);
        },
      );

      const members = [await receiver.getAddress()];
      await chat.createGroupConversation('Group Conversation', true, false, members);
    });

    it('Should emit event on conversation removed', async () => {
      chat.onConversationRemoved(null, null, (sender, conversationHash) => {
        console.log(sender);
        console.log(conversationHash);
      });

      await chat.sendMessage(receiverAddress, message, false);
      await chat.removeConversation(conversationHash);
    });

    it('Should emit event on member added to conversation', async () => {
      chat.onMemberAddedToConversation(null, null, null, (appId, conversationHash, member) => {
        console.log(appId);
        console.log(conversationHash);
        console.log(member);
      });

      const members = [await receiver.getAddress()];
      await chat.createGroupConversation('Group Conversation', true, false, members);

      const conversations = await chat.fetchConversations(senderAddress);

      if (conversations.length) {
        const lastConversation = conversations[conversations.length - 1];
        await chat.addMembersToGroupConversation(lastConversation.hash, [
          await member1.getAddress(),
          await member2.getAddress(),
        ]);
      }
    });

    it('Should emit event on member removed from conversation', async () => {
      chat.onMemberRemovedFromConversation(null, null, null, (appId, conversationHash, member) => {
        console.log(appId);
        console.log(conversationHash);
        console.log(member);
      });

      const members = [await receiver.getAddress()];
      await chat.createGroupConversation('Group Conversation', true, false, members);

      const conversations = await chat.fetchConversations(senderAddress);

      if (conversations.length) {
        const lastConversation = conversations[conversations.length - 1];
        await chat.removeMemberFromGroupConversation(
          lastConversation.hash,
          await receiver.getAddress(),
        );
      }
    });
  });
});
