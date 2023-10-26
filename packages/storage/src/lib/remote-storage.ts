import {
  Encryption,
  FileProgressInfo,
  isPathBasedFileInfo,
  LocalFileInfo,
  PromiseFulfilledResult,
  RemoteFileInfo,
  RemoteFileMetaData,
} from '@4thtech-sdk/types';
import { RemoteStorageProvider } from './remote/remote-storage-provider';
import path from 'path';
import { Readable, Transform } from 'stream';
import { EncryptionHandler } from '@4thtech-sdk/encryption';
import { calculateChecksum, calculateChecksumFromStream } from '@4thtech-sdk/utils';

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

  public async retrieve(remoteFileInfo: RemoteFileInfo): Promise<ArrayBuffer> {
    // TODO: call proper storage provider based on URL
    // TODO: handle error if file doesn't exist

    const { name, URL, checksum, metadata } = remoteFileInfo;
    const parsedMetadata = this.decodeMetaData(metadata);

    let fileContent = await this.storageProvider.download(URL);

    if (parsedMetadata?.encryption && this.encryptionHandler) {
      fileContent = await this.encryptionHandler.decrypt(fileContent, parsedMetadata.encryption);
    }

    // Validate checksum
    const fileContentChecksum = await calculateChecksum(fileContent);
    const checksumMatch = fileContentChecksum === checksum;

    if (!checksumMatch) {
      throw new Error(
        `Data integrity verification failed for file "${name}".
        The content may have been tampered with or corrupted, and therefore won't be loaded.`,
      );
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
    const checksum = await calculateChecksumFromStream(filePath);

    const { createReadStream } = await import('fs');
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
          callback(null, Buffer.from(encryptedChunk));
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
    fileContent: ArrayBuffer | Blob,
    fileName: string,
    encryption?: Encryption,
  ): Promise<[string, string]> {
    const contentBuffer = await this.toContentBuffer(fileContent);

    const checksum = await calculateChecksum(contentBuffer);

    if (encryption) {
      fileContent = await encryption.encrypt(contentBuffer);
    }

    // Content must be converted to Blob in browser env, otherwise content won't be stored correctly on server
    if (typeof window !== 'undefined') {
      fileContent = new Blob([fileContent], {
        type: 'application/octet-stream',
      });
    }

    const fileUrl = await this.storageProvider.upload(fileContent, fileName);

    return [checksum, fileUrl];
  }

  private async toContentBuffer(fileContent: Blob | ArrayBuffer): Promise<ArrayBuffer> {
    if (fileContent instanceof Blob) {
      return await fileContent.arrayBuffer();
    }
    return fileContent;
  }

  private getFileName(localFileInfo: LocalFileInfo): string {
    return isPathBasedFileInfo(localFileInfo)
      ? localFileInfo.name || path.basename(localFileInfo.path)
      : localFileInfo.name;
  }
}
