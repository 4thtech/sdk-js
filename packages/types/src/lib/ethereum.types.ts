import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { NetworkType } from './network.types';
import { DeepRequired } from 'ts-essentials';

export type Address = `0x${string}`;

export type ContractParams = {
  address: Address;
  abi?: string;
};

export type RequiredContractParams = DeepRequired<ContractParams>;

export type Chain = {
  id: number;
  name: string;
  network: string;
  type: NetworkType;
  networkEndpoint: string;
  contracts: {
    appFeeManager?: ContractParams;
    chat?: ContractParams;
    mail?: ContractParams;
    user?: ContractParams;
  };
};

export type ChatReadyChain = Chain & {
  contracts: {
    chat: ContractParams;
  };
};

export type MailReadyChain = Chain & {
  contracts: {
    mail: ContractParams;
  };
};

export type UserReadyChain = Chain & {
  contracts: {
    user: ContractParams;
  };
};

export type EthereumTransactionRequest = TransactionRequest;

export type EthereumTransactionResponse = TransactionResponse;
