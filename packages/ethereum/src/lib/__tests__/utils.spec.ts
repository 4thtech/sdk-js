import { EthereumTransactionRequest, FileInput, Signer } from '@4thtech-sdk/types';
import { ethers } from 'ethers';
import { RemoteStorageProvider } from '@4thtech-sdk/storage';
import * as fs from 'fs';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { Readable } from 'stream';
import { EventEmitter } from 'events';

// Private keys from local Hardhat node
const testPrivateKeys = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
];

export class TestSigner implements Signer {
  private wallet;

  constructor(id?: number) {
    const privateKey = testPrivateKeys[id ?? 0];
    this.wallet = new ethers.Wallet(privateKey);
  }

  signTransaction(tx: EthereumTransactionRequest): Promise<string> {
    return this.wallet.signTransaction(tx);
  }

  getAddress(): Promise<string> {
    return this.wallet.getAddress();
  }
}

export class TestRemoteStorageProvider extends RemoteStorageProvider {
  constructor() {
    super();
  }

  public async upload(file: FileInput, fileName: string): Promise<string> {
    if (!(file instanceof Buffer || file instanceof Readable)) {
      throw new Error(
        'Only Buffer and Readable stream are supported in this test storage provider.',
      );
    }

    return await this.saveFile(file, fileName);
  }

  public async download(url: string): Promise<ArrayBufferLike> {
    return await fs.promises.readFile(url);
  }

  private async saveFile(file: Readable | Buffer, fileName: string): Promise<string> {
    this.emitUploadProgress(0, fileName);

    const randomFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.bin`;

    const filePath = path.resolve(this.getTargetDir(), randomFileName);

    if (file instanceof Readable) {
      await pipeline(file, createWriteStream(filePath));
    } else {
      await fs.promises.writeFile(filePath, file);
    }

    this.emitUploadProgress(100, fileName);

    return filePath;
  }

  private getTargetDir(): string {
    const targetDir = path.resolve(__dirname, './tmp');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }

    return targetDir;
  }
}
