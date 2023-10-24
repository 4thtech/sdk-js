import { FileInput, UploadProgressCallback } from '@4thtech-sdk/types';

export abstract class RemoteStorageProvider {
  public uploadProgressListener?: UploadProgressCallback;

  public abstract upload(file: FileInput, fileName?: string): Promise<string>;

  public abstract download(url: string): Promise<ArrayBufferLike>;

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
