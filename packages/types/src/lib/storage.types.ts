import { Readable } from 'stream';
import { EncryptionMetaData } from './encryption.types';

export type FileInput = ArrayBuffer | Blob | Readable;

export type PathBasedFileInfo = {
  name?: string;
  path: string;
};

export type ContentBasedFileInfo = {
  name: string;
  content: ArrayBuffer | Blob;
};

export type LocalFileInfo = PathBasedFileInfo | ContentBasedFileInfo;

export type RemoteFileMetaData = {
  encryption?: EncryptionMetaData;
};

export type RemoteFileInfo = {
  name: string;
  URL: string;
  size: number;
  type: string;
  checksum: string;
  metadata: string;
};

export type UploadProgressCallback = (percent: number, fileName?: string) => void;

// TODO: move code bellow somewhere else??
export function isPathBasedFileInfo(object: unknown): object is PathBasedFileInfo {
  if (object !== null && typeof object === 'object') {
    return 'path' in object;
  }

  return false;
}

export function isContentBasedFileInfo(object: unknown): object is ContentBasedFileInfo {
  if (object !== null && typeof object === 'object') {
    return 'content' in object;
  }

  return false;
}

export function isLocalFileInfo(object: unknown): object is LocalFileInfo {
  if (object !== null && typeof object === 'object') {
    return isPathBasedFileInfo(object) || isContentBasedFileInfo(object);
  }

  return false;
}

export function isRemoteFileInfo(object: unknown): object is RemoteFileInfo {
  if (object !== null && typeof object === 'object') {
    return 'URL' in object;
  }

  return false;
}
