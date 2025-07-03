"use client";
import { useEffect } from 'react';
import { useCredits } from '@/hooks/use-credits';
import { Badge } from '@/components/ui/badge';
import type { CreditTransaction } from '@/hooks/use-credits';

export default function CreditTransactionsPage() {
  const { history, loading, error, fetchHistory } = useCredits();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="max-w-3xl mx-auto mt-12 mb-16 p-8 bg-white/80 dark:bg-muted/80 rounded-xl shadow-lg border border-border">
      <h2 className="text-2xl font-bold mb-4 text-primary">Credit Transactions</h2>
      {/* Summary */}
      {history && history.length > 0 && (
        <div className="flex flex-wrap gap-6 mb-6 text-sm">
          <div>
            <span className="font-semibold">Total Credits Purchased:</span> {history.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0)}
          </div>
          <div>
            <span className="font-semibold">Total Spent:</span> ₹{history.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0)}
          </div>
        </div>
      )}
      {loading ? (
        <div>Loading transactions...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : history && history.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Credits</th>
                <th className="px-4 py-2 text-left">Reason</th>
                <th className="px-4 py-2 text-left">Session ID</th>
              </tr>
            </thead>
            <tbody>
              {history.map((tx: CreditTransaction) => (
                <tr key={tx.id} className="border-b">
                  <td className="px-4 py-2">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">{tx.type}</td>
                  <td className={`px-4 py-2 font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount}</td>
                  <td className="px-4 py-2">
                    <Badge variant={tx.amount > 0 ? 'default' : 'secondary'}>{tx.amount > 0 ? `+${tx.amount}` : tx.amount}</Badge>
                  </td>
                  <td className="px-4 py-2">{tx.reason}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{tx.sessionId ? tx.sessionId.slice(-8) + '...' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>No transactions found.</div>
      )}
    </div>
  );
} 