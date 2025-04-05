import { TransactionRangeReport } from '@/types/report';
import { Transaction } from '@/types/onchain';

// Generate a deterministic hex string of specified length
const generateHex = (length: number, seed: number = 0): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    // Use a simple formula based on position and seed
    const value = (i + 1) * (seed + 1) % 16;
    result += value.toString(16);
  }
  return result;
};

// Generate a deterministic ethereum address
const generateAddress = (index: number): string => {
  return `0x${generateHex(40, index)}`;
};

// Generate a deterministic transaction hash
const generateTxHash = (index: number): string => {
  return `0x${generateHex(64, index)}`;
};

// Generate a deterministic timestamp within the last 3 months
const generateTimestamp = (index: number): string => {
  const now = Date.now();
  const threeMonthsAgo = now - (90 * 24 * 60 * 60 * 1000);
  // Spread timestamps evenly over the period
  const timestamp = threeMonthsAgo + (index * (now - threeMonthsAgo) / 100);
  return Math.floor(timestamp / 1000).toString();
};

// Generate a deterministic ETH value
const generateEthValue = (index: number): string => {
  // Values ranging from 0.01 to 5 ETH based on index
  const ethValue = 0.01 + (index % 20) * 0.25;
  // Convert to wei (10^18)
  return Math.floor(ethValue * 10**18).toString();
};

// Generate a single transaction
const generateTransaction = (userAddress: string, otherAddresses: string[], index: number): Transaction => {
  const isSending = index % 2 === 0;
  const from = isSending ? userAddress : otherAddresses[index % otherAddresses.length];
  const to = isSending ? otherAddresses[index % otherAddresses.length] : userAddress;
  
  return {
    blockNumber: (15000000 + index * 100).toString(),
    timeStamp: generateTimestamp(index),
    hash: generateTxHash(index),
    nonce: (index * 2).toString(),
    blockHash: generateTxHash(index + 1000),
    transactionIndex: (index % 500).toString(),
    from,
    to,
    value: generateEthValue(index),
    gas: (21000 + (index % 10) * 10000).toString(),
    gasPrice: (10 * 10**9 + (index % 5) * 10**9).toString(),
    isError: index % 20 === 0 ? '1' : '0', // 5% chance of error
    txreceipt_status: index % 20 === 0 ? '0' : '1', // 5% chance of failure
    input: index % 3 === 0 ? `0x${generateHex(64, index)}` : '0x', // 33% chance of having input data
    contractAddress: index % 5 === 0 ? generateAddress(index + 500) : '', // 20% chance of contract creation
    cumulativeGasUsed: (100000 + index * 10000).toString(),
    gasUsed: (21000 + (index % 10) * 5000).toString(),
    confirmations: (1000 - index % 1000).toString(),
    methodId: index % 3 === 0 ? `0x${generateHex(8, index)}` : '0x', // 33% chance of method call
    functionName: index % 3 === 0 ? 'transfer(address,uint256)' : ''
  };
};

// Generate transactions for a period
const generateTransactions = (
  userAddress: string,
  count: number,
  startIndex: number = 0
): Transaction[] => {
  // Generate some common addresses that will interact with the user
  const commonAddresses = Array.from({ length: 15 }, (_, i) => generateAddress(i + 1000));
  
  return Array.from({ length: count }, (_, i) => 
    generateTransaction(userAddress, commonAddresses, startIndex + i)
  );
};

// Generate statistics for a report
const generateStatistics = (transactions: Transaction[]): { 
  totalValue: string, 
  uniqueAddresses: number, 
  significantTransactions: number 
} => {
  // Calculate total value in ETH
  const totalWei = transactions.reduce((sum, tx) => {
    return sum + BigInt(tx.value);
  }, BigInt(0));
  
  // Convert wei to ETH with 2 decimal places
  const totalEth = Number(totalWei) / 10**18;
  
  // Count unique addresses
  const uniqueAddresses = new Set();
  transactions.forEach(tx => {
    uniqueAddresses.add(tx.from);
    uniqueAddresses.add(tx.to);
  });
  
  // Determine significant transactions (e.g., > 0.5 ETH)
  const significantTransactions = transactions.filter(tx => {
    return Number(tx.value) > 0.5 * 10**18;
  }).length;
  
  return {
    totalValue: `${totalEth.toFixed(2)} ETH`,
    uniqueAddresses: uniqueAddresses.size - 1, // -1 to exclude user's address
    significantTransactions
  };
};

