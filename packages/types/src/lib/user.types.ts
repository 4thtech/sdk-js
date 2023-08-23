type EncryptionPublicKeyStructOutput = [string, string] & {
  publicKey: string;
  publicKeyType: string;
};

export type UserStruct = {
  encryptionPublicKey: {
    publicKey: string;
    publicKeyType: string;
  };
};

export type ContractUserOutput = [EncryptionPublicKeyStructOutput] & UserStruct;
