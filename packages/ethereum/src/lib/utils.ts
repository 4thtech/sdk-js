import { Chain, ChainContracts } from '@4thtech-sdk/types';

export function validateChainContractExistence<C extends keyof ChainContracts>(
  contracts: Chain['contracts'],
  contractKey: C,
): asserts contracts is { [K in C]: ChainContracts } {
  if (!contracts?.[contractKey]?.address) {
    throw new Error(
      `The provided chain in wallet client does not support the '${contractKey}' contract.`,
    );
  }
}
