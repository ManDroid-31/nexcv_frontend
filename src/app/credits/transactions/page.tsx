import { useEffect } from 'react';
import { useCredits } from '@/hooks/use-credits';

export default function CreditTransactionsPage() {
  const { history, loading, error, fetchHistory } = useCredits();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="max-w-3xl mx-auto mt-12 mb-16 p-8 bg-white/80 dark:bg-muted/80 rounded-xl shadow-lg border border-border">
      <h2 className="text-2xl font-bold mb-4 text-primary">Credit Transactions</h2>
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
                <th className="px-4 py-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {history.map((tx: any) => (
                <tr key={tx.id} className="border-b">
                  <td className="px-4 py-2">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">{tx.type}</td>
                  <td className="px-4 py-2">{tx.amount > 0 ? '+' : ''}{tx.amount}</td>
                  <td className="px-4 py-2">{tx.reason}</td>
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