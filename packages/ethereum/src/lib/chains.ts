import { defineChain } from 'viem';
import {
  edgewareTestnet as viemEdgewareTestnet,
  fantomTestnet as viemFantomTestnet,
  gnosisChiado as viemGnosisChiado,
  hardhat as viemHardhat,
  polygonMumbai as viemPolygonMumbai,
  sepolia as viemSepolia,
  zetachainAthensTestnet as viemZetachainAthensTestnet,
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

export const sepolia: Chain = {
  ...viemSepolia,
  contracts: {
    ...viemSepolia.contracts,
    appFeeManager: {
      address: '0xE459E555f0CCd996F03A601158eEAe6deC4633bC',
    },
    mail: {
      address: '0xa6199D54df4c904976DC1741eE75A9570c7A3308',
    },
    chat: {
      address: '0xe7fD30fd5958165e46e618DfD8e6ef0FbB967827',
    },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
    },
  },
};

export const polygonMumbai: Chain = {
  ...viemPolygonMumbai,
  contracts: {
    ...viemPolygonMumbai.contracts,
    appFeeManager: {
      address: '0xE459E555f0CCd996F03A601158eEAe6deC4633bC',
    },
    mail: {
      address: '0xa6199D54df4c904976DC1741eE75A9570c7A3308',
    },
    chat: {
      address: '0xe7fD30fd5958165e46e618DfD8e6ef0FbB967827',
    },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
    },
  },
};

export const edgewareTestnet: Chain = {
  ...viemEdgewareTestnet,
  contracts: {
    appFeeManager: {
      address: '0xE459E555f0CCd996F03A601158eEAe6deC4633bC',
    },
    mail: {
      address: '0xa6199D54df4c904976DC1741eE75A9570c7A3308',
    },
    chat: {
      address: '0xf32aFB10a3948B0D3Df65fEf5dd8004ea542BFAa',
    },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
    },
  },
};

export const artheraTestnet: Chain = defineChain({
  id: 10243,
  name: 'Arthera Testnet',
  network: 'arthera-testnet',
  nativeCurrency: { name: 'Arthera', symbol: 'AA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-test2.arthera.net'],
    },
    public: {
      http: ['https://rpc-test2.arthera.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arthera Explorer',
      url: 'https://explorer-test2.arthera.net',
    },
  },
  contracts: {
    appFeeManager: {
      address: '0xE459E555f0CCd996F03A601158eEAe6deC4633bC',
    },
    mail: {
      address: '0xa6199D54df4c904976DC1741eE75A9570c7A3308',
    },
    chat: {
      address: '0xe7fD30fd5958165e46e618DfD8e6ef0FbB967827',
    },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
    },
  },
  testnet: true,
});

export const metisSepolia: Chain = defineChain({
  id: 59901,
  name: 'Metis Sepolia',
  network: 'metis-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Metis Sepolia',
    symbol: 'tMETIS',
  },
  rpcUrls: {
    default: { http: ['https://sepolia.rpc.metisdevops.link'] },
    public: { http: ['https://sepolia.rpc.metisdevops.link'] },
  },
  blockExplorers: {
    default: {
      name: 'Metis Sepolia Explorer',
      url: 'https://sepolia.explorer.metisdevops.link',
    },
  },
  contracts: {
    appFeeManager: {
      address: '0xE459E555f0CCd996F03A601158eEAe6deC4633bC',
    },
    mail: {
      address: '0xa6199D54df4c904976DC1741eE75A9570c7A3308',
    },
    chat: {
      address: '0xe7fD30fd5958165e46e618DfD8e6ef0FbB967827',
    },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
    },
  },
});

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
      address: '0x1130412f89E2C5fc4B76dadDa9c555D7ccac2AB7',
    },
    mail: {
      address: '0x2B568A7D93DdDe2cbEE293013e80617ab60Efd80',
    },
    chat: {
      address: '0xb157cdB09284D8284fe88DaBaF3a5e1472F7dBDa',
    },
    user: {
      address: '0x6625570b2d3B8C5d0Fb9b5Ac812462Cc18365914',
    },
  },
  testnet: true,
});

