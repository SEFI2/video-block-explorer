import {
    Transaction,
    NftTokenTransaction,
    TokenTransaction
} from '@/types/onchain';
import { TransactionRangeReport, TransactionStatistics } from '@/types/report';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Define schema for structured output using Zod
const StatisticsSchema = z.object({
    totalValue: z.string(),
    uniqueAddresses: z.number(),
    significantTransactions: z.number()
});

const TransactionSchema = z.object({
    blockNumber: z.string(),
    timeStamp: z.string(),
    hash: z.string(),
    nonce: z.string(),
    blockHash: z.string(),
    transactionIndex: z.string(),
    from: z.string(),
    to: z.string(),
    value: z.string(),
    gas: z.string(),
    gasPrice: z.string(),
    isError: z.string(),
    txreceipt_status: z.string(),
    input: z.string(),
    contractAddress: z.string(),
    cumulativeGasUsed: z.string(),
    gasUsed: z.string(),
    confirmations: z.string(),
    methodId: z.string(),
    functionName: z.string()
});

const TransactionReportSchema = z.object({
    text: z.string(),
    highlights: z.array(z.string()),
    statistics: StatisticsSchema,
    transactions: z.array(TransactionSchema)
});

const TransactionReportsSchema = z.object({
    transaction_reports: z.array(TransactionReportSchema)
});

/**
 * Splits transactions into time periods based on timestamp
 * @param transactions All transactions to split
 * @param numberOfPeriods Number of periods to split into
 * @returns Array of transaction groups
 */
export function splitTransactionsByTime(
    transactions: Transaction[],
    numberOfPeriods: number
): Transaction[][] {
    // Sort transactions by timestamp (oldest first)
    const sortedTransactions = [...transactions].sort(
        (a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp)
    );
    
    if (sortedTransactions.length === 0) {
        return [];
    }
    
    // Find earliest and latest timestamps
    const earliestTime = parseInt(sortedTransactions[0].timeStamp);
    const latestTime = parseInt(sortedTransactions[sortedTransactions.length - 1].timeStamp);
    const timeRange = latestTime - earliestTime;
    
    // If there's no time difference, return all transactions as one group
    if (timeRange === 0) {
        return [sortedTransactions];
    }
    
    // Create time period boundaries
    const periodSize = timeRange / numberOfPeriods;
    const transactionGroups: Transaction[][] = Array(numberOfPeriods).fill(null).map(() => []);
    
    // Assign transactions to periods
    for (const tx of sortedTransactions) {
        const txTime = parseInt(tx.timeStamp);
        const periodIndex = Math.min(
            numberOfPeriods - 1,
            Math.floor((txTime - earliestTime) / periodSize)
        );
        transactionGroups[periodIndex].push(tx);
    }
    
    // Remove empty groups
    return transactionGroups.filter(group => group.length > 0);
}

export async function generateTransactionReport(
    prompt: string,
    transactions: Transaction[]
): Promise<TransactionRangeReport[]> {

    // Create system message with instructions for structure
    const systemMessage = `You are an AI that analyzes blockchain transaction data and generates insightful reports.

Analysis guidelines:
1. Identify patterns in transaction behavior
2. Highlight significant transfers (high value or to important addresses)
3. Detect any unusual activity
4. Calculate aggregate statistics
5. Summarize the time period's activity in a concise narrative

Your analysis should be factual, informative, and engaging for a video narration.

For each transaction report, respond with a valid JSON object with these properties:
- text: A narrative description of the transactions for the video
- transactions: Selected transactions that are relevant to the analysis report
- highlights: An array of key insights from the transactions
- statistics: An object containing totalValue (string), uniqueAddresses (number), and significantTransactions (number)`;

    // Make the API call to OpenAI with JSON response format
    const response = await openai.beta.chat.completions.parse({
        model: "o3-mini",
        response_format: zodResponseFormat(TransactionReportsSchema, 'transaction_reports'),
        messages: [
            { role: "system", content: systemMessage },
            { 
                role: "user", 
                content: `Analyze these blockchain transactions and generate a report based on this prompt: "${prompt}".
                
These transactions occurred between ${new Date(parseInt(transactions[0]?.timeStamp || '0') * 1000).toISOString()} and ${new Date(parseInt(transactions[transactions.length-1]?.timeStamp || '0') * 1000).toISOString()}.

Here are the transactions: ${JSON.stringify(transactions)}` 
            }
        ],
    });

    // Extract and parse the content
    const content = response.choices[0].message.parsed;
    
    // Return the report with structured data validated against schema
    return content?.transaction_reports || [];
}
    