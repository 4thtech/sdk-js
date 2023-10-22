import { BaseContract } from './base-contract';
import { usersAbi } from './abi/users-abi';
import { UserConfig } from '../user';
import { validateChainContractExistence } from '../utils';

export class UserContract extends BaseContract<typeof usersAbi> {
  constructor(config: UserConfig) {
    const { walletClient } = config;

    validateChainContractExistence(walletClient.chain.contracts, 'user');

    super({
      walletClient,
      contractConfig: {
        address: walletClient.chain.contracts.user.address,
        abi: usersAbi,
      },
    });
  }
}
