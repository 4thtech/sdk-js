import type { Abi, Chain as ViemChain, Hash, Hex } from 'viem';

export type Address = `0x${string}`;

export type AppId = `0x${string}`;

export type TransactionHash = Hash;

export type ContractAbi = Abi | readonly unknown[];

export type ContractConfig<TAbi extends ContractAbi> = {
  address: Address;
  abi: TAbi;
};

export type ChainContract = {
  address: Address;
};

export type ChainContracts = {
  appFeeManager?: ChainContract;
  mail?: ChainContract;
  chat?: ChainContract;
  user?: ChainContract;
};

export type Chain = ViemChain & {
  contracts: Partial<ChainContracts>;
};

export type EthereumTransactionRequest = {
  to: Address;
  data: Hex;
  value?: bigint;
};

export type EthereumTransactionResponse = TransactionHash;
