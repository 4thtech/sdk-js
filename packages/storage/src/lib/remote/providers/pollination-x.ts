import { RemoteStorageProvider } from '../remote-storage-provider';
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { extract, Headers } from 'tar-stream';
import stream from 'stream';
import { FileInput } from '@4thtech-sdk/types';
import { concatenateArrayBuffers } from '@4thtech-sdk/utils';

export class PollinationX extends RemoteStorageProvider {
  private readonly client: AxiosInstance;

  constructor(baseURL: string, token: string) {
    super();

    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      paramsSerializer: {
        indexes: null,
      },
    });
  }

  public async upload(file: FileInput, fileName?: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.loaded && progressEvent.total) {
          const percent = (progressEvent.loaded / progressEvent.total) * 100;
          this.emitUploadProgress(percent, fileName);
        }
      },
    });

    if (!response.data.Hash) {
      throw new Error('An error occurred during uploading');
    }

    return `https://gateway.btfs.io/btfs/${response.data.Hash}`;
  }

  public async download(url: string): Promise<ArrayBuffer> {
    const urlObj = new URL(url);
    const response = await this.client.post('get', null, {
      params: {
        arg: urlObj.pathname,
      },
      responseType: 'arraybuffer',
    });

    return new Promise((resolve) => {
      const tarExtract = extract();
      const chunks: ArrayBuffer[] = [];

      tarExtract.on(
        'entry',
        (header: Headers, stream: stream.Readable, next: (error?: unknown) => void) => {
          if (header.type === 'file') {
            stream.on('data', (chunk) => {
              chunks.push(chunk);
            });

            stream.on('end', () => {
              resolve(concatenateArrayBuffers(...chunks));
              next();
            });
          } else {
            stream.resume();
          }
        },
      );

      tarExtract.end(Buffer.from(response.data));
    });
  }
}
