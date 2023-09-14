import {
  Chain,
  EthereumTransactionRequest,
  EthereumTransactionResponse,
  RequiredContractParams,
  Signer,
} from '@4thtech-sdk/types';
import { Provider } from '@ethersproject/providers';
import { Contract, getDefaultProvider } from 'ethers';
import { PopulatedTransaction } from '@ethersproject/contracts';
import { hexlify } from 'ethers/lib/utils';

export type BaseContractConfig = {
  signer: Signer;
  contractParams: RequiredContractParams;
  chain: Chain;
};

export class BaseContract {
  private readonly signer: Signer;

  private readonly provider: Provider;

  private readonly chain: Chain;

  protected readonly contract: Contract;

  constructor(config: BaseContractConfig) {
    const { signer, contractParams, chain } = config;

    this.signer = signer;
    this.provider = this.signer.provider ?? getDefaultProvider(chain.networkEndpoint);
    this.chain = chain;
    this.contract = new Contract(contractParams.address, contractParams.abi, this.provider);
  }

  protected async sendTransaction(
    populatedTx: PopulatedTransaction,
  ): Promise<EthereumTransactionResponse | object> {
    if (this.signer.sendTransaction) {
      return this.sendTransactionExternally(populatedTx);
    }

    return this.sendTransactionInternally(populatedTx);
  }

  private async sendTransactionExternally(populatedTx: PopulatedTransaction): Promise<object> {
    if (!this.signer.sendTransaction) {
      throw new Error('Signer does not support sendTransaction method');
    }

    return this.signer.sendTransaction(populatedTx);
  }

  private async sendTransactionInternally(
    populatedTx: PopulatedTransaction,
  ): Promise<EthereumTransactionResponse> {
    const transactionRequest = await this.getFullyPopulatedTransactionRequest(populatedTx);
    const signedTransaction = await this.signer.signTransaction(transactionRequest);

    return this.provider.sendTransaction(signedTransaction);
  }

  private async getFullyPopulatedTransactionRequest(
    populatedTx: PopulatedTransaction,
  ): Promise<EthereumTransactionRequest> {
    return {
      ...populatedTx,
      gasPrice: await this.provider.getGasPrice(),
      // TODO: do proper estimation, test this => (await this.provider.estimateGas(populatedTx)).toNumber()
      gasLimit: hexlify(950000),
      chainId: this.chain.id,
      nonce: await this.provider.getTransactionCount(this.signer.getAddress()),
    };
  }
}
