export type PromiseFulfilledResult<T> = {
  status: 'fulfilled';
  value: T;
};

export type PromiseRejectedResult<T = unknown> = {
  status: 'rejected';
  reason: T;
};
