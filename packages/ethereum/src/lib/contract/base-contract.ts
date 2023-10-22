import {
  Address,
  ContractAbi,
  ContractConfig,
  EthereumTransactionRequest,
  EthereumTransactionResponse,
  WalletClient,
} from '@4thtech-sdk/types';
import {
  createPublicClient,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  http,
  PublicClient,
} from 'viem';

export type BaseContractConfig<TAbi extends ContractAbi> = {
  walletClient: WalletClient;
  contractConfig: ContractConfig<TAbi>;
};

export class BaseContract<TAbi extends ContractAbi> {
  protected readonly publicClient: PublicClient;

  private readonly walletClient: WalletClient;

  protected readonly contractConfig: ContractConfig<TAbi>;

  constructor(config: BaseContractConfig<TAbi>) {
    const { walletClient, contractConfig } = config;

    this.publicClient = createPublicClient({
      chain: walletClient.chain,
      transport: http(),
    });
    this.walletClient = walletClient;
    this.contractConfig = contractConfig as typeof contractConfig;
  }

  protected async getSignerAddress(): Promise<Address> {
    return this.walletClient.getAddress();
  }

  protected async sendContractTransaction({
    functionName,
    args,
    fee,
  }: Omit<EncodeFunctionDataParameters<ContractAbi>, 'abi'> & { fee?: bigint }) {
    const encodedData = encodeFunctionData({
      abi: this.contractConfig.abi,
      functionName,
      args,
    } as unknown as EncodeFunctionDataParameters<ContractAbi>);

    return this.sendTransaction({
      data: encodedData,
      to: this.contractConfig.address,
      value: fee,
    });
  }

  private async sendTransaction(
    transactionRequest: EthereumTransactionRequest,
  ): Promise<EthereumTransactionResponse> {
    return this.walletClient.sendTransaction(transactionRequest);
  }
}
