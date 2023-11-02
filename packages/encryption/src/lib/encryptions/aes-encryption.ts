import { Encryption, EncryptionMetaData, EncryptionType } from '@4thtech-sdk/types';
import {
  arrayBufferToHexString,
  concatenateArrayBuffers,
  getRandomValues,
  hexStringToArrayBuffer,
  subtle,
} from '@4thtech-sdk/utils';

/**
 * Implements AES Encryption based on the `Encryption` interface.
 * Provides methods for encryption and decryption using AES-GCM.
 *
 * @implements {Encryption}
 */
export class AesEncryption implements Encryption {
  /** Type of encryption being used. */
  public readonly type = EncryptionType.AES;

  /** Encryption algorithm name. */
  private readonly name = 'AES-GCM';

  /** Length of initialization vector (IV) used in encryption. */
  private readonly ivLength = 12;

  /** The secret key used for encryption and decryption. */
  private secretKey: CryptoKey | undefined;

  /**
   * Static method to create an `AesEncryption` instance from a given secret key.
   *
   * @param {string} secretKey - The secret key to import.
   * @returns {Promise<AesEncryption>} Instance of `AesEncryption`.
   */
  public static async fromSecretKey(secretKey: string): Promise<AesEncryption> {
    const aes = new AesEncryption();
    await aes.importSecretKey(secretKey);
    return aes;
  }

  /**
   * Retrieves metadata about the encryption.
   *
   * @returns {EncryptionMetaData} Encryption metadata.
   */
  public getMetadata(): EncryptionMetaData {
    return {
      type: this.type,
    };
  }

  /**
   * Generates a secret key for encryption and decryption.
   *
   * @returns {Promise<void>}
   */
  public async generateSecretKey(): Promise<void> {
    this.secretKey = await subtle.generateKey({ name: this.name, length: 256 }, true, [
      'encrypt',
      'decrypt',
    ]);
  }

  /**
   * Exports the current secret key as a string.
   *
   * @returns {Promise<string>} The secret key as a hexadecimal string.
   * @throws Will throw an error if the secret key hasn't been generated or imported.
   */
  public async exportSecretKey(): Promise<string> {
    if (!this.secretKey) {
      throw new Error('Secret key has not been generated or imported.');
    }

    const keyBuffer = await subtle.exportKey('raw', this.secretKey);

    return arrayBufferToHexString(keyBuffer);
  }

  /**
   * Imports a given secret key for encryption and decryption.
   *
   * @param {string} secretKey - The secret key to import.
   * @returns {Promise<void>}
   */
  public async importSecretKey(secretKey: string): Promise<void> {
    const keyBuffer = hexStringToArrayBuffer(secretKey);

    this.secretKey = await subtle.importKey(
      'raw',
      keyBuffer,
      { name: this.name, length: 256 },
      true,
      ['encrypt', 'decrypt'],
    );
  }

  /**
   * Encrypts the given data using AES-GCM.
   *
   * @param {ArrayBuffer} data - The data to be encrypted.
   * @returns {Promise<ArrayBuffer>} The encrypted data.
   * @throws Will throw an error if the secret key hasn't been generated or imported.
   */
  public async encrypt(data: ArrayBuffer): Promise<ArrayBuffer> {
    if (!this.secretKey) {
      throw new Error('Secret key has not been generated or imported.');
    }

    const iv = getRandomValues(new Uint8Array(this.ivLength));

    const encryptedData = await subtle.encrypt({ name: this.name, iv }, this.secretKey, data);
    return concatenateArrayBuffers(iv, encryptedData);
  }

  /**
   * Decrypts the given data using AES-GCM.
   *
   * @param {ArrayBuffer} data - The encrypted data to be decrypted.
   * @returns {Promise<ArrayBuffer>} The decrypted data.
   * @throws Will throw an error if the secret key hasn't been generated or imported, or if the data is too short.
   */
  public async decrypt(data: ArrayBuffer): Promise<ArrayBuffer> {
    if (!this.secretKey) {
      throw new Error('Secret key has not been generated or imported.');
    }

    const dataBuffer = new Uint8Array(data);

    if (dataBuffer.length < this.ivLength) {
      throw new Error('The data is too short to contain an IV.');
    }

    const iv = dataBuffer.slice(0, this.ivLength);
    const encryptedData = dataBuffer.slice(this.ivLength);

    return subtle.decrypt({ name: this.name, iv }, this.secretKey, encryptedData);
  }
}
