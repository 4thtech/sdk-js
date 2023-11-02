import { FileInput, UploadProgressCallback } from '@4thtech-sdk/types';

/**
 * Abstract class representing a provider for remote storage functionalities.
 */
export abstract class RemoteStorageProvider {
  private uploadProgressListener?: UploadProgressCallback;

  /**
   * Uploads a file to remote storage.
   *
   * @param {FileInput} file - The file input to be uploaded.
   * @param {string} [fileName] - The optional file name.
   * @returns {Promise<string>} Returns a promise resolving to the URL of the uploaded file.
   */
  public abstract upload(file: FileInput, fileName?: string): Promise<string>;

  /**
   * Downloads a file from a given URL.
   *
   * @param {string} url - The URL of the file to be downloaded.
   * @returns {Promise<ArrayBuffer>} Returns a promise resolving to an ArrayBuffer of the downloaded file.
   */
  public abstract download(url: string): Promise<ArrayBuffer>;

  /**
   * Registers an upload progress listener.
   *
   * @param {UploadProgressCallback} listener - The callback to be invoked on upload progress.
   */
  public onUploadProgress(listener: UploadProgressCallback): void {
    this.uploadProgressListener = listener;
  }

  /**
   * De-registers the upload progress listener.
   */
  public offUploadProgress(): void {
    this.uploadProgressListener = undefined;
  }

  /**
   * Emits the upload progress to the registered listener.
   *
   * @param {number} percent - The percentage of upload completion.
   * @param {string} [fileName] - The optional file name.
   */
  protected emitUploadProgress(percent: number, fileName?: string): void {
    if (this.uploadProgressListener) {
      this.uploadProgressListener(percent, fileName);
    }
  }
}
