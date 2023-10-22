import { BaseContract, BaseContractConfig } from './base-contract';
import { AppId, ContractAbi } from '@4thtech-sdk/types';
import { pad } from 'viem';
import { feeCollectorAbi } from './abi/fee-collector-abi';

export type FeeCollectorContractConfig<TAbi extends ContractAbi> = BaseContractConfig<TAbi> & {
  appId?: AppId;
};

export class FeeCollectorContract<TAbi extends ContractAbi> extends BaseContract<TAbi> {
  private cachedAppRequiredFee?: bigint;

  protected readonly appId: AppId;

  constructor(config: FeeCollectorContractConfig<TAbi>) {
    const { walletClient, contractConfig, appId } = config;

    super({
      walletClient,
      contractConfig,
    });

    this.appId = appId ?? pad('0x0', { size: 32 });

    // Fetch and cache the app required fee at initialization
    this.initializeAppRequiredFee().catch((error) => {
      console.error('Error initializing app required fee:', error);
    });

    // TODO: listen for app required fee changes on appropriate events on AppFeeManager contract and re-cache it
  }

  private async initializeAppRequiredFee(): Promise<void> {
    this.cachedAppRequiredFee = await this.fetchAppRequiredFee();
  }

  protected async getAppRequiredFee(): Promise<bigint> {
    // Cache the app required fee if it has not been cached yet
    if (!this.cachedAppRequiredFee) {
      this.cachedAppRequiredFee = await this.fetchAppRequiredFee();
    }

    return this.cachedAppRequiredFee;
  }

  private async fetchAppRequiredFee(): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.contractConfig.address,
      abi: this.contractConfig.abi as typeof feeCollectorAbi,
      functionName: 'getAppRequiredFee',
      args: [this.appId],
    });
  }
}
