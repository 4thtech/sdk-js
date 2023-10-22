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

  private readonly aesEncryption = new AesEncryption();

  private readonly cachedSharedSecretKeys = new Map<string, string>();

  private receiverPublicKey?: string;

  constructor(private readonly encryptorService: EncryptorService) {}

  public async initialize(receiverAddress: string): Promise<void> {
    this.receiverPublicKey = await this.encryptorService.retrieveUserPublicKey(receiverAddress);

    if (!this.receiverPublicKey) {
      throw new Error('Receiver public key is required to be able to encrypt data.');
    }

    const sharedSecret = await this.getSharedSecret(this.receiverPublicKey);

    await this.aesEncryption.importSecretKey(sharedSecret);
  }

  public getType(): string {
    return this.type;
  }

  public async getMetadata(): Promise<EncryptionMetaData> {
    const senderPublicKey = await this.getEncryptorPublicKey();

    if (!this.receiverPublicKey) {
      throw new Error('Receiver public key was not set.');
    }

    return {
      type: this.getType(),
      senderPublicKey,
      receiverPublicKey: this.receiverPublicKey,
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

    const encryptorPublicKey = await this.getEncryptorPublicKey();
    const publicKeyFromOtherParty =
      encryptorPublicKey === encryptionMetaData['senderPublicKey']
        ? encryptionMetaData['receiverPublicKey']
        : encryptionMetaData['senderPublicKey'];

    const sharedSecret = await this.getSharedSecret(publicKeyFromOtherParty);

    const aesEncryption = new AesEncryption();
    await aesEncryption.importSecretKey(sharedSecret);

    return aesEncryption.decrypt(data);
  }

  private async getEncryptorPublicKey(): Promise<string> {
    const encryptorPublicKey = await this.encryptorService.getPublicKey();

    if (!encryptorPublicKey) {
      throw new Error('Public key was not able to retrieved from Encryptor extension.');
    }

    return encryptorPublicKey;
  }

  private async getSharedSecret(publicKey: string): Promise<string> {
    // Attempt to get the cached shared secret
    const cachedSecret = await this.getCachedSharedSecret(publicKey);
    if (cachedSecret) {
      return cachedSecret;
    }

    const sharedSecret = await this.encryptorService.computeSharedSecretKey(publicKey);

    if (!sharedSecret) {
      throw new Error('Encryptor was not able to calculate shared secret key.');
    }

    // Create an SHA-256 hash of shared secret key, so it will be the right length
    const hashedSecret = this.createHash(sharedSecret);

    // Cache the hashed shared secret
    await this.setCachedSharedSecret(publicKey, hashedSecret);

    return hashedSecret;
  }

  private createHash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  private async getCachedSharedSecret(
    publicKeyFromOtherParty: string,
  ): Promise<string | undefined> {
    const cacheKey = await this.generateCacheKey(publicKeyFromOtherParty);
    return this.cachedSharedSecretKeys.get(cacheKey);
  }

  private async setCachedSharedSecret(
    publicKeyFromOtherParty: string,
    sharedSecret: string,
  ): Promise<void> {
    const cacheKey = await this.generateCacheKey(publicKeyFromOtherParty);
    this.cachedSharedSecretKeys.set(cacheKey, sharedSecret);
  }

  private async generateCacheKey(publicKeyFromOtherParty: string): Promise<string> {
    const encryptorPublicKey = await this.encryptorService.getPublicKey();
    return `${encryptorPublicKey}-${publicKeyFromOtherParty}`;
  }
}
