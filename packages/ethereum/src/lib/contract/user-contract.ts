import { BaseContract } from './base-contract';
import { ContractUserOutput, UserStruct } from '@4thtech-sdk/types';
import usersAbi from './abi/users-abi.json';
import { UserConfig } from '../user';

export class UserContract extends BaseContract {
  constructor(config: UserConfig) {
    const { signer, chain } = config;

    super({
      signer,
      contractParams: {
        address: chain.contracts.user.address,
        abi: chain.contracts.user.abi ?? JSON.stringify(usersAbi),
      },
      chain,
    });
  }

  protected async processContractUserOutput(
    contractUserOutput: ContractUserOutput,
  ): Promise<UserStruct> {
    const { encryptionPublicKey } = contractUserOutput;

    return {
      encryptionPublicKey: {
        publicKey: encryptionPublicKey.publicKey,
        publicKeyType: encryptionPublicKey.publicKeyType,
      },
    };
  }
}
