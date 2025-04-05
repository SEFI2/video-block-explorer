# VideoReportNFT Smart Contract

This project contains a Hardhat-based Ethereum smart contract for creating Video Report NFTs. The contract allows users to mint NFTs that represent videos, with the ability to receive ETH payments.

## Features

- Mint NFTs representing video reports
- Store video metadata on-chain
- Receive ETH payments during minting
- Withdraw collected ETH (owner only)

## Setup

```bash
# Install dependencies
npm install

# Copy the example environment file and fill in your values
cp .env.example .env
```

## Development

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Run a local Ethereum node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost
```

## Deployment

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia

# Verify contract on Etherscan (after deployment)
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## Alfajores Testnet Deployment

To test on Celo's Alfajores testnet:

1. Get Alfajores testnet CELO from the [Celo Faucet](https://faucet.celo.org/alfajores)
2. Update your `.env` file with your private key (without 0x prefix)
3. Run the deployment and test script:

```bash
npm run deploy:alfajores
```

This will:
- Deploy the contract to Alfajores
- Mint a test token
- Verify ownership
- Test withdrawal functions

## Contract Information

- **Name**: VideoReportNFT
- **Symbol**: VRNFT
- **Standard**: ERC721 (with enumerable extension)
- **Functions**:
  - `mintVideoToken(address to, string memory videoURI)`: Mint a new video token
  - `getVideoData(uint256 tokenId)`: Get metadata for a video token
  - `withdraw()`: Withdraw contract balance (owner only)

## License

MIT
