import { EthereumTransactionRequest } from './ethereum.types';
import { Provider } from '@ethersproject/providers';

export interface Signer {
  provider?: Provider;

  sendTransaction?(transactionRequest: EthereumTransactionRequest): Promise<object>; // TODO: replace Object with T?

  signTransaction(transactionRequest: EthereumTransactionRequest): Promise<string>;

  getAddress(): Promise<string>;
}
