import { Chain } from '@4thtech-sdk/types';
import { defineChain } from 'viem';

export const sonic: Chain = defineChain({
  id: 146,
  name: 'Sonic',
  network: 'sonic',
  nativeCurrency: { name: 'S', symbol: 'S', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.soniclabs.com'],
    },
    public: {
      http: ['https://rpc.soniclabs.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sonic Explorer',
      url: 'https://explorer.soniclabs.com',
    },
  },
  contracts: {
    appFeeManager: {
      address: '0x54FF47513810F1beE9FE3D1d55d3EAfdb741F54d',
    },
    mail: {
      address: '0x39Dc65b90e9C96828213E1c10073a3Ac9ee00777',
    },
    chat: {
      address: '0xe8150FcEeF266CF81f4dD936c786E4a041be2d6b',
    },
    user: {
      address: '0x6BC7B159a8d97B907B2F1912769DE72FE8b773A0',
    },
  },
  testnet: false,
});
