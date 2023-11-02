import { Encryption, EncryptionMetaData, EncryptionType } from '@4thtech-sdk/types';

/**
 * Configuration for creating an instance of the EncryptionHandler.
 *
 * @property {Encryption[]} encryptionImplementations - Array of encryption implementations.
 */
export type EncryptionHandlerConfig = {
  encryptionImplementations: Encryption[];
};

/**
 * Class responsible for handling different encryption implementations.
 */
export class EncryptionHandler {
  private readonly encryptionMap: Map<EncryptionType, Encryption>;

  /**
   * Initialize a new EncryptionHandler.
   *
   * @param {EncryptionHandlerConfig} config - Configuration for the EncryptionHandler.
   */
  constructor(config: EncryptionHandlerConfig) {
    const { encryptionImplementations } = config;

    this.encryptionMap = new Map();

    encryptionImplementations.forEach((encryption) => {
      this.addEncryptionInstance(encryption);
    });
  }

  /**
   * Adds an encryption instance to the handler.
   *
   * @param {Encryption} encryptionInstance - The encryption instance to be added.
   */
  public addEncryptionInstance(encryptionInstance: Encryption): void {
    const encryptionType = encryptionInstance.type as EncryptionType;
    this.encryptionMap.set(encryptionType, encryptionInstance);
  }

  /**
   * Encrypts given data using the specified encryption type.
   *
   * @param {ArrayBuffer} data - The data to be encrypted.
   * @param {EncryptionType} encryptionType - The type of encryption to use.
   * @returns {Promise<ArrayBuffer>} Promise that resolves to the encrypted data.
   */
  public async encrypt(data: ArrayBuffer, encryptionType: EncryptionType): Promise<ArrayBuffer> {
    const encryption = this.getEncryption(encryptionType);
    return encryption.encrypt(data);
  }

  /**
   * Decrypts given data using the specified encryption metadata.
   *
   * @param {ArrayBuffer} data - The encrypted data to be decrypted.
   * @param {EncryptionMetaData} encryptionMetaData - Metadata about the encryption used.
   * @returns {Promise<ArrayBuffer>} Promise that resolves to the decrypted data.
   */
  public async decrypt(
    data: ArrayBuffer,
    encryptionMetaData: EncryptionMetaData,
  ): Promise<ArrayBuffer> {
    const encryption = this.getEncryption(encryptionMetaData.type as EncryptionType);
    return encryption.decrypt(data, encryptionMetaData);
  }

  /**
   * Retrieves an encryption implementation based on the encryption type.
   *
   * @param {EncryptionType} encryptionType - The type of encryption to retrieve.
   * @returns {Encryption} The encryption implementation.
   * @throws Will throw an error if the encryption type is unsupported.
   */
  public getEncryption(encryptionType: EncryptionType): Encryption {
    const encryption = this.encryptionMap.get(encryptionType);

    if (!encryption) {
      throw new Error(`Unsupported encryption type: ${encryptionType}`);
    }

    return encryption;
  }
}
