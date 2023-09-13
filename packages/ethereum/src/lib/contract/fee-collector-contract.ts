import { BigNumber } from 'ethers';
import { BaseContract, BaseContractConfig } from './base-contract';
import { PopulatedTransaction } from '@ethersproject/contracts';
import { hexZeroPad } from 'ethers/lib/utils';

export type FeeCollectorContractConfig = BaseContractConfig & {
  appId?: string;
};

export class FeeCollectorContract extends BaseContract {
  private cachedAppRequiredFee?: BigNumber;

  protected readonly appId: string;

  constructor(config: FeeCollectorContractConfig) {
    const { signer, contractParams, chain, appId } = config;

    super({
      signer,
      contractParams,
      chain,
    });

    this.appId = appId ?? hexZeroPad('0x0', 32);

    // Fetch and cache the app required fee at initialization
    this.initializeAppRequiredFee().catch((error) => {
      console.error('Error initializing app required fee:', error);
    });

    // TODO: listen for app required fee changes on appropriate events on AppFeeManager contract and re-cache it
  }

  private async initializeAppRequiredFee(): Promise<void> {
    this.cachedAppRequiredFee = await this.getAppRequiredFee();
  }

  protected async appendAppRequiredFee(populatedTx: PopulatedTransaction): Promise<void> {
    // Cache the app required fee if it has not been cached yet
    if (!this.cachedAppRequiredFee) {
      this.cachedAppRequiredFee = await this.getAppRequiredFee();
    }

    populatedTx.value = this.cachedAppRequiredFee;
  }

  private async getAppRequiredFee(): Promise<BigNumber> {
    return this.contract['getAppRequiredFee'](this.appId);
  }
}
