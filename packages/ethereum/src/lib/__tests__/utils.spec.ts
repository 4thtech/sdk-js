import {
  Address,
  Chain,
  EncryptorExtension,
  EncryptorState,
  EthereumTransactionRequest,
  EthereumTransactionResponse,
  FileInput,
  WalletClient,
} from '@4thtech-sdk/types';
import { ethers, SigningKey } from 'ethers';
import { RemoteStorageProvider } from '@4thtech-sdk/storage';
import * as fs from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { Readable } from 'stream';
import { Encryptor } from '../encryptor';
import { hardhat } from '../chains';

export class TestEthersWalletClient implements WalletClient {
  public readonly chain: Chain = hardhat;

  private readonly address;
  private readonly provider;

  constructor(address?: number | string) {
    this.address = address;

    // When using HardHat you get access to accounts trough JsonRpcProvider-getSigner
    const rpcUrl = hardhat.rpcUrls.default.http[0];
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  public async getAddress(): Promise<Address> {
    return (await this.getSigner()).getAddress() as unknown as Address;
  }

  public async sendTransaction(
    transactionRequest: EthereumTransactionRequest,
  ): Promise<EthereumTransactionResponse> {
    const signer = await this.getSigner();

    const populatedTx = await signer.populateTransaction(transactionRequest);
    const txResponse = await signer.sendTransaction(populatedTx);

    return txResponse.hash as unknown as EthereumTransactionResponse;
  }

  private async getSigner() {
    return this.provider.getSigner(this.address);
  }
}

export class TestWalletClient extends TestEthersWalletClient {
  constructor(address?: number | string) {
    super(address);
  }
}

export class TestRemoteStorageProvider extends RemoteStorageProvider {
  public async upload(file: FileInput, fileName: string): Promise<string> {
    if (!(file instanceof Uint8Array || file instanceof ArrayBuffer || file instanceof Readable)) {
      throw new Error(
        'Only Buffer and Readable stream are supported in this test storage provider.',
      );
    }

    return await this.saveFile(file, fileName);
  }

  public async download(url: string): Promise<ArrayBuffer> {
    return await fs.promises.readFile(url);
  }

  private async saveFile(file: Readable | ArrayBuffer, fileName: string): Promise<string> {
    this.emitUploadProgress(0, fileName);

    const randomFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.bin`;

    const filePath = path.resolve(this.getTargetDir(), randomFileName);

    if (file instanceof Readable) {
      await pipeline(file, fs.createWriteStream(filePath));
    } else {
      await fs.promises.writeFile(filePath, new Uint8Array(file));
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

export class TestEncryptorExtension implements EncryptorExtension {
  private readonly signingKey;

  constructor(privateKeyId?: number) {
    // Private keys from local Hardhat node
    const testPrivateKeys = [
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
      '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
      '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
      '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
    ];

    this.signingKey = new SigningKey(testPrivateKeys[privateKeyId ?? 0]);
  }

  public getState(): EncryptorState {
    return EncryptorState.UNLOCKED;
  }

  public getPublicKey(): string {
    return this.signingKey.publicKey;
  }

  public getPublicKeyType(): string {
    return 'TEST_ENCRYPTOR_EC';
  }

  public computeSharedSecretKey(publicKey: string): string {
    return this.signingKey.computeSharedSecret(publicKey);
  }
}

export async function prepareEncryptor(
  walletClient: TestWalletClient,
  privateKeyId?: number,
): Promise<Encryptor> {
  const encryptor = new Encryptor({
    encryptorExtension: new TestEncryptorExtension(privateKeyId),
    walletClient,
  });

  const isAddressInitialized = await encryptor.isUserAddressInitialized(
    await walletClient.getAddress(),
  );

  if (!isAddressInitialized) {
    await encryptor.storePublicKey();
  }

  return encryptor;
}
