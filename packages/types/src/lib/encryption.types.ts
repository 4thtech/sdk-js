export interface Encryption {
  readonly type: string;
  getMetadata(): EncryptionMetaData | Promise<EncryptionMetaData>;
  encrypt(data: ArrayBuffer): Promise<ArrayBuffer>;
  decrypt(data: ArrayBuffer, encryptionMetaData: EncryptionMetaData): Promise<ArrayBuffer>;
}

export enum EncryptionType {
  AES = '4th-tech-aes-gcm',
  ENCRYPTOR_AES = '4th-tech-encryptor-aes-gcm',
}

export type EncryptionMetaData = {
  type: string;
  [key: string]: string;
};