// Generate text for the report
const generateReportText = (period: number, transactions: Transaction[], userAddress: string): string => {
  const totalTx = transactions.length;
  const sentTx = transactions.filter(tx => tx.from.toLowerCase() === userAddress.toLowerCase()).length;
  const receivedTx = totalTx - sentTx;
  const errorTx = transactions.filter(tx => tx.isError === '1').length;
  
  return `In Period ${period}, you had ${totalTx} blockchain transactions. You sent ${sentTx} transactions and received ${receivedTx}. ${errorTx} transactions failed. The activity shows a mix of ETH transfers and smart contract interactions, demonstrating your active engagement on the Ethereum network.`;
};

// Generate highlights for the report
const generateHighlights = (transactions: Transaction[], userAddress: string): string[] => {
  const highlights = [];
  
  // Check for large transactions
  const largeTransactions = transactions.filter(tx => Number(tx.value) > 1 * 10**18);
  if (largeTransactions.length > 0) {
    highlights.push(`You had ${largeTransactions.length} large transactions exceeding 1 ETH`);
  }
  
  // Check for smart contract interactions
  const contractInteractions = transactions.filter(tx => tx.input.length > 3);
  if (contractInteractions.length > 0) {
    highlights.push(`You interacted with ${contractInteractions.length} smart contracts`);
  }
  
  // Check for transaction errors
  const errors = transactions.filter(tx => tx.isError === '1');
  if (errors.length > 0) {
    highlights.push(`${errors.length} transactions failed, possibly due to gas issues or contract reverts`);
  }
  
  // Add additional insights based on period number
  const insights = [
    "Gas prices were higher than average during this period",
    "Your transaction volume increased compared to previous periods",
    "You interacted with several popular DeFi protocols",
    "Your wallet shows typical trading patterns"
  ];
  highlights.push(insights[0]); // Always use the first insight for consistency
  
  return highlights;
};

// Generate a complete report for a period
const generateReport = (period: number, userAddress: string, transactionCount: number): TransactionRangeReport => {
  const transactions = generateTransactions(userAddress, transactionCount, (period - 1) * 100);
  
  return {
    transactions,
    text: generateReportText(period, transactions, userAddress),
    highlights: generateHighlights(transactions, userAddress),
    statistics: generateStatistics(transactions)
  };
};

// Generate summary text for the overall profile
const generateSummaryText = (reports: TransactionRangeReport[]): string => {
  const totalTransactions = reports.reduce((sum, report) => sum + report.transactions.length, 0);
  
  const profileSpecificText = "This wallet shows a balanced mix of activities across DeFi protocols, NFT marketplaces, and regular ETH transfers. The user maintains a diversified portfolio with moderate activity levels, suggesting a knowledgeable but cautious approach to blockchain interactions.";
  
  return `Blockchain Activity Report

This report analyzes ${totalTransactions} transactions from your Ethereum wallet over three distinct periods. 

${profileSpecificText}

Key observations across all periods:
- Regular interaction with smart contracts suggests familiarity with DeFi protocols
- A balance of incoming and outgoing transactions indicates active wallet management
- Transaction volume varies across periods, with busier activity in the middle period
- Gas optimization appears to be a consideration, with few failed transactions

The following sections break down activity by period, highlighting notable transactions, patterns, and metrics for each timeframe.`;
};

// Export mock data function with deterministic output
export const getBlockchainProfile = () => {
  const userAddress = '0x' + generateHex(40, 42); // Always the same address
  
  // Fixed transaction counts
  const period1Count = 25;
  const period2Count = 40;
  const period3Count = 30;
  
  // Generate reports for each period
  const reports = [
    generateReport(1, userAddress, period1Count),
    generateReport(2, userAddress, period2Count),
    generateReport(3, userAddress, period3Count)
  ];
  
  // Return complete profile with video data
  return {
    userAddress,
    balance: '5.43',
    chainId: 1, // Ethereum Mainnet
    networkName: 'Ethereum Mainnet',
    tokenBalance: '5.43',
    introText: 'This is the intro text',
    outroText: 'This is the outro text',
    transactionCount: period1Count + period2Count + period3Count,
    reports,
    generatedText: generateSummaryText(reports)
  };
};

// Example usage for VideoPreview component:
// const videoData = getBlockchainProfile('nft');
// <VideoPreview {...videoData} />

