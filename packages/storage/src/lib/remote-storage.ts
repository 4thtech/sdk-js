import {
  Encryption,
  FileProgressInfo,
  isPathBasedFileInfo,
  LocalFileInfo,
  PromiseFulfilledResult,
  RemoteFileInfo,
  RemoteFileMetaData,
} from '@4thtech-sdk/types';
import { createReadStream } from 'fs';
import { RemoteStorageProvider } from './remote/remote-storage-provider';
import path from 'path';
import { createHash } from 'crypto';
import { Readable, Transform } from 'stream';
import { EncryptionHandler } from '@4thtech-sdk/encryption';

type RemoteStorageConfig = {
  storageProvider: RemoteStorageProvider;
  encryptionHandler?: EncryptionHandler;
};

export class RemoteStorage {
  private readonly storageProvider: RemoteStorageProvider;

  private readonly encryptionHandler?: EncryptionHandler;

  constructor(config: RemoteStorageConfig) {
    this.storageProvider = config.storageProvider;
    this.encryptionHandler = config.encryptionHandler;
  }

  public async store(
    fileInfos: LocalFileInfo | LocalFileInfo[],
    encryption?: Encryption,
    onUploadProgress?: (progressInfo: FileProgressInfo) => void,
  ): Promise<RemoteFileInfo | RemoteFileInfo[]> {
    // Track file upload progress
    if (onUploadProgress) {
      this.storageProvider.onUploadProgress((percent, fileName) => {
        onUploadProgress({ percent, fileName });
      });
    }

    if (!Array.isArray(fileInfos)) {
      return this.processAndStoreFile(fileInfos, encryption);
    }

    const settledRemoteFileInfos = await Promise.allSettled(
      fileInfos.map(async (fileInfo) => {
        return this.processAndStoreFile(fileInfo, encryption);
      }),
    );

    // TODO: what to do with rejected promises??
    return settledRemoteFileInfos
      .filter((fileInfo) => fileInfo.status === 'fulfilled')
      .map((fileInfo) => (fileInfo as PromiseFulfilledResult<RemoteFileInfo>).value);
  }

  public async retrieve(remoteFileInfo: RemoteFileInfo): Promise<ArrayBufferLike> {
    // TODO: call proper storage provider based on URL
    // TODO: handle error if file doesn't exist
    // TODO: check if checksum match

    const { URL, checksum, metadata } = remoteFileInfo;
    const parsedMetadata = this.decodeMetaData(metadata);

    let fileContent = await this.storageProvider.download(URL);

    if (parsedMetadata?.encryption && this.encryptionHandler) {
      fileContent = await this.encryptionHandler.decrypt(fileContent, parsedMetadata.encryption);
    }

    return fileContent;
  }

  private encodeMetaData(metadata: RemoteFileMetaData): string {
    return JSON.stringify(metadata);
  }

  private decodeMetaData(metadata: string): RemoteFileMetaData | undefined {
    try {
      return JSON.parse(metadata) as RemoteFileMetaData;
    } catch {
      return undefined;
    }
  }

  private async processAndStoreFile(
    fileInfo: LocalFileInfo,
    encryption?: Encryption,
  ): Promise<RemoteFileInfo> {
    const fileName = this.getFileName(fileInfo);
    const [checksum, fileUrl] = isPathBasedFileInfo(fileInfo)
      ? await this.processPathBasedFile(fileInfo.path, fileName, encryption)
      : await this.processBufferBasedFile(fileInfo.content, fileName, encryption);

    const metadata: RemoteFileMetaData = {};
    if (encryption) {
      metadata.encryption = await encryption.getMetadata();
    }

    return {
      name: fileName,
      URL: fileUrl,
      checksum,
      metadata: this.encodeMetaData(metadata),
    };
  }

  private async processPathBasedFile(
    filePath: string,
    fileName: string,
    encryption?: Encryption,
  ): Promise<[string, string]> {
    const checksum = await this.calculateChecksumFromStream(filePath);

    let stream: Readable = createReadStream(filePath);

    if (encryption) {
      stream = await this.encryptStream(stream, encryption);
    }

    const fileUrl = await this.storageProvider.upload(stream, fileName);

    return [checksum, fileUrl];
  }

  private async encryptStream(readStream: Readable, encryption: Encryption): Promise<Readable> {
    const transform = new Transform({
      transform: async (chunk, encoding, callback) => {
        try {
          const encryptedChunk = await encryption.encrypt(chunk);
          callback(null, encryptedChunk);
        } catch (error) {
          callback(error as Error);
        }
      },
    });

    readStream.on('error', (error) => {
      console.error('Error in encryptStream', error);
      transform.emit('error', error);
    });

    return readStream.pipe(transform);
  }

  private async processBufferBasedFile(
    fileContent: Buffer | ArrayBuffer | Blob,
    fileName: string,
    encryption?: Encryption,
  ): Promise<[string, string]> {
    const contentBuffer = await this.toContentBuffer(fileContent);

    const checksum = this.calculateChecksum(contentBuffer);

    if (encryption) {
      fileContent = await encryption.encrypt(contentBuffer);

      // Encrypted content must be converted to Blob in browser env, otherwise content won't be stored correctly on server
      if (typeof window !== 'undefined') {
        fileContent = new Blob([fileContent], {
          type: 'application/octet-stream',
        });
      }
    }

    const fileUrl = await this.storageProvider.upload(fileContent, fileName);

    return [checksum, fileUrl];
  }

  private async toContentBuffer(fileContent: Buffer | Blob | ArrayBuffer): Promise<ArrayBuffer> {
    if (fileContent instanceof Buffer || fileContent instanceof ArrayBuffer) {
      return fileContent;
    }
    return await fileContent.arrayBuffer();
  }

  private getFileName(localFileInfo: LocalFileInfo): string {
    return isPathBasedFileInfo(localFileInfo)
      ? localFileInfo.name || path.basename(localFileInfo.path)
      : localFileInfo.name;
  }

  private calculateChecksum(data: ArrayBuffer): string {
    return createHash('sha256').update(new Uint8Array(data)).digest('hex');
  }

  private async calculateChecksumFromStream(filePath: string): Promise<string> {
    const readStream = createReadStream(filePath);

    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      readStream
        .on('data', (chunk) => {
          hash.update(chunk);
        })
        .on('error', (error) => {
          readStream.close();
          reject(error);
        })
        .on('end', () => {
          readStream.close();
          resolve(hash.digest('hex'));
        });
    });
  }
}
