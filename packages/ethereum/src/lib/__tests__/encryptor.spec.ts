import { describe, expect, it } from 'vitest';
import { UserReadyChain } from '@4thtech-sdk/types';
import { TestEncryptorExtension, TestSigner } from './utils.spec';
import { localhost } from '../chains';
import { Encryptor } from '../encryptor';

// Initialize signer
const signer = new TestSigner();

// Define chain
const testChain = localhost;

const encryptor = new Encryptor({
  encryptorExtension: new TestEncryptorExtension(signer),
  userConfig: {
    signer,
    chain: testChain as UserReadyChain,
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
