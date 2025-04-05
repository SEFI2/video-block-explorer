// Define the chain IDs for supported networks
export const SUPPORTED_CHAINS = {
  LOCALHOST: 1337,
  SEPOLIA: 11155111,
  ALFAJORES: 44787
};

// Network names for display
export const NETWORK_NAMES: Record<number, string> = {
  [SUPPORTED_CHAINS.LOCALHOST]: 'Local Network',
  [SUPPORTED_CHAINS.SEPOLIA]: 'Sepolia Testnet',
  [SUPPORTED_CHAINS.ALFAJORES]: 'Alfajores Testnet'
};

// Define contract addresses for each network
export type ContractAddresses = {
  videoGenerator?: string;
  marketplace?: string;
};

export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  [SUPPORTED_CHAINS.LOCALHOST]: {
    videoGenerator: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    marketplace: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
  },
  [SUPPORTED_CHAINS.SEPOLIA]: {
    videoGenerator: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    marketplace: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
  },
  [SUPPORTED_CHAINS.ALFAJORES]: {
    videoGenerator: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    marketplace: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
  }
};

// Contract ABIs
export const CONTRACT_ABIS = {
  VideoGenerator: [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "dataDuration",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "dataPrompt",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "targetAddress",
          "type": "address"
        }
      ],
      "name": "requestVideo",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        }
      ],
      "name": "refundVideo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        }
      ],
      "name": "acknowledgeVideo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        }
      ],
      "name": "getRequestDetails",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "dataDuration",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "dataPrompt",
              "type": "string"
            },
            {
              "internalType": "uint8",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "string",
              "name": "previewUrl",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "finalUrl",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "createdAt",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "updatedAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct VideoGenerator.VideoRequest",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserRequestIds",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        }
      ],
      "name": "VideoRequested",
      "type": "event"
    }
  ]
}; 