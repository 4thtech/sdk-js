import { Chain } from '@4thtech-sdk/types';
import { fantom as viemFantom } from 'viem/chains';

export const fantom: Chain = {
  ...viemFantom,
  name: 'Fantom Opera',
  rpcUrls: {
    default: { http: ['https://rpc.ftm.tools'] },
    public: { http: ['https://rpc.ftm.tools'] },
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
};
