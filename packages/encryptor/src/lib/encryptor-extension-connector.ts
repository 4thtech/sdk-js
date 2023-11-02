import { EncryptorExtension, EncryptorState } from '@4thtech-sdk/types';
import { EncryptorEventHandler } from './encryptor-event-handler';

/**
 * Connects to the [Encryptor Extension](https://chrome.google.com/webstore/detail/encryptor/feolajpinjjfikmmeknkdjbllbppojij) and provides methods for querying its state and interacting with its functionality.
 *
 * @implements {EncryptorExtension}
 */
export class EncryptorExtensionConnector implements EncryptorExtension {
  private readonly encryptorEventHandler: EncryptorEventHandler;

  /**
   * Initializes a new instance of the EncryptorExtensionConnector class.
   */
  constructor() {
    this.encryptorEventHandler = new EncryptorEventHandler();
  }

  /**
   * Determines if the Encryptor Extension is installed.
   *
   * @returns {Promise<boolean>} Resolves to `true` if installed, otherwise `false`.
   */
  public isInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
      this.encryptorEventHandler.requestHandshake(() => {
        resolve(true);
      });

      // Assume that Encryptor is not installed if there is no handshake inside 2s
      setTimeout(() => {
        resolve(false);
      }, 2000);
    });
  }

  /**
   * Checks if the Encryptor Extension is initialized.
   *
   * @returns {Promise<boolean>} Resolves to `true` if initialized, otherwise `false`.
   */
  public async isInitialized(): Promise<boolean> {
    return (await this.getState()) !== EncryptorState.NOT_GENERATED;
  }

  /**
   * Determines if the Encryptor Extension is locked.
   *
   * @returns {Promise<boolean>} Resolves to `true` if locked, otherwise `false`.
   */
  public async isLocked(): Promise<boolean> {
    return (await this.getState()) === EncryptorState.LOCKED;
  }

  /**
   * Determines if the Encryptor Extension is unlocked.
   *
   * @returns {Promise<boolean>} Resolves to `true` if unlocked, otherwise `false`.
   */
  public async isUnlocked(): Promise<boolean> {
    return (await this.getState()) === EncryptorState.UNLOCKED;
  }

  /**
   * Retrieves the current state of the Encryptor Extension.
   *
   * @returns {Promise<EncryptorState>} Resolves to the current state of the extension.
   */
  public getState(): Promise<EncryptorState> {
    return new Promise((resolve) => {
      this.encryptorEventHandler.getState((res) => {
        resolve(res.state);
      });
    });
  }

  /**
   * Retrieves the public key from the Encryptor Extension.
   *
   * @returns {Promise<string | undefined>} Resolves to the public key or undefined if not available.
   */
  public getPublicKey(): Promise<string | undefined> {
    return new Promise((resolve) => {
      this.encryptorEventHandler.getPublicKey((res) => {
        resolve(res?.publicKey);
      });
    });
  }

  /**
   * Gets the type of the public key used by the Encryptor Extension.
   *
   * This method returns a unique type identifier for the public key. If you're developing your own extension,
   * ensure that the returned type is unique to your implementation to avoid conflicts with other extensions.
   *
   * @returns {string} The unique public key type identifier.
   */
  public getPublicKeyType(): string {
    return 'BL_ENCRYPTOR_EC';
  }

  /**
   * Computes a shared secret key using a provided public key.
   *
   * @param {string} publicKey - The public key to compute the shared secret with.
   * @returns {Promise<string | undefined>} Resolves to the shared secret key or undefined if not available.
   */
  public computeSharedSecretKey(publicKey: string): Promise<string | undefined> {
    return new Promise((resolve) => {
      this.encryptorEventHandler.computeSharedSecretKey(publicKey, (res) => {
        resolve(res?.sharedSecret);
      });
    });
  }
}
