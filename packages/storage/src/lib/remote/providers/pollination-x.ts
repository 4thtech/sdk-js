import { RemoteStorageProvider } from '../remote-storage-provider';
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { extract, Headers } from 'tar-stream';
import stream from 'stream';
import { FileInput } from '@4thtech-sdk/types';
import { concatenateArrayBuffers } from '@4thtech-sdk/utils';

/**
 * Class representing a PollinationX provider for remote storage functionalities. It stores files on BitTorrent File System.
 */
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

  /**
   * Uploads a file to remote storage.
   *
   * @param {FileInput} file - The file input to be uploaded.
   * @param {string} [fileName] - The optional file name.
   * @returns {Promise<string>} Returns a promise resolving to the URL of the uploaded file.
   */
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

  /**
   * Downloads a file from a given URL.
   *
   * @param {string} url - The URL of the file to be downloaded.
   * @returns {Promise<ArrayBuffer>} Returns a promise resolving to an ArrayBuffer of the downloaded file.
   */
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
