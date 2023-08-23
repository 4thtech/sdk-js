import {
  Encryption,
  EncryptionMetaData,
  EncryptionType,
  EncryptorService,
} from '@4thtech-sdk/types';
import { AesEncryption } from './aes-encryption';
import { createHash } from 'crypto';

export class EncryptorAesEncryption implements Encryption {
  private readonly type = EncryptionType.ENCRYPTOR_AES;

  private aesEncryption: AesEncryption;

  private encryptor: EncryptorService;

  constructor(encryptor: EncryptorService) {
    this.aesEncryption = new AesEncryption();
    this.encryptor = encryptor;
  }

  public async initialize(receiverAddress: string): Promise<void> {
    const receiverPublicKey = await this.encryptor.retrieveUserPublicKey(receiverAddress);

    if (!receiverPublicKey) {
      throw new Error('Receiver public key is required to be able to encrypt data.');
    }

    const sharedSecret = await this.getSharedSecret(receiverPublicKey);

    await this.aesEncryption.importSecretKey(sharedSecret);
  }

  public getType(): string {
    return this.type;
  }

  public async getMetadata(): Promise<EncryptionMetaData> {
    const senderPublicKey = await this.encryptor.getPublicKey();

    if (!senderPublicKey) {
      throw new Error('Public key was not able to retrieved from Encryptor extension');
    }

    return {
      type: this.getType(),
      senderPublicKey,
    };
  }

  public async encrypt(data: ArrayBuffer): Promise<ArrayBuffer> {
    return this.aesEncryption.encrypt(data);
  }

  public async decrypt(
    data: ArrayBuffer,
    encryptionMetaData: EncryptionMetaData,
  ): Promise<ArrayBuffer> {
    if (!encryptionMetaData || typeof encryptionMetaData['senderPublicKey'] !== 'string') {
      throw new Error('Invalid encryption metadata.');
    }

    const sharedSecret = await this.getSharedSecret(encryptionMetaData['senderPublicKey']);

    const aesEncryption = new AesEncryption();
    await aesEncryption.importSecretKey(sharedSecret);

    return aesEncryption.decrypt(data);
  }

  private async getSharedSecret(publicKey: string): Promise<string> {
    const sharedSecret = await this.encryptor.computeSharedSecretKey(publicKey);

    if (!sharedSecret) {
      throw new Error('Encryptor was not able to calculate shared secret key.');
    }

    // Create an SHA-256 hash of shared secret key, so it will be the right length
    return this.createHash(sharedSecret);
  }

  private createHash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }
}
