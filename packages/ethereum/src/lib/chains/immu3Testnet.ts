import { Chain } from '@4thtech-sdk/types';
import { defineChain } from 'viem';

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
