type EncryptionPublicKeyDetails = {
  publicKey: string;
  publicKeyType: string;
};

export type UserStruct = {
  encryptionPublicKey: EncryptionPublicKeyDetails;
};
