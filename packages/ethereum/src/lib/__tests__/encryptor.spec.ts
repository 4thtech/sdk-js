import { describe, it } from 'vitest';
import { UserReadyChain } from '@4thtech-sdk/types';
import { TestSigner } from './utils.spec';
import { localhost } from '../chains';
import { Encryptor } from '@4thtech-sdk/ethereum';

// Initialize signer
const signer = new TestSigner();
const receiver = new TestSigner(1);

// Define chain
const testChain = localhost;

const encryptor = new Encryptor({
  userContractConfig: {
    signer,
    chain: testChain as UserReadyChain,
  },
});

describe('Encryptor', () => {
  describe('Interface', () => {
    it('Should store encryptor public key', async () => {
      const txResponse = await encryptor.storePublicKey();

      console.log(txResponse);
      // TODO: expect
    });

    it('Should retrieve user public key', async () => {
      // const userPublicKey = await encryptor.retrieveUserPublicKey(await signer.getAddress());
      const userPublicKey = await encryptor.retrieveUserPublicKey(await receiver.getAddress());

      console.log(userPublicKey);
      // TODO: expect
    });

    it('Should check if user is initialized', async () => {
      // const isUserInitialized = await encryptor.isUserAddressInitialized(await signer.getAddress());
      const isUserInitialized = await encryptor.isUserAddressInitialized(
        await receiver.getAddress(),
      );

      console.log(isUserInitialized);
      // TODO: expect
    });
  });
});
