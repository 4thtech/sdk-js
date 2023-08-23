import { describe, expect, it } from 'vitest';
import { PollinationX } from '@4thtech-sdk/storage';
import { MailReadyChain } from '@4thtech-sdk/types';
import { Ethereum } from '../ethereum';
import { Mail } from '../mail';
import { TestSigner } from './utils.spec';
import { localhost } from '../chains';
import { pollinationX } from '../../../../../secrets.json';

// Initialize signer
const signer = new TestSigner();

// Define chain
const testChain = localhost;

// Define remote storage provider
const remoteStorageProvider = new PollinationX(pollinationX.url, pollinationX.token);

// Define mail objects
const ethereum = new Ethereum({
  signer,
  chain: testChain as MailReadyChain,
  remoteStorageProvider,
});

describe('Ethereum', () => {
  it('Should initialize Mail object', () => {
    expect(ethereum.mail).toBeInstanceOf(Mail);
  });
});
