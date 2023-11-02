import {
  Encryption,
  EncryptionMetaData,
  EncryptionType,
  EncryptorService,
} from '@4thtech-sdk/types';
import { AesEncryption } from './aes-encryption';
import { createSha256Hash } from '@4thtech-sdk/utils';

/**
 * Represents an AES encryption approach utilizing the Encryptor extension to compute shared secrets.
 * This allows data encryption between two parties.
 *
 * @implements {Encryption}
 */
export class EncryptorAesEncryption implements Encryption {
  /** Type of encryption being used. */
  public readonly type = EncryptionType.ENCRYPTOR_AES;

  private readonly aesEncryption = new AesEncryption();

  private readonly cachedSharedSecretKeys = new Map<string, string>();

  private receiverPublicKey?: string;

  /**
   * Creates a new EncryptorAesEncryption instance.
   *
   * @param {EncryptorService} encryptorService - Service to communicate with the Encryptor extension.
   */
  constructor(private readonly encryptorService: EncryptorService) {}

  /**
   * Initializes the EncryptorAesEncryption instance by retrieving and caching the receiver's public key.
   *
   * @param {string} receiverAddress - The receiver's address.
   * @throws Will throw an error if the receiver's public key cannot be retrieved.
   */
  public async initialize(receiverAddress: string): Promise<void> {
    this.receiverPublicKey = await this.encryptorService.retrieveUserPublicKey(receiverAddress);

    if (!this.receiverPublicKey) {
      throw new Error('Receiver public key is required to be able to encrypt data.');
    }

    const sharedSecret = await this.getSharedSecret(this.receiverPublicKey);

    await this.aesEncryption.importSecretKey(sharedSecret);
  }

  /**
   * Retrieves the encryption metadata.
   *
   * @returns {Promise<EncryptionMetaData>} Encryption metadata including sender and receiver public keys.
   * @throws Will throw an error if the receiver's public key wasn't set or if the sender's public key cannot be retrieved.
   */
  public async getMetadata(): Promise<EncryptionMetaData> {
    const senderPublicKey = await this.getEncryptorPublicKey();

    if (!this.receiverPublicKey) {
      throw new Error('Receiver public key was not set.');
    }

    return {
      type: this.type,
      senderPublicKey,
      receiverPublicKey: this.receiverPublicKey,
    };
  }

  /**
   * Encrypts the provided data.
   *
   * @param {ArrayBuffer} data - The data to encrypt.
   * @returns {Promise<ArrayBuffer>} Encrypted data.
   */
  public async encrypt(data: ArrayBuffer): Promise<ArrayBuffer> {
    return this.aesEncryption.encrypt(data);
  }

  /**
   * Decrypts the provided data using the given encryption metadata.
   *
   * @param {ArrayBuffer} data - The encrypted data to decrypt.
   * @param {EncryptionMetaData} encryptionMetaData - Metadata about the encryption used.
   * @returns {Promise<ArrayBuffer>} Decrypted data.
   * @throws Will throw an error if the encryption metadata is invalid or if shared secret key cannot be computed.
   */
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

  /**
   * Retrieves the public key from the Encryptor extension.
   *
   * @returns {Promise<string>} The public key.
   * @throws Will throw an error if the public key cannot be retrieved.
   */
  private async getEncryptorPublicKey(): Promise<string> {
    const encryptorPublicKey = await this.encryptorService.getPublicKey();

    if (!encryptorPublicKey) {
      throw new Error('Public key was not able to retrieved from Encryptor extension.');
    }

    return encryptorPublicKey;
  }

  /**
   * Computes a shared secret key with the provided public key.
   *
   * @param {string} publicKey - The public key of the other party.
   * @returns {Promise<string>} Shared secret key.
   * @throws Will throw an error if the shared secret key cannot be computed.
   */
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
    const hashedSecret = await createSha256Hash(sharedSecret);

    // Cache the hashed shared secret
    await this.setCachedSharedSecret(publicKey, hashedSecret);

    return hashedSecret;
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
