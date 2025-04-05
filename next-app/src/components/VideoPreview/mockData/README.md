# Mock Blockchain Data

This folder contains mock blockchain data profiles that can be used for demonstration purposes in the application.

## Available Profiles

You can access different mock profiles by using these IDs in the URL:

1. **Default Profile**: `/demo` or `/demo/default`  
   A standard mixed-use blockchain wallet with moderate activity across DeFi and NFTs.

2. **NFT Collector**: `/demo/nft`  
   A wallet heavily involved in NFT collecting and trading across multiple marketplaces.

3. **DeFi Power User**: `/demo/defi`  
   An advanced user interacting with multiple DeFi protocols for lending, trading, and liquidity provision.

4. **Gaming Profile**: `/demo/gaming`  
   A wallet focused on blockchain gaming across different platforms.

5. **Custom ID**: `/demo/123456`  
   Using any numeric ID will generate a custom profile with the ID used to create the wallet address.

## How It Works

The `blockchainProfiles.ts` file contains predefined mock data for different user profiles. When accessing the demo with a specific ID, the app will:

1. Check if the ID matches a predefined profile (nft, defi, gaming)
2. If not, but the ID is numeric, it will generate a custom profile with that ID as part of the wallet address
3. Otherwise, it will fall back to the default profile

## Extending

To add more predefined profiles, simply add a new entry to the `blockchainProfiles` object in `blockchainProfiles.ts`. 