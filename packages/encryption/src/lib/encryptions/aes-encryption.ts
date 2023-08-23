import { Encryption, EncryptionMetaData, EncryptionType } from '@4thtech-sdk/types';
import { webcrypto } from 'crypto';
// import * as crypto from 'crypto';
let crypto: Crypto | webcrypto.Crypto;

if (typeof window !== 'undefined' && window.crypto) {
  // Browser environment
  crypto = window.crypto;
} else {
  // Node.js environment
  import('crypto').then((cryptoModule) => {
    crypto = cryptoModule.webcrypto;
  });
}

export class AesEncryption implements Encryption {
  private readonly name = 'AES-GCM';
  private readonly ivLength = 12;
  private readonly type = EncryptionType.AES;
  private secretKey: CryptoKey | undefined;

  public static async fromSecretKey(
    secretKey: string,
    encoding: BufferEncoding = 'hex',
  ): Promise<AesEncryption> {
    const aes = new AesEncryption();
    await aes.importSecretKey(secretKey, encoding);
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
    this.secretKey = await this.getCrypto().subtle.generateKey(
      { name: this.name, length: 256 },
      true,
      ['encrypt', 'decrypt'],
    );
  }

  public async exportSecretKey(encoding: BufferEncoding = 'hex'): Promise<string> {
    if (!this.secretKey) {
      throw new Error('Secret key has not been generated or imported.');
    }

    const keyBuffer = await this.getCrypto().subtle.exportKey('raw', this.secretKey);
    return Buffer.from(keyBuffer).toString(encoding);
  }

  public async importSecretKey(secretKey: string, encoding: BufferEncoding = 'hex'): Promise<void> {
    const keyBuffer = Buffer.from(secretKey, encoding);

    this.secretKey = await this.getCrypto().subtle.importKey(
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

    const iv = (this.getCrypto() as Crypto).getRandomValues(new Uint8Array(this.ivLength));

    const encryptedData = await this.getCrypto().subtle.encrypt(
      { name: this.name, iv },
      this.secretKey,
      data,
    );

    return Buffer.concat([Buffer.from(iv), Buffer.from(encryptedData)]);
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

    return this.getCrypto().subtle.decrypt({ name: this.name, iv }, this.secretKey, encryptedData);
  }

  private getCrypto() {
    if (!crypto) {
      throw new Error('Crypto module is not available.');
    }
    return crypto;
  }
}
