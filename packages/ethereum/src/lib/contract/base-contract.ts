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

type BaseContractConfig = {
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

  protected async prepareTransactionData(
    populatedTx: PopulatedTransaction,
  ): Promise<EthereumTransactionRequest> {
    return {
      ...populatedTx,
      value: 0, // TODO: add fee?
      gasPrice: await this.provider.getGasPrice(),
      // TODO: do proper estimation, test this => (await this.provider.estimateGas(populatedTx)).toNumber()
      gasLimit: hexlify(950000),
      chainId: this.chain.id,
      nonce: await this.provider.getTransactionCount(this.signer.getAddress()),
    };
  }

  protected async sendTransaction(
    populatedTx: PopulatedTransaction,
  ): Promise<EthereumTransactionResponse | object> {
    if (this.signer.sendTransaction) {
      return this.signer.sendTransaction(populatedTx);
    }

    const prepareTransaction = await this.prepareTransactionData(populatedTx);
    const signedTransaction = await this.signer.signTransaction(prepareTransaction);

    return this.provider.sendTransaction(signedTransaction);
  }
}
