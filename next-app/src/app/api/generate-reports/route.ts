import { NextRequest, NextResponse } from 'next/server';
import { generateMultipleReports } from '@/lib/llm';
import { Transaction } from '@/types/onchain';

export async function POST(request: NextRequest) {
  const { prompt, transactions, numberOfPeriods } = await request.json();

  // Validate input
  if (!prompt || !transactions || !transactions.length) {
    return NextResponse.json(
      { error: 'Missing required parameters: prompt and transactions' },
      { status: 400 }
    );
  }

  // Generate multiple reports with structured output
  const reports = await generateMultipleReports(
    prompt,
    transactions,
    numberOfPeriods || 3
  );

  // Return the reports with structured data
  return NextResponse.json({
    success: true,
    reports
  });
} 