export const oasisSapphireTestnet: Chain = defineChain({
  id: 23295,
  name: 'Oasis Sapphire Testnet',
  network: 'oasis-sapphire-testnet',
  nativeCurrency: { name: 'TEST', symbol: 'TEST', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.sapphire.oasis.dev'],
      webSocket: ['wss://testnet.sapphire.oasis.dev/ws'],
    },
    public: {
      http: ['https://testnet.sapphire.oasis.dev'],
      webSocket: ['wss://testnet.sapphire.oasis.dev/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sapphire Explorer',
      url: 'https://testnet.explorer.sapphire.oasis.dev',
    },
  },
  contracts: {
    appFeeManager: {
      address: '0xE459E555f0CCd996F03A601158eEAe6deC4633bC',
    },
    mail: {
      address: '0xa6199D54df4c904976DC1741eE75A9570c7A3308',
    },
    chat: {
      address: '0xe7fD30fd5958165e46e618DfD8e6ef0FbB967827',
    },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
    },
  },
  testnet: true,
});

export const zetachainAthensTestnet: Chain = {
  ...viemZetachainAthensTestnet,
  blockExplorers: {
    default: {
      name: 'ZetaScan',
      url: 'https://athens.explorer.zetachain.com',
    },
  },
  contracts: {
    appFeeManager: {
      address: '0xE459E555f0CCd996F03A601158eEAe6deC4633bC',
    },
    mail: {
      address: '0xa6199D54df4c904976DC1741eE75A9570c7A3308',
    },
    chat: {
      address: '0xe7fD30fd5958165e46e618DfD8e6ef0FbB967827',
    },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
    },
  },
};

export const mantleSepoliaTestnet: Chain = defineChain({
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  network: 'mantle-sepolia-testnet',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
    public: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantle Sepolia Explorer',
      url: 'https://explorer.sepolia.mantle.xyz',
    },
  },
  contracts: {
    appFeeManager: {
      address: '0xE459E555f0CCd996F03A601158eEAe6deC4633bC',
    },
    mail: {
      address: '0xa6199D54df4c904976DC1741eE75A9570c7A3308',
    },
    chat: {
      address: '0xe7fD30fd5958165e46e618DfD8e6ef0FbB967827',
    },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
    },
  },
  testnet: true,
});

export const fantomTestnet: Chain = {
  ...viemFantomTestnet,
  contracts: {
    appFeeManager: {
      address: '0xE459E555f0CCd996F03A601158eEAe6deC4633bC',
    },
    mail: {
      address: '0xa6199D54df4c904976DC1741eE75A9570c7A3308',
    },
    chat: {
      address: '0xe7fD30fd5958165e46e618DfD8e6ef0FbB967827',
    },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
    },
  },
};

export const fantomSonicTestnet: Chain = defineChain({
  id: 64_165,
  name: 'Fantom Sonic Builders Testnet',
  network: 'fantom-sonic-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Fantom',
    symbol: 'FTM',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sonic.fantom.network'],
    },
    public: {
      http: ['https://rpc.sonic.fantom.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Fantom Sonic Open Testnet Explorer',
      url: 'https://public-sonic.fantom.network',
    },
  },
  contracts: {
    appFeeManager: {
      address: '0xE459E555f0CCd996F03A601158eEAe6deC4633bC',
    },
    mail: {
      address: '0xa6199D54df4c904976DC1741eE75A9570c7A3308',
    },
    chat: {
      address: '0xe7fD30fd5958165e46e618DfD8e6ef0FbB967827',
    },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
    },
  },
  testnet: true,
});

export const gnosisChiado: Chain = {
  ...viemGnosisChiado,
  contracts: {
    appFeeManager: {
      address: '0xE459E555f0CCd996F03A601158eEAe6deC4633bC',
    },
    mail: {
      address: '0xa6199D54df4c904976DC1741eE75A9570c7A3308',
    },
    chat: {
      address: '0xe7fD30fd5958165e46e618DfD8e6ef0FbB967827',
    },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
    },
  },
};
