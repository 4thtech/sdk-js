import {
  Address,
  ContractAbi,
  ContractConfig,
  EthereumTransactionRequest,
  EthereumTransactionResponse,
  WalletClient,
} from '@4thtech-sdk/types';
import { ContractRevertedError } from '@4thtech-sdk/utils';
import {
  BaseError,
  createPublicClient,
  decodeErrorResult,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  http,
  InternalRpcError,
  PublicClient,
  RawContractError,
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
      transport: http(undefined, {
        batch: true,
      }),
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
  }: Omit<EncodeFunctionDataParameters<ContractAbi>, 'abi'> & {
    fee?: bigint;
  }) {
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
    try {
      return await this.walletClient.sendTransaction(transactionRequest);
    } catch (err) {
      throw this.parseError(err);
    }
  }

  private parseError(err: unknown) {
    const { code, data, message } = (
      err instanceof RawContractError
        ? err
        : err instanceof BaseError
          ? err.walk((err) => 'data' in (err as Error)) || err.walk()
          : {}
    ) as RawContractError;

    return [3, InternalRpcError.code].includes(code) && (data || message)
      ? (() => {
          if (data) {
            const decoded = decodeErrorResult({
              abi: this.contractConfig.abi,
              data: (typeof data === 'object' ? data.data : data) as unknown as `0x${string}`,
            });

            return new ContractRevertedError(decoded);
          }

          return new Error(message);
        })()
      : err;
  }
}
