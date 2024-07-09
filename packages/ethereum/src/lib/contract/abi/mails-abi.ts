export const mailsAbi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
    ],
    name: 'AddressEmptyCode',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
    ],
    name: 'AppDoesNotExist',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CaaSNotEnabled',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'ERC1967InvalidImplementation',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ERC1967NonPayable',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'providedLength',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'minRequiredLength',
        type: 'uint256',
      },
    ],
    name: 'EnvelopeChecksumTooShort',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'providedLength',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'minRequiredLength',
        type: 'uint256',
      },
    ],
    name: 'EnvelopeUrlTooShort',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FailedInnerCall',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'required',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'sent',
        type: 'uint256',
      },
    ],
    name: 'InsufficientFeeSent',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidInitialization',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'MailAlreadyOpened',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'MailDoesNotExist',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoAppFeesAvailable',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoOwnerFeesAvailable',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotInitializing',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'NotWhitelisted',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OnlyAppIntegratorAllowed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'OwnableInvalidOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UUPSUnauthorizedCallContext',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'slot',
        type: 'bytes32',
      },
    ],
    name: 'UUPSUnsupportedProxiableUUID',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroAddress',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'whitelistedSender',
        type: 'address',
      },
    ],
    name: 'AddedToWhitelist',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'AppFeesWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'appBaseFee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'appIntegratorFee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'excessFee',
        type: 'uint256',
      },
    ],
    name: 'FeesCollected',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint64',
        name: 'version',
        type: 'uint64',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'deletedAt',
        type: 'uint256',
      },
    ],
    name: 'MailDeleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'openedAt',
        type: 'uint256',
      },
    ],
    name: 'MailOpened',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'envelopeUrl',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'envelopeChecksum',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'sentAt',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'openedAt',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'metadata',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isDeleted',
        type: 'bool',
      },
    ],
    name: 'MailSent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'OwnerFeesWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'whitelistedSender',
        type: 'address',
      },
    ],
    name: 'RemovedFromWhitelist',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        internalType: 'address[]',
        name: 'whitelistedSenders',
        type: 'address[]',
      },
    ],
    name: 'addToWhitelist',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'deleteMail',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        internalType: 'uint256[]',
        name: 'indexes',
        type: 'uint256[]',
      },
    ],
    name: 'deleteMails',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
    ],
    name: 'getAppCollectedFees',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
    ],
    name: 'getAppRequiredFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'getMail',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'envelopeUrl',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'envelopeChecksum',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'sentAt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'openedAt',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'metadata',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'index',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isDeleted',
            type: 'bool',
          },
        ],
        internalType: 'struct Mails.Mail',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'getMailsCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'startIndex',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'howMany',
        type: 'uint256',
      },
    ],
    name: 'getMailsPaginated',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'envelopeUrl',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'envelopeChecksum',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'sentAt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'openedAt',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'metadata',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'index',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isDeleted',
            type: 'bool',
          },
        ],
        internalType: 'struct Mails.Mail[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getOwnerCollectedFees',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getUserAppIdsCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'startIndex',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'howMany',
        type: 'uint256',
      },
    ],
    name: 'getUserAppIdsPaginated',
    outputs: [
      {
        internalType: 'bytes32[]',
        name: '',
        type: 'bytes32[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getWhitelistedUsersCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'startIndex',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'howMany',
        type: 'uint256',
      },
    ],
    name: 'getWhitelistedUsersPaginated',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'appFeeManagerAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'initialOwner',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'isWhitelisted',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        internalType: 'address[]',
        name: 'whitelistedSenders',
        type: 'address[]',
      },
    ],
    name: 'removeFromWhitelist',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'envelopeUrl',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'envelopeChecksum',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'metadata',
        type: 'string',
      },
    ],
    name: 'sendMail',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'appFeeManagerAddress',
        type: 'address',
      },
    ],
    name: 'setAppFeeManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'setOpenedAt',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'appId',
        type: 'bytes32',
      },
      {
        internalType: 'address payable',
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'withdrawAppFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address payable',
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'withdrawOwnerFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
