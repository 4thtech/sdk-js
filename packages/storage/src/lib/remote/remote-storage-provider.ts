import { FileInput, UploadProgressCallback } from '@4thtech-sdk/types';

export abstract class RemoteStorageProvider {
  private uploadProgressListener?: UploadProgressCallback;

  public abstract upload(file: FileInput, fileName?: string): Promise<string>;

  public abstract download(url: string): Promise<ArrayBuffer>;

  public onUploadProgress(listener: UploadProgressCallback): void {
    this.uploadProgressListener = listener;
  }

  public offUploadProgress(): void {
    this.uploadProgressListener = undefined;
  }

  protected emitUploadProgress(percent: number, fileName?: string): void {
    if (this.uploadProgressListener) {
      this.uploadProgressListener(percent, fileName);
    }
  }
}
