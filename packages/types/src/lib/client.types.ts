import {
  Address,
  Chain,
  EthereumTransactionRequest,
  EthereumTransactionResponse,
} from './ethereum.types';

export interface WalletClient {
  readonly chain: Chain;

  getAddress(): Promise<Address>;

  sendTransaction(
    transactionRequest: EthereumTransactionRequest,
  ): Promise<EthereumTransactionResponse>;
}
