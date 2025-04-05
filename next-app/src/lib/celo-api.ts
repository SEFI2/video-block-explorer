import { Transaction } from "../types/onchain";


// Blockchain data fetching
/**
 * Fetches blockchain data for an address from Celoscan API endpoints
 * @param address The blockchain address to get information for
 * @returns Promise containing address information including balance, transactions and tokens
 */
export async function fetchNftTransfers(address: string, durationInDays: number): Promise<{
    transactions: Transaction[],
    balance: string
}> {
    const result: {
        transactions: Transaction[],
        balance: string
    } = {
        transactions: [],
        balance: ''
    };
  // Return object with address we're querying
  const apiUrl = process.env.ALFAJORES_SCAN_API_URL;
  const apiKey = process.env.CELOSCAN_API_KEY;
  
    console.log('apiUrl', apiUrl);
    console.log('apiKey', apiKey);

    if (!apiUrl || !apiKey) {
        throw new Error('API URL or API Key is missing from environment variables');
    }

    // Calculate startblock based on durationInDays
    const startBlock = await getBlockNumberFromDaysAgo(durationInDays, apiUrl, apiKey);
    console.log('Using startBlock:', startBlock);

    // Fetch address balance
    const balanceResponse = await fetch(
        `${apiUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
    );
    const balanceData = await balanceResponse.json();
    console.log('balanceData', balanceData);
    if (balanceData.status === '1') {
        result.balance = balanceData.result;
    } else {
        console.error('Failed to get balance:', balanceData);
    }

    // Fetch normal transactions
    const txResponse = await fetch(
        `${apiUrl}?module=account&action=tokennfttx&address=${address}&startblock=${startBlock}&sort=desc&apikey=${apiKey}`
    );
    const txData = await txResponse.json();
    if (txData.status === '1') {
        result.transactions = txData.result;
    } else {
        console.error('Failed to get transactions:', txData);
    }
        
    return result;
}

// Blockchain data fetching
/**
 * Fetches blockchain data for an address from Celoscan API endpoints
 * @param address The blockchain address to get information for
 * @returns Promise containing address information including balance, transactions and tokens
 */
export async function fetchTokenTransfers(address: string, durationInDays: number): Promise<{
    transactions: Transaction[],
    balance: string
}> {
    const result: {
        transactions: Transaction[],
        balance: string
    } = {
        transactions: [],
        balance: ''
    };
  // Return object with address we're querying
  const apiUrl = process.env.ALFAJORES_SCAN_API_URL;
  const apiKey = process.env.CELOSCAN_API_KEY;
  
    console.log('apiUrl', apiUrl);
    console.log('apiKey', apiKey);

    if (!apiUrl || !apiKey) {
        throw new Error('API URL or API Key is missing from environment variables');
    }

    // Calculate startblock based on durationInDays
    const startBlock = await getBlockNumberFromDaysAgo(durationInDays, apiUrl, apiKey);
    console.log('Using startBlock:', startBlock);

    // Fetch address balance
    const balanceResponse = await fetch(
        `${apiUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
    );
    const balanceData = await balanceResponse.json();
    console.log('balanceData', balanceData);
    if (balanceData.status === '1') {
        result.balance = balanceData.result;
    } else {
        console.error('Failed to get balance:', balanceData);
    }

    // Fetch normal transactions
    const txResponse = await fetch(
        `${apiUrl}?module=account&action=tokentx&address=${address}&startblock=${startBlock}&sort=desc&apikey=${apiKey}`
    );
    const txData = await txResponse.json();
    if (txData.status === '1') {
        result.transactions = txData.result;
    } else {
        console.error('Failed to get transactions:', txData);
    }
        
    return result;
}


// Blockchain data fetching
/**
 * Fetches blockchain data for an address from Celoscan API endpoints
 * @param address The blockchain address to get information for
 * @returns Promise containing address information including balance, transactions and tokens
 */
export async function fetchAddressBlockchainData(address: string, durationInDays: number): Promise<{
    transactions: Transaction[],
    balance: string
}> {
    const result: {
        transactions: Transaction[],
        balance: string
    } = {
        transactions: [],
        balance: ''
    };
  // Return object with address we're querying
  const apiUrl = process.env.ALFAJORES_SCAN_API_URL;
  const apiKey = process.env.CELOSCAN_API_KEY;
  
    console.log('apiUrl', apiUrl);
    console.log('apiKey', apiKey);

    if (!apiUrl || !apiKey) {
        throw new Error('API URL or API Key is missing from environment variables');
    }

    // Calculate startblock based on durationInDays
    const startBlock = await getBlockNumberFromDaysAgo(durationInDays, apiUrl, apiKey);
    console.log('Using startBlock:', startBlock);

    // Fetch address balance
    const balanceResponse = await fetch(
        `${apiUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
    );
    const balanceData = await balanceResponse.json();
    console.log('balanceData', balanceData);
    if (balanceData.status === '1') {
        result.balance = balanceData.result;
    } else {
        console.error('Failed to get balance:', balanceData);
    }

    // Fetch normal transactions
    const txResponse = await fetch(
        `${apiUrl}?module=account&action=txlist&address=${address}&startblock=${startBlock}&sort=desc&apikey=${apiKey}`
    );
    const txData = await txResponse.json();
    if (txData.status === '1') {
        result.transactions = txData.result;
    } else {
        console.error('Failed to get transactions:', txData);
    }
        
    return result;
}

/**
 * Calculates the block number from a certain number of days ago
 * @param daysAgo Number of days in the past to get the block for
 * @param apiUrl The API URL to use
 * @param apiKey The API key to use
 * @returns Promise containing the block number
 */
async function getBlockNumberFromDaysAgo(daysAgo: number, apiUrl: string, apiKey: string): Promise<number> {
  try {
    // Calculate timestamp from X days ago (in seconds)
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const secondsPerDay = 86400;
    const timestampInPast = now - (daysAgo * secondsPerDay);
    
    // Call the API to get the block number for this timestamp
    const response = await fetch(
      `${apiUrl}?module=block&action=getblocknobytime&timestamp=${timestampInPast}&closest=before&apikey=${apiKey}`
    );
    
    const data = await response.json();
    if (data.status === '1' && data.result) {
      return parseInt(data.result);
    } else {
      console.error('Failed to get block number from timestamp:', data, timestampInPast);
      return 0; // Fallback to earliest block if API fails
    }
  } catch (error) {
    console.error('Error calculating block number:', error);
    return 0; // Fallback to earliest block on error
  }
}
  