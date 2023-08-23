import { describe, expect, it } from 'vitest';
import { UserReadyChain } from '@4thtech-sdk/types';
import { TestSigner } from './utils.spec';
import { User } from '../user';
import { localhost } from '../chains';

// Initialize signer
const signer = new TestSigner();
const receiver = new TestSigner(1);

// Define chain
const testChain = localhost;

const user = new User({
  signer,
  chain: testChain as UserReadyChain,
});

// Define test data
const encryptionPublicKey = '0x03ae304f1b719ad189bde744696dd60b264e0367a4cac582ff59d8dd69b63607d5';
const encryptionPublicKeyType = 'BL_ENCRYPTOR_EC';

describe('User', () => {
  describe('Storing', () => {
    it('Should store user encryption public key correctly', async () => {
      await user.setEncryptionPublicKey(encryptionPublicKey, encryptionPublicKeyType);

      const retrievedUser = await user.fetch(await signer.getAddress());

      expect(retrievedUser).toBeDefined();
      expect(retrievedUser?.encryptionPublicKey).toEqual({
        publicKey: encryptionPublicKey,
        publicKeyType: encryptionPublicKeyType,
      });
    });
  });

  describe('Events', () => {
    it('Should emit encryption public key set event correctly', async () => {
      const userAddress = await signer.getAddress();

      user.onEncryptionPublicKeySet(userAddress, (user, publicKey, publicKeyType) => {
        console.log(user);
        console.log(publicKey);
        console.log(publicKeyType);
      });

      await user.setEncryptionPublicKey(encryptionPublicKey, encryptionPublicKeyType);
    });
  });
});
