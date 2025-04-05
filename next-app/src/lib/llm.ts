import {
    Transaction,
    NftTokenTransaction,
    TokenTransaction
} from '@/types/onchain';
import { TransactionRangeReport, TransactionStatistics } from '@/types/report';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Define the schema for the structured output
const reportResponseSchema = {
    type: "object",
    properties: {
        text: {
            type: "string",
            description: "The narrative text describing the transactions for the video"
        },
        highlights: {
            type: "array",
            items: {
                type: "string"
            },
            description: "Key highlights or insights from the transactions"
        },
        statistics: {
            type: "object",
            properties: {
                totalValue: {
                    type: "string",
                    description: "Total value of transactions in ETH"
                },
                uniqueAddresses: {
                    type: "number",
                    description: "Number of unique addresses involved"
                },
                significantTransactions: {
                    type: "number",
                    description: "Count of significant transactions"
                }
            },
            required: ["totalValue", "uniqueAddresses", "significantTransactions"]
        }
    },
    required: ["text", "highlights", "statistics"]
};

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

// Generate multiple transaction reports for different time ranges
export async function generateMultipleReports(
    prompt: string,
    transactions: Transaction[],
    numberOfPeriods: number
): Promise<TransactionRangeReport[]> {
    // Split transactions into time periods
    const transactionGroups = splitTransactionsByTime(transactions, numberOfPeriods);
    
    // Generate reports for each group
    const reports = await Promise.all(
        transactionGroups.map(txGroup => generateVideoScript(prompt, txGroup))
    );
    
    return reports;
}

export async function generateVideoScript(
    prompt: string,
    transactions: Transaction[]): Promise<TransactionRangeReport> {
    // Prepare transaction data for OpenAI
    const transactionData = transactions.map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        timeStamp: tx.timeStamp,
        functionName: tx.functionName || 'Unknown operation'
    }));

    // Create structured output prompt
    const structuredOutputPrompt = `
You must respond with a JSON object that conforms to this schema:
\`\`\`json
${JSON.stringify(reportResponseSchema, null, 2)}
\`\`\`
`;

    // Make the API call to OpenAI with structured output instructions
    const response = await openai.chat.completions.create({
        model: "gpt-o3-mini",
        response_format: { type: "json_object" },
        messages: [
            { 
                role: "system", 
                content: `You are an AI that analyzes blockchain transaction data and generates insightful reports.

Analysis guidelines:
1. Identify patterns in transaction behavior
2. Highlight significant transfers (high value or to important addresses)
3. Detect any unusual activity
4. Calculate aggregate statistics
5. Summarize the time period's activity in a concise narrative

Your analysis should be factual, informative, and engaging for a video narration.
${structuredOutputPrompt}`
            },
            { 
                role: "user", 
                content: `Analyze these blockchain transactions and generate a report based on this prompt: "${prompt}".
                
These transactions occurred between ${new Date(parseInt(transactions[0]?.timeStamp || '0') * 1000).toISOString()} and ${new Date(parseInt(transactions[transactions.length-1]?.timeStamp || '0') * 1000).toISOString()}.

Here are the transactions: ${JSON.stringify(transactionData)}` 
            }
        ],
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
        throw new Error("Empty response from OpenAI");
    }

    const parsedContent = JSON.parse(content);
    
    // Return the report with structured data validated against schema
    return {
        transactions: transactions,
        text: parsedContent.text,
        highlights: parsedContent.highlights,
        statistics: parsedContent.statistics
    };
}
    