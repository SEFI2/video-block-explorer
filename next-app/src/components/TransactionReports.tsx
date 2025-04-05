'use client';

import { useState } from 'react';
import { TransactionRangeReport } from '@/types/report';
import { Transaction } from '@/types/onchain';

interface TransactionReportsProps {
  walletAddress: string;
  onReportsGenerated?: (reports: TransactionRangeReport[]) => void;
}

export default function TransactionReports({ walletAddress, onReportsGenerated }: TransactionReportsProps) {
  const [prompt, setPrompt] = useState<string>('');
  const [reports, setReports] = useState<TransactionRangeReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateReports = async () => {
    if (!prompt) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Fetch transactions for the wallet
    const txResponse = await fetch(`/api/transactions?address=${walletAddress}`);
    const txData = await txResponse.json();
    
    if (!txResponse.ok) {
      setIsLoading(false);
      setError(txData.error || 'Failed to fetch transactions');
      return;
    }

    const transactions: Transaction[] = txData.transactions;

    // Generate reports
    const reportsResponse = await fetch('/api/generate-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        transactions,
        numberOfPeriods: 3
      })
    });

    const reportsData = await reportsResponse.json();
    
    if (!reportsResponse.ok) {
      setIsLoading(false);
      setError(reportsData.error || 'Failed to generate reports');
      return;
    }

    setReports(reportsData.reports);
    setIsLoading(false);

    if (onReportsGenerated) {
      onReportsGenerated(reportsData.reports);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Generate Transaction Reports</h2>
        
        <div className="space-y-2">
          <label htmlFor="prompt" className="block font-medium">
            Analysis Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt (e.g., Analyze this wallet's trading patterns)"
            className="w-full p-2 border rounded min-h-24"
          />
        </div>
        
        <button
          onClick={generateReports}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Generating...' : 'Generate Reports'}
        </button>
        
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded border border-red-200">
            {error}
          </div>
        )}
      </div>

      {reports.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Transaction Reports</h3>
          
          {reports.map((report, index) => (
            <div key={index} className="p-4 border rounded bg-gray-50">
              <h4 className="text-lg font-medium mb-3">
                Period {index + 1} ({report.transactions.length} transactions)
              </h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium">Analysis</h5>
                  <p className="whitespace-pre-line">{report.text}</p>
                </div>
                
                {report.highlights && report.highlights.length > 0 && (
                  <div>
                    <h5 className="font-medium">Highlights</h5>
                    <ul className="list-disc pl-5">
                      {report.highlights.map((highlight, i) => (
                        <li key={i}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {report.statistics && (
                  <div>
                    <h5 className="font-medium">Statistics</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="font-medium">{report.statistics.totalValue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Unique Addresses</p>
                        <p className="font-medium">{report.statistics.uniqueAddresses}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Significant Txs</p>
                        <p className="font-medium">{report.statistics.significantTransactions}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 