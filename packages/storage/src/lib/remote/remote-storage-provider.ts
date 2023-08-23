import { FileInput } from '@4thtech-sdk/types';
import { EventEmitter } from 'events';

export type UploadProgressCallback = (percent: number, fileName?: string) => void;

export abstract class RemoteStorageProvider {
  public readonly UPLOAD_PROGRESS_EVENT = 'progress';
  public uploadProgressEmitter: EventEmitter;

  protected constructor() {
    this.uploadProgressEmitter = new EventEmitter();
  }

  public abstract upload(file: FileInput, fileName?: string): Promise<string>;

  public abstract download(url: string): Promise<ArrayBufferLike>;

  public onUploadProgress(listener: UploadProgressCallback): void {
    if (!this.uploadProgressEmitter.listenerCount('progress')) {
      this.uploadProgressEmitter.on(this.UPLOAD_PROGRESS_EVENT, listener);
    }
  }

  public offUploadProgress(listener: UploadProgressCallback): void {
    this.uploadProgressEmitter.off(this.UPLOAD_PROGRESS_EVENT, listener);
  }

  protected emitUploadProgress(percent: number, fileName?: string): void {
    this.uploadProgressEmitter.emit(this.UPLOAD_PROGRESS_EVENT, percent, fileName);
  }
}
