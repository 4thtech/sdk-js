import { defineChain } from 'viem';
import {
  edgewareTestnet as viemEdgewareTestnet,
  fantomTestnet as viemFantomTestnet,
  gnosisChiado as viemGnosisChiado,
  hardhat as viemHardhat,
  metisGoerli as viemMetisGoerli,
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
      address: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    },
    chat: {
      address: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
    },
    user: {
      address: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
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
      address: '0x049550472718a999aF1c4B7fCc7B8A7692F45c93',
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
      address: '0x049550472718a999aF1c4B7fCc7B8A7692F45c93',
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
      address: '0x049550472718a999aF1c4B7fCc7B8A7692F45c93',
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
      address: '0xDc0C586ad11dB0b396031F50687e278Bd77508dC',
    },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
    },
  },
  testnet: true,
});

export const metisGoerli: Chain = {
  ...viemMetisGoerli,
  contracts: {
    ...viemMetisGoerli.contracts,
    appFeeManager: {
      address: '0xE459E555f0CCd996F03A601158eEAe6deC4633bC',
    },
    mail: {
      address: '0xa6199D54df4c904976DC1741eE75A9570c7A3308',
    },
    // chat: {
    //   address: '0xDc0C586ad11dB0b396031F50687e278Bd77508dC',
    // },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
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
      http: ['https://fraa-dancebox-3043-rpc.a.dancebox.tanssi.network'],
    },
    public: {
      http: ['https://fraa-dancebox-3043-rpc.a.dancebox.tanssi.network'],
    },
  },
  contracts: {
    appFeeManager: {
      address: '0xE459E555f0CCd996F03A601158eEAe6deC4633bC',
    },
    mail: {
      address: '0xa6199D54df4c904976DC1741eE75A9570c7A3308',
    },
    // chat: {
    //   address: '0xDc0C586ad11dB0b396031F50687e278Bd77508dC',
    // },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
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
    // chat: {
    //   address: '0xDc0C586ad11dB0b396031F50687e278Bd77508dC',
    // },
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
    // chat: {
    //   address: '0xDc0C586ad11dB0b396031F50687e278Bd77508dC',
    // },
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
    // chat: {
    //   address: '0xDc0C586ad11dB0b396031F50687e278Bd77508dC',
    // },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
    },
  },
  testnet: true,
});

export const fantomTestnet: Chain = {
  ...viemFantomTestnet,
  contracts: {
    ...viemFantomTestnet.contracts,
    appFeeManager: {
      address: '0xE459E555f0CCd996F03A601158eEAe6deC4633bC',
    },
    mail: {
      address: '0xa6199D54df4c904976DC1741eE75A9570c7A3308',
    },
    // chat: {
    //   address: '0xDc0C586ad11dB0b396031F50687e278Bd77508dC',
    // },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
    },
  },
};

export const gnosisChiado: Chain = {
  ...viemGnosisChiado,
  contracts: {
    appFeeManager: {
      address: '0xE459E555f0CCd996F03A601158eEAe6deC4633bC',
    },
    mail: {
      address: '0xa6199D54df4c904976DC1741eE75A9570c7A3308',
    },
    // chat: {
    //   address: '0xDc0C586ad11dB0b396031F50687e278Bd77508dC',
    // },
    user: {
      address: '0x5aCeed5372E91C1EB2C09E0F5C46B29A282b2C2D',
    },
  },
};
