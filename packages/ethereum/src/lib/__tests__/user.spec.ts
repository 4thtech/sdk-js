import { describe, expect, it } from 'vitest';
import { TestWalletClient } from './utils.spec';
import { User } from '../user';

// Initialize signer
const signer = new TestWalletClient();

const user = new User({
  walletClient: signer,
});

// Define test data
const encryptionPublicKey =
  '0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5';
const encryptionPublicKeyType = 'TEST_ENCRYPTOR_EC';

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
