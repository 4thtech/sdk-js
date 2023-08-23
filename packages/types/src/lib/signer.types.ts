import { EthereumTransactionRequest } from './ethereum.types';
import { Provider } from '@ethersproject/providers';

export interface Signer {
  provider?: Provider;

  sendTransaction?(tx: EthereumTransactionRequest): Promise<object>; // TODO: replace Object with T?

  signTransaction(tx: EthereumTransactionRequest): Promise<string>;

  getAddress(): Promise<string>;
}
