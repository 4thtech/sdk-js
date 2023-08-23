import { Encryption, EncryptionMetaData, EncryptionType } from '@4thtech-sdk/types';
import { AesEncryption } from './encryptions/aes-encryption';

export type EncryptionHandlerConfig = {
  customEncryptionImplementations?: Map<EncryptionType, Encryption>;
};

export class EncryptionHandler {
  private readonly encryptionMap: Map<EncryptionType, Encryption>;

  constructor(config: EncryptionHandlerConfig) {
    const { customEncryptionImplementations } = config;

    this.encryptionMap = new Map([
      [EncryptionType.AES, new AesEncryption()],
      ...(customEncryptionImplementations || []),
    ]);
  }

  async encrypt(data: ArrayBuffer, encryptionType: EncryptionType): Promise<ArrayBuffer> {
    const encryption = this.getEncryption(encryptionType);
    return encryption.encrypt(data);
  }

  public async decrypt(
    data: ArrayBuffer,
    encryptionMetaData: EncryptionMetaData,
  ): Promise<ArrayBuffer> {
    const encryption = this.getEncryption(encryptionMetaData.type as EncryptionType);
    return encryption.decrypt(data, encryptionMetaData);
  }

  private getEncryption(encryptionType: EncryptionType): Encryption {
    const encryption = this.encryptionMap.get(encryptionType);

    if (!encryption) {
      throw new Error(`Unsupported encryption type: ${encryptionType}`);
    }

    return encryption;
  }
}
