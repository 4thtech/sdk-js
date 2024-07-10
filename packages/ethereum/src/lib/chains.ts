import { defineChain } from 'viem';
import {
  fantomTestnet as viemFantomTestnet,
  hardhat as viemHardhat,
} from 'viem/chains';
import { Chain } from '@4thtech-sdk/types';

// You can find a chain list at https://chainlist.org

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

export const immu3Testnet: Chain = defineChain({
  id: 3100,
  name: 'Immu3 EVM Testnet',
  network: 'immu-testnet',
  nativeCurrency: { name: 'IMMU', symbol: 'IMMU', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://fraa-flashbox-2800-rpc.a.stagenet.tanssi.network'],
    },
    public: {
      http: ['https://fraa-flashbox-2800-rpc.a.stagenet.tanssi.network'],
    },
  },
  contracts: {
    appFeeManager: {
      address: '0xCf22290CC8B21bb834C26412E7143c46C142E5f4',
    },
    mail: {
      address: '0xaA70aD6D4dc4CBf3ec1f6CC07bF93e72B881fF44',
    },
    chat: {
      address: '0x6BC7B159a8d97B907B2F1912769DE72FE8b773A0',
    },
    user: {
      address: '0x54FF47513810F1beE9FE3D1d55d3EAfdb741F54d',
    },
  },
  testnet: true,
});

export const fantomTestnet: Chain = {
  ...viemFantomTestnet,
  contracts: {
    appFeeManager: {
      address: '0xCf22290CC8B21bb834C26412E7143c46C142E5f4',
    },
    mail: {
      address: '0xaA70aD6D4dc4CBf3ec1f6CC07bF93e72B881fF44',
    },
    chat: {
      address: '0x6BC7B159a8d97B907B2F1912769DE72FE8b773A0',
    },
    user: {
      address: '0x54FF47513810F1beE9FE3D1d55d3EAfdb741F54d',
    },
  },
};
