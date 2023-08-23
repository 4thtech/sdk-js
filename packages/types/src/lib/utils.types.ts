export type PromiseFulfilledResult<T> = {
  status: 'fulfilled';
  value: T;
};

export type PromiseRejectedResult = {
  status: 'rejected';
  reason: any;
};

export type BinaryLike = string | NodeJS.ArrayBufferView;
