import { Encryption, EncryptionMetaData, EncryptionType } from '@4thtech-sdk/types';
import {
  arrayBufferToHexString,
  concatenateArrayBuffers,
  getRandomValues,
  hexStringToArrayBuffer,
  subtle,
} from '@4thtech-sdk/utils';

export class AesEncryption implements Encryption {
  private readonly name = 'AES-GCM';
  private readonly ivLength = 12;
  private readonly type = EncryptionType.AES;
  private secretKey: CryptoKey | undefined;

  public static async fromSecretKey(secretKey: string): Promise<AesEncryption> {
    const aes = new AesEncryption();
    await aes.importSecretKey(secretKey);
    return aes;
  }

  public getType(): string {
    return this.type;
  }

  public getMetadata(): EncryptionMetaData {
    return {
      type: this.getType(),
    };
  }

  public async generateSecretKey(): Promise<void> {
    this.secretKey = await subtle.generateKey({ name: this.name, length: 256 }, true, [
      'encrypt',
      'decrypt',
    ]);
  }

  public async exportSecretKey(): Promise<string> {
    if (!this.secretKey) {
      throw new Error('Secret key has not been generated or imported.');
    }

    const keyBuffer = await subtle.exportKey('raw', this.secretKey);

    return arrayBufferToHexString(keyBuffer);
  }

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

  public async encrypt(data: ArrayBuffer): Promise<ArrayBuffer> {
    if (!this.secretKey) {
      throw new Error('Secret key has not been generated or imported.');
    }

    const iv = getRandomValues(new Uint8Array(this.ivLength));

    const encryptedData = await subtle.encrypt({ name: this.name, iv }, this.secretKey, data);
    return concatenateArrayBuffers(iv, encryptedData);
  }

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
