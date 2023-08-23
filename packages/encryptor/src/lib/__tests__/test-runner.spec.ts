import { EncryptorExtensionConnector } from '../encryptor-extension-connector';

class TestRunnerSpec {
  private encryptor: EncryptorExtensionConnector;

  constructor() {
    this.encryptor = new EncryptorExtensionConnector();
  }

  public async runTests() {
    this.logSectionHeader('Checking Encryptor state');
    await this.logStatus('Installed', () => this.encryptor.isInstalled());
    await this.logStatus('Initialized', () => this.encryptor.isInitialized());
    await this.logStatus('Locked', () => this.encryptor.isLocked());
    await this.logStatus('Unlocked', () => this.encryptor.isUnlocked());

    this.logSectionHeader('Checking Encryptor public key');
    await this.logPublicKey();

    this.logSectionHeader('Checking computation of shared secret key');
    await this.logComputedSecretKey();

    // this.logSectionHeader('Is address initialized');
    // await this.logIsAddressInitialized();
    //
    // this.logSectionHeader('Store public key');
    // await this.logStorePublicKey();

    console.log('*****************************************************************');
  }

  private logSectionHeader(title: string) {
    console.log(`%c--- ${title} ---`, 'color: blue');
  }

  private logWithColor(message: string, success: boolean) {
    const color = success ? 'green' : 'red';
    console.log(`%c${message}`, `color: ${color}`);
  }

  private async logStatus(label: string, statusPromise: () => Promise<boolean> | boolean) {
    const status = await statusPromise();
    this.logWithColor(`${label}: ${status}`, status);
  }

  private async logPublicKey() {
    const publicKey = await this.encryptor.getPublicKey();
    this.logWithColor(`Public key: ${publicKey}`, !!publicKey);
  }

  private async logComputedSecretKey() {
    const testPublicKey = '0x03d5422bacbc44e6e6865dedcc8e6cdd08bca5863acc5547b31c4a270863438c93';
    const secretKey = await this.encryptor.computeSharedSecretKey(testPublicKey);
    this.logWithColor(`Shared secret key: ${secretKey}`, !!secretKey);
  }

  // private async logIsAddressInitialized() {
  //   const address = '0x2006C645d3929895D82fe85F06a5B44B7A0594f3';
  //   const isAddressInitialized = await this.encryptor.isUserAddressInitialized(address);
  //   this.logWithColor(`Address initialized: ${isAddressInitialized}`, isAddressInitialized);
  // }
  //
  // private async logStorePublicKey() {
  //   const isStored = await this.encryptor.storePublicKey().catch((e) => console.error(e));
  //   this.logWithColor(`Public key stored: ${isStored}`, !!isStored);
  // }
}

async function runTest() {
  try {
    const testRunner = new TestRunnerSpec();
    await testRunner.runTests();
  } catch (error) {
    console.error('Test error:', error);
  }
}

document.getElementById('run-test')?.addEventListener('click', runTest);
