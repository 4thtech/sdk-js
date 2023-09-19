import { Encryption, EncryptionMetaData, EncryptionType } from '@4thtech-sdk/types';

export type EncryptionHandlerConfig = {
  encryptionImplementations: Encryption[];
};

export class EncryptionHandler {
  private readonly encryptionMap: Map<EncryptionType, Encryption>;

  constructor(config: EncryptionHandlerConfig) {
    const { encryptionImplementations } = config;

    this.encryptionMap = new Map();

    encryptionImplementations.forEach((encryption) => {
      this.addEncryptionInstance(encryption);
    });
  }

  public addEncryptionInstance(encryptionInstance: Encryption): void {
    const encryptionType = encryptionInstance.getType() as EncryptionType;
    this.encryptionMap.set(encryptionType, encryptionInstance);
  }

  public async encrypt(data: ArrayBuffer, encryptionType: EncryptionType): Promise<ArrayBuffer> {
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

  public getEncryption(encryptionType: EncryptionType): Encryption {
    const encryption = this.encryptionMap.get(encryptionType);

    if (!encryption) {
      throw new Error(`Unsupported encryption type: ${encryptionType}`);
    }

    return encryption;
  }
}
