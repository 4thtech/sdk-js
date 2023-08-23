# 4thTech SDK

[![License](https://img.shields.io/badge/License-EUPL_1.2-blue)](https://github.com/4thtech/sdk-js/blob/main/LICENSE.md)

Welcome to the 4thTech SDK repository! 👋

This repository is a monorepo with multiple packages supporting the 4thTech protocol for easier integration into
TypeScript/JavaScript-based applications.

## Packages

- **Encryption**: This package allows for easy data encryption and decryption using various encryption methods, ensuring
  secure data handling within the 4thTech protocol.
- **Encryptor**: This package handles the connection with [Encryptor Extension].
- **Ethereum**: This package handles Ethereum blockchain transactions, smart contracts, and other blockchain-related
  functions.
- **Storage**: This package is designed to optimize storing and retrieving procedures, enhancing data management within
  the 4thTech protocol system.
- **Types**: This package contains the type declarations used across all the other packages.

## Usage

Each package comes with its unique usage instructions. To understand how to use a package, refer to the respective
package directories for more detailed instructions and documentation.
Typically, you would import a package as follows:

```ts
import { Mail } from '@4thtech-sdk/ethereum';
```

Use the imported package as required by your project.

## Contributing

Contributions from the community are highly encouraged and appreciated. Feel free to submit issues, pull requests, or
offer general feedback.

- **Issues**: To submit issues, head over to our [Github repository](https://github.com/4thtech/sdk-js/issues).
- **Pull Requests**: We welcome your pull requests. The contribution process aligns with the protocol followed by
  numerous open source projects.

## License

The license for 4thTech Protocol is the European Union Public License 1.2 (EUPL-1.2),
see [LICENSE](https://github.com/4thtech/sdk-js/blob/main/LICENSE.md) for more details.

[Encryptor Extension]: https://chrome.google.com/webstore/detail/encryptor/feolajpinjjfikmmeknkdjbllbppojij
