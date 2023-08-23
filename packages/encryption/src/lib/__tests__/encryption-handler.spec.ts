// encryption-handler.spec.ts
import { EncryptionHandler } from '../encryption-handler';
import { AesEncryption } from '../encryptions/aes-encryption';
import { EncryptionType } from '@4thtech-sdk/types';
import { expect } from 'vitest';

describe('EncryptionHandler', () => {
  let aesEncryption: AesEncryption;
  const mockUnEncryptedData = Buffer.from('My unencrypted data');
  let encryptionHandler: EncryptionHandler;

  beforeAll(async () => {
    aesEncryption = new AesEncryption();
    await aesEncryption.generateSecretKey();

    const encryptionHandlerConfig = {
      customEncryptionImplementations: new Map([
        [aesEncryption.getType() as EncryptionType, aesEncryption],
      ]),
    };

    encryptionHandler = new EncryptionHandler(encryptionHandlerConfig);
  });

  it('Should correctly encrypt/decrypt data with given encryption type', async () => {
    const encryptedData = await encryptionHandler.encrypt(mockUnEncryptedData, EncryptionType.AES);
    const decryptedData = await encryptionHandler.decrypt(encryptedData, {
      type: EncryptionType.AES,
    });

    expect(Buffer.from(decryptedData)).to.be.deep.equal(mockUnEncryptedData);
  });

  it('Should reject when unsupported encryption type is provided', async () => {
    expect(
      encryptionHandler.encrypt(mockUnEncryptedData, 'unsupported-type' as EncryptionType),
    ).rejects.toThrow('Unsupported encryption type: unsupported-type');

    expect(
      encryptionHandler.decrypt(Buffer.from('encrypted content :)'), {
        type: 'unsupported-type',
      }),
    ).rejects.toThrow('Unsupported encryption type: unsupported-type');
  });
});
