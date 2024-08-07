import { Chain } from '@4thtech-sdk/types';
import { hardhat as viemHardhat } from 'viem/chains';

export const hardhat: Chain = {
  ...viemHardhat,
  contracts: {
    appFeeManager: {
      address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    },
    mail: {
      address: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    },
    chat: {
      address: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    },
    user: {
      address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    },
  },
};
