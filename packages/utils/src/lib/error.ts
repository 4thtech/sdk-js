import { Address, ContractAbi } from '@4thtech-sdk/types';
import { DecodeErrorResultReturnType } from 'viem';

// TODO: fix typings with abi

type ErrorMessages = {
  // @ts-ignore
  [key: string]: (...args: any[]) => string;
};

export class ContractRevertedError<TAbi extends ContractAbi> extends Error {
  constructor(decoded: DecodeErrorResultReturnType<TAbi>) {
    console.log('class..', decoded);
    const { errorName, args } = decoded;
    let message = `${errorName}`;

    if (errorName in errors) {
      // @ts-ignore
      message = errors[errorName](...args);
    }

    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ContractRevertedError);
    }

    this.name = 'ContractRevertedError';
  }
}

const errors: ErrorMessages = {
  ZeroAddress: () => 'The address provided cannot be zero. Please provide a valid address.',
  EnvelopeUrlTooShort: (providedLength: bigint, minRequiredLength: bigint) =>
    `The envelope URL is too short. You provided ${providedLength} characters, but at least ${minRequiredLength} characters are required.`,
  EnvelopeChecksumTooShort: (providedLength: bigint, minRequiredLength: bigint) =>
    `The envelope checksum is too short. You provided ${providedLength} bytes, but at least ${minRequiredLength} bytes are required.`,
  NotWhitelisted: (receiver: Address, sender: Address) =>
    `The receiver ${receiver} has not whitelisted the sender ${sender}. As a result, the receiver cannot receive the sender's mail.`,
  MailDoesNotExist: (receiver: Address, index: bigint) =>
    `Mail does not exist for receiver ${receiver} at index ${index}. Please check the receiver's address and the index.`,
  MailAlreadyOpened: (receiver: Address, index: bigint) =>
    `The mail for receiver ${receiver} at index ${index} has already been opened.`,

  AppDoesNotExist: (appId: string) =>
    `The application with ID ${appId} does not exist. Please verify the application ID.`,
  OnlyAppIntegratorAllowed: () => `Only the app integrator can call this function.`,
  CaaSNotEnabled: () =>
    `Only users with CaaS (Communication as a Service) enabled can call this function.`,
  NoOwnerFeesAvailable: () => 'No owner fees are available to withdraw.',
  NoAppFeesAvailable: () => 'No fees are available to withdraw for this app.',
  InsufficientFeeSent: (required: bigint, sent: bigint) =>
    `Insufficient fee sent. You sent ${sent} wei, but ${required} wei is required. Please send the correct fee amount.`,

  PublicKeyTooShort: (providedLength: bigint, minRequiredLength: bigint) =>
    `The encryption public key is too short. You provided ${providedLength} bytes, but at least ${minRequiredLength} bytes are required.`,
  PublicKeyTypeTooShort: (providedLength: bigint, minRequiredLength: bigint) =>
    `The encryption public key type is too short. You provided ${providedLength} bytes, but at least ${minRequiredLength} bytes are required.`,
  UserDoesNotExist: (user: Address) =>
    `The user with address ${user} does not exist. Please provide a valid user address.`,

  UnauthorizedAccess: (sender: Address) =>
    `Unauthorized access attempt by ${sender}. You do not have permission to perform this action.`,
  TierAlreadyExists: (tierId: string) => `The tier with ID ${tierId} already exists. Try again.`,
  TierDoesNotExist: (tierId: string) =>
    `The tier with ID ${tierId} does not exist. Please provide a valid tier ID.`,
  DiscountRateTooHigh: (discountRate: bigint) =>
    `The discount rate of ${discountRate}% is too high. It cannot exceed 100%.`,

  TransferFailed: () =>
    `The token transfer failed. Please ensure you have sufficient balance and approval.`,
  LockPeriodNotOver: () =>
    `The lock period is not over yet. You cannot unlock tokens until the lock period has ended.`,
  LockPeriodOver: () => `The lock period is already over.`,

  AppNameRequired: () =>
    `The application name is required. Please provide a valid application name.`,
  AppAlreadyExists: (appId: bigint) =>
    `The application with ID ${appId} already exists. Try again.`,

  OnlyCreatorAllowed: (conversationHash: string) =>
    `Only the creator can perform this action in conversation with hash ${conversationHash}.`,
  OnlyMembersAllowed: (conversationHash: string) =>
    `Only members can perform this action in conversation with hash ${conversationHash}.`,
  OnlyMessageSenderAllowed: (conversationHash: string, index: bigint) =>
    `Only the message sender can perform this action in conversation with hash ${conversationHash} at index ${index}.`,
  OnlyGroupCreatorCanAddMembers: (conversationHash: string) =>
    `Only the group creator can add new members to the conversation with hash ${conversationHash}.`,
  OnlyCreatorOrMemberAllowed: (conversationHash: string) =>
    `Only the creator or the member himself can perform this action in conversation with hash ${conversationHash}.`,
  ConversationDoesNotExist: (conversationHash: string) =>
    `The conversation with hash ${conversationHash} does not exist.`,
  ConversationAlreadyExists: (conversationHash: string) =>
    `A conversation with hash ${conversationHash} already exists.`,
  MessageDoesNotExist: (conversationHash: string, index: bigint) =>
    `The message at index ${index} does not exist in conversation with hash ${conversationHash}.`,
  NotAGroupConversation: (conversationHash: string) =>
    `The conversation with hash ${conversationHash} is not a group conversation.`,
  EmptyContent: () => 'The content cannot be empty. Please provide some content.',
  EmptyConversationName: () => 'The conversation name cannot be empty. Please provide a name.',
  NoMembers: () => 'At least one member is required in the conversation.',
  CreatorEncryptedSecretKeyRequired: () => 'The creator encrypted secret key must be provided.',
  MembersKeysLengthMismatch: (membersLength: bigint, keysLength: bigint) =>
    `The number of members (${membersLength}) and encrypted keys (${keysLength}) must match.`,
  MemberAlreadyInConversation: (conversationHash: string, member: string) =>
    `The member ${member} is already in the conversation with hash ${conversationHash}.`,
  MemberNotInConversation: (conversationHash: string, member: string) =>
    `The member ${member} is not in the conversation with hash ${conversationHash}.`,
};
