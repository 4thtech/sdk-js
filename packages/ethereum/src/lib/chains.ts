import { Chain, NetworkType } from '@4thtech-sdk/types';

// You can find a chain list at https://chainlist.org

export const localhost: Chain = {
  id: 31337,
  name: 'HardHat',
  network: 'hardhat',
  type: NetworkType.LOCAL_NET,
  networkEndpoint: 'http://127.0.0.1:8545/',
  contracts: {
    appFeeManager: {
      address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    },
    mail: {
      address: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    },
    chat: {
      address: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    },
    user: {
      address: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    },
  },
};

export const sepolia: Chain = {
  id: 11155111,
  name: 'Sepolia',
  network: 'sepolia',
  type: NetworkType.TEST_NET,
  networkEndpoint: 'https://rpc.sepolia.org',
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

export const polygonMumbai: Chain = {
  id: 80001,
  name: 'Polygon Mumbai',
  network: 'maticmum',
  type: NetworkType.TEST_NET,
  networkEndpoint: 'https://polygon-mumbai-bor.publicnode.com',
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

export const edgewareTestnet: Chain = {
  id: 2022,
  name: 'Beresheet BereEVM Testnet',
  network: 'edgewareTestnet',
  type: NetworkType.TEST_NET,
  networkEndpoint: 'https://beresheet-evm.jelliedowl.net',
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

export const artheraTestnet: Chain = {
  id: 10243,
  name: 'Arthera Testnet',
  network: 'artheraTestnet',
  type: NetworkType.TEST_NET,
  networkEndpoint: 'https://rpc-test.arthera.net',
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
};
