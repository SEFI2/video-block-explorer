import { Transaction, NftTokenTransaction ,TokenTransaction} from "@/types/onchain";

export interface TransactionStatistics {
    totalValue: string;
    uniqueAddresses: number;
    significantTransactions: number;
}

export interface TransactionReport {
    transactions: Transaction[];
    text: string;
    highlights: string[];
    statistics: TransactionStatistics;
}

