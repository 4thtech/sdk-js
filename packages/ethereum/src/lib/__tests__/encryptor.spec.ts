import { describe, expect, it } from 'vitest';
import { TestEncryptorExtension, TestWalletClient } from './utils.spec';
import { Encryptor } from '../encryptor';

// Initialize signer
const signer = new TestWalletClient();

const encryptor = new Encryptor({
  encryptorExtension: new TestEncryptorExtension(),
  userConfig: {
    walletClient: signer,
  },
});

describe('Encryptor', () => {
  describe('Interface', () => {
    it('Should store and retrieve encryptor public key', async () => {
      await encryptor.storePublicKey();

      const storedPublicKey = await encryptor.retrieveUserPublicKey(await signer.getAddress());
      const encryptorPublicKey = await encryptor.getPublicKey();

      expect(storedPublicKey).toEqual(encryptorPublicKey);
    });

    it('Should check if user is initialized', async () => {
      await encryptor.storePublicKey();

      const isUserInitialized = await encryptor.isUserAddressInitialized(await signer.getAddress());

      expect(isUserInitialized).toEqual(true);
    });
  });
});
