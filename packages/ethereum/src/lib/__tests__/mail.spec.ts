import { beforeAll, describe, expect, it } from 'vitest';
import {
  Address,
  Encryption,
  Envelope,
  EthereumTransactionResponse,
  isRemoteFileInfo,
} from '@4thtech-sdk/types';
import { prepareEncryptor, TestRemoteStorageProvider, TestWalletClient } from './utils.spec';
import path from 'path';
import { Mail } from '../mail';
import { AesEncryption, EncryptionHandler, EncryptorAesEncryption } from '@4thtech-sdk/encryption';
import * as fs from 'fs';

// Initialize signer
const signer = new TestWalletClient();
const receiver = new TestWalletClient(1);

// Define remote storage provider
const remoteStorageProvider = new TestRemoteStorageProvider();

// Define mail objects
const mail = new Mail({
  walletClient: signer,
  remoteStorageProvider,
});

const mailAsReceiver = new Mail({
  walletClient: receiver,
  remoteStorageProvider,
});

describe('Mail', () => {
  describe('Storing', async () => {
    let envelope: Envelope;
    let mailCountBefore: bigint;

    const firstLocalAttachmentPath = path.resolve(__dirname, './files/test-attachment-1.txt');
    const firstLocalAttachmentContent = await fs.promises.readFile(
      firstLocalAttachmentPath,
      'utf8',
    );

    beforeEach(async () => {
      mailCountBefore = await mail.count(await receiver.getAddress());
      envelope = {
        content: {
          subject: 'Test subject',
          attachments: [
            {
              name: 'test-attachment-2.txt',
              URL: 'https://www.example.com/test-attachment-2.txt',
              checksum: '0fd2d4e630b6579b933b5cb4930a8100acca6b4e29cd2738c4b7a9b2f76d80e4',
              metadata: '{}',
            },
            {
              path: firstLocalAttachmentPath,
            },
            {
              path: path.resolve(__dirname, './files/test-attachment-2.txt'),
            },
          ],
        },
        receiver: await receiver.getAddress(),
        sender: await signer.getAddress(),
      };
    });

    describe('Unencrypted Mails', () => {
      it('Should send and store correctly', async () => {
        const txResponse = await mail.send({
          envelope,
          onStateChange: (state) => {
            console.log(state);
          },
          onUploadProgress: (progressInfo) => {
            console.log(`Upload Progress (${progressInfo.fileName}): ${progressInfo.percent}%`);
          },
        });

        expect(txResponse).toBeDefined();
        expect(txResponse).toMatch(/^0x([A-Fa-f0-9]{64})$/);

        // Check if mail count increased by 1 after sending the mail
        const mailCountAfter = await mail.count(await receiver.getAddress());
        expect(mailCountAfter - mailCountBefore).toEqual(1n);

        const receivedEnvelope = await mail.fetch(await receiver.getAddress(), mailCountAfter - 1n);

        expect(receivedEnvelope).toMatchObject({
          ...envelope,
          openedAt: 0n,
          index: mailCountAfter - 1n,
          isDeleted: false,
          metadata: {
            transactionHash: txResponse,
          },
        });

        expect(receivedEnvelope.sentAt).toBeGreaterThan(0);
        expect(typeof receivedEnvelope.metadata.URL).toBe('string');
        expect(receivedEnvelope.metadata.checksum).toHaveLength(64);
      });
    });

    describe('Encrypted Mails', () => {
      let aesEncryption: AesEncryption;
      let encryptionHandler: EncryptionHandler;
      let mail: Mail;

      beforeEach(async () => {
        aesEncryption = new AesEncryption();
        await aesEncryption.generateSecretKey();

        encryptionHandler = new EncryptionHandler({
          encryptionImplementations: [aesEncryption],
        });

        mail = new Mail({
          walletClient: signer,
          remoteStorageProvider,
          encryptionHandler,
        });
      });

      async function sendAndTestMail(encryptionInstance: Encryption) {
        await mail.send({
          envelope,
          encryption: encryptionInstance,
          onStateChange: (state) => {
            console.log(state);
          },
          onUploadProgress: (progressInfo) => {
            console.log(`Upload Progress (${progressInfo.fileName}): ${progressInfo.percent}%`);
          },
        });

        const mailCount = await mail.count(await receiver.getAddress());
        const receivedEnvelope = await mail.fetch(await receiver.getAddress(), mailCount - 1n);
        const attachments = receivedEnvelope.content.attachments;

        expect(attachments?.length).to.be.equal(3);

        if (attachments?.length) {
          const localAttachment = attachments[1];

          if (isRemoteFileInfo(localAttachment)) {
            const encryptedAttachmentContent = await fs.promises.readFile(
              localAttachment.URL,
              'utf8',
            );
            const downloadedFileContent = await mail.downloadAttachment(localAttachment);

            expect(encryptedAttachmentContent).to.not.be.equal(firstLocalAttachmentContent);
            expect(downloadedFileContent).toBeDefined();
            expect(Buffer.from(downloadedFileContent).toString()).toEqual(
              firstLocalAttachmentContent,
            );
          }
        }
      }

      it('Should encrypt with AES and store correctly', async () => {
        await sendAndTestMail(aesEncryption);
      });

      it('Should encrypt with Encryptor AES and store correctly', async () => {
        // Prepare encryptor
        const senderEncryptor = await prepareEncryptor(signer);
        const receiverEncryptor = await prepareEncryptor(receiver, 1);

        // Prepare encryption
        const senderEncryptorAesEncryption = new EncryptorAesEncryption(senderEncryptor);
        await senderEncryptorAesEncryption.initialize(await receiver.getAddress());

        const receiverEncryptorAesEncryption = new EncryptorAesEncryption(receiverEncryptor);
        encryptionHandler.addEncryptionInstance(receiverEncryptorAesEncryption);

        // Send and test mail
        await sendAndTestMail(senderEncryptorAesEncryption);
      });
    });

    it('Should set opened at', async () => {
      // Send new mail to receiver
      await mail.send({
        envelope: {
          content: {
            subject: 'Test setOpenedAt',
          },
          receiver: await receiver.getAddress(),
          sender: await signer.getAddress(),
        },
      });

      // Set opened at as a receiver of the mail
      const mailCount = await mailAsReceiver.count(await receiver.getAddress());
      const mailIndex = mailCount - 1n;

      await mailAsReceiver.setOpenedAt(mailIndex);
      const envelope = await mailAsReceiver.fetch(await receiver.getAddress(), mailIndex);

      expect(envelope.openedAt).toBeGreaterThan(0);
    });

    it('Should delete mail', async () => {
      await mail.send({ envelope });

      const mailCount = await mail.count(await receiver.getAddress());
      const mailIndex = mailCount - 1n;

      await mailAsReceiver.deleteMail(mailIndex);

      expect(mail.fetch(await receiver.getAddress(), mailIndex)).rejects.toThrowError();
    });

    it('Should delete mails', async () => {
      await mail.send({ envelope });
      await mail.send({ envelope });

      const mailCount = await mail.count(await receiver.getAddress());
      const mailIndexes = [mailCount - 1n, mailCount - 2n];

      await mailAsReceiver.deleteMails(mailIndexes);

      expect(mail.fetch(await receiver.getAddress(), mailIndexes[0])).rejects.toThrowError();
      expect(mail.fetch(await receiver.getAddress(), mailIndexes[1])).rejects.toThrowError();
    });
  });

  describe('Retrieving', async () => {
    const receiverAddress = await receiver.getAddress();
    const envelope: Envelope = {
      content: {
        subject: 'Test subject',
        attachments: [
          {
            path: path.resolve(__dirname, './files/test-attachment-2.txt'),
          },
        ],
      },
      receiver: receiverAddress,
      sender: await signer.getAddress(),
    };
    let txResponse: EthereumTransactionResponse;

    beforeAll(async () => {
      txResponse = await mail.send({ envelope });
      // await txResponse.wait();
    });

    it('Should fetch mail', async () => {
      const mailCount = await mail.count(await receiver.getAddress());
      const mailIndex = mailCount - 1n;
      const envelope = await mail.fetch(receiverAddress, mailIndex);

      expect(envelope).toBeDefined();
      expect(envelope.content.attachments).toBeDefined();
    });

    it('Should fetch mails', async () => {
      const envelopes = await mail.fetchAll(receiverAddress);

      expect(envelopes).toBeDefined();
      expect(envelopes.length).toBeGreaterThan(0);
    });

    it('Should fetch mails paginated', async () => {
      const pageNumber = await mail.count(receiverAddress);
      const pageSize = 1n;
      const envelopes = await mail.fetchPaginated(receiverAddress, pageNumber, pageSize);

      expect(envelopes).toBeDefined();
      expect(envelopes.length).to.be.equal(1);
    });

    it('Should fetch mail by tx hash', async () => {
      const receivedEnvelope = await mail.fetchByTransactionHash(txResponse);

      expect(receivedEnvelope).toMatchObject(envelope);
    });

    it('Should count mails', async () => {
      const mailCount = await mail.count(receiverAddress);

      expect(mailCount > 0n).toBeTruthy();
    });

    it('Should get user app ids', async () => {
      const userAppIds = await mail.getUserAppIds(receiverAddress);

      expect(userAppIds.length).to.be.equal(1);
    });

    it('Should download attachment', async () => {
      const mailCount = await mail.count(await receiver.getAddress());
      const mailIndex = mailCount - 1n;
      const envelope = await mail.fetch(receiverAddress, mailIndex);

      if (envelope.content.attachments?.length) {
        const firstAttachment = envelope.content.attachments[0];

        if (isRemoteFileInfo(firstAttachment)) {
          const fileContent = await mail.downloadAttachment(firstAttachment);

          expect(fileContent).toBeDefined();
        }
      }
    });
  });

  describe('Events', () => {
    let senderAddress: Address;
    let receiverAddress: Address;
    let envelope: Envelope;

    beforeAll(async () => {
      senderAddress = await signer.getAddress();
      receiverAddress = await receiver.getAddress();
      envelope = {
        content: {
          subject: 'Test subject',
        },
        receiver: receiverAddress,
        sender: senderAddress,
      };
    });

    it('Should emit event on mail send', async () => {
      // Listen to received mails
      mail.onNew(null, receiverAddress, (envelope) => {
        console.log(envelope);
      });

      // Listen to sent mails
      mail.onNew(senderAddress, null, (envelope) => {
        console.log(envelope);
      });

      // Listen to all mails
      mail.onNew(null, null, (envelope) => {
        console.log(envelope);
      });

      // Send mail
      await mail.send({ envelope });
    });

    it('Should emit event on opened at', async () => {
      mail.onOpened(receiverAddress, null, (index, openedAt) => {
        console.log(index);
        console.log(openedAt);
      });

      await mail.send({ envelope });

      const mailCount = await mail.count(receiverAddress);
      const mailIndex = mailCount - 1n;

      await mailAsReceiver.setOpenedAt(mailIndex);
    });

    it('Should emit event on deleted', async () => {
      mail.onDeleted(receiverAddress, null, (index, deletedAt) => {
        console.log(index);
        console.log(deletedAt);
      });

      await mail.send({ envelope });

      const mailCount = await mail.count(receiverAddress);
      const mailIndex = mailCount - 1n;

      await mailAsReceiver.deleteMail(mailIndex);
    });
  });
});
