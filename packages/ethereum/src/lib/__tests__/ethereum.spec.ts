import { describe, expect, it } from 'vitest';
import { PollinationX } from '@4thtech-sdk/storage';
import { Ethereum } from '../ethereum';
import { Mail } from '../mail';
import { TestWalletClient } from './utils.spec';
import { pollinationX } from '../../../../../secrets.json';

// Initialize signer
const signer = new TestWalletClient();

// Define remote storage provider
const remoteStorageProvider = new PollinationX(pollinationX.url, pollinationX.token);

// Define mail objects
const ethereum = new Ethereum({
  walletClient: signer,
  remoteStorageProvider,
});

describe('Ethereum', () => {
  it('Should initialize Mail object', () => {
    expect(ethereum.mail).toBeInstanceOf(Mail);
  });
});
