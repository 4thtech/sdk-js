import { describe, expect, it } from 'vitest';
import { AesEncryption } from '../encryptions/aes-encryption';

describe('AesEncryption', () => {
  it('Should encrypt and decrypt data', async () => {
    const data = 'My unencrypted data';

    const aes = new AesEncryption();
    await aes.generateSecretKey();

    const encryptedData = await aes.encrypt(Buffer.from(data));

    const decryptedData = Buffer.from(await aes.decrypt(encryptedData)).toString();

    expect(decryptedData).to.be.equal(data);
  });

  it('Should correctly export and import secret key with hex encoding', async () => {
    const aes1 = new AesEncryption();
    await aes1.generateSecretKey();

    const secretKey1 = Buffer.from(await aes1.exportSecretKey()).toString();

    const aes2 = new AesEncryption();
    await aes2.importSecretKey(secretKey1);

    const secretKey2 = Buffer.from(await aes2.exportSecretKey()).toString();

    expect(secretKey1).to.be.equal(secretKey2);
  });

  it('Should reject if custom secret key is not long enough', async () => {
    const secretKey = 'my-secret-key';
    const aes = new AesEncryption();

    expect(aes.importSecretKey(secretKey)).rejects.toThrowError('Invalid hex string length');
  });

  it('Should reject when encrypting without a secret key', async () => {
    const data = 'My unencrypted data';
    const aes = new AesEncryption();
    expect(aes.encrypt(Buffer.from(data))).rejects.toThrowError(
      'Secret key has not been generated or imported.',
    );
  });

  it('Should reject when decrypting without a secret key', async () => {
    const data = 'My unencrypted data';
    const aes = new AesEncryption();
    expect(aes.decrypt(Buffer.from(data))).rejects.toThrowError(
      'Secret key has not been generated or imported.',
    );
  });

  it('Should reject when exporting secret key without generating or importing one', async () => {
    const aes = new AesEncryption();
    expect(aes.exportSecretKey()).rejects.toThrowError(
      'Secret key has not been generated or imported.',
    );
  });

  it('Should reject when importing secret key with wrong type', async () => {
    const secretKey = 123456;
    const aes = new AesEncryption();

    expect(aes.importSecretKey(secretKey as unknown as string)).rejects.toThrowError();
  });

  it('Should generate different secret keys', async () => {
    const aes = new AesEncryption();
    await aes.generateSecretKey();
    const secretKey1 = await aes.exportSecretKey();

    await aes.generateSecretKey();
    const secretKey2 = await aes.exportSecretKey();

    expect(secretKey1).not.to.be.equal(secretKey2);
  });
});
