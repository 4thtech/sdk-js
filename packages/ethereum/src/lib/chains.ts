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
      address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    },
    chat: {
      address: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    },
    user: {
      address: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
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
      address: '0x628DAACcC211cE0A639e6EAd89B1c63b57d633d4',
    },
    mail: {
      address: '0x00e75F6f934e1Fb2Bd881682F33dDFA814Ef1d2b',
    },
    chat: {
      address: '0x049550472718a999aF1c4B7fCc7B8A7692F45c93',
    },
    user: {
      address: '0x55755C910fAC95cf9c8265Af6a971fA3746029BA',
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
      address: '0x628DAACcC211cE0A639e6EAd89B1c63b57d633d4',
    },
    mail: {
      address: '0x00e75F6f934e1Fb2Bd881682F33dDFA814Ef1d2b',
    },
    chat: {
      address: '0x049550472718a999aF1c4B7fCc7B8A7692F45c93',
    },
    user: {
      address: '0x55755C910fAC95cf9c8265Af6a971fA3746029BA',
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
      address: '0x628DAACcC211cE0A639e6EAd89B1c63b57d633d4',
    },
    mail: {
      address: '0x00e75F6f934e1Fb2Bd881682F33dDFA814Ef1d2b',
    },
    chat: {
      address: '0x049550472718a999aF1c4B7fCc7B8A7692F45c93',
    },
    user: {
      address: '0x55755C910fAC95cf9c8265Af6a971fA3746029BA',
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
      address: '0x628DAACcC211cE0A639e6EAd89B1c63b57d633d4',
    },
    mail: {
      address: '0x00e75F6f934e1Fb2Bd881682F33dDFA814Ef1d2b',
    },
    chat: {
      address: '0x049550472718a999aF1c4B7fCc7B8A7692F45c93',
    },
    user: {
      address: '0x55755C910fAC95cf9c8265Af6a971fA3746029BA',
    },
  },
};
