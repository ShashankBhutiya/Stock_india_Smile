import { useNavigate } from 'react-router-dom';
import { ArrowRight, History as HistoryIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionItem } from '@/components/TransactionItem';
import { Disclaimer } from '@/components/Disclaimer';
import { BottomNavigation } from '@/components/BottomNavigation';

export default function TransactionHistory() {
  const navigate = useNavigate();
  const { transactions, isLoading } = useTransactions();

  const totalBuys = transactions.filter(t => t.transaction_type === 'BUY').length;
  const totalSells = transactions.filter(t => t.transaction_type === 'SELL').length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 safe-area-top">
        <div className="px-4 py-4">
          <h1 className="text-lg font-bold text-foreground">Transaction History</h1>
          <p className="text-sm text-muted-foreground">Your simulated trading activity</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-profit">{totalBuys}</p>
            <p className="text-xs text-muted-foreground">Buy Orders</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-loss">{totalSells}</p>
            <p className="text-xs text-muted-foreground">Sell Orders</p>
          </Card>
        </div>

        {/* Disclaimer */}
        <Disclaimer variant="inline" />

        {/* Transactions List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <HistoryIcon className="h-4 w-4" />
              All Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="py-4 border-b border-border last:border-0">
                  <Skeleton className="h-16 w-full" />
                </div>
              ))
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No transactions yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Start trading to see your transaction history
                </p>
                <Button onClick={() => navigate('/market')}>
                  Explore Stocks
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  type={transaction.transaction_type}
                  symbol={transaction.stock?.symbol || 'Unknown'}
                  name={transaction.stock?.name || 'Unknown Stock'}
                  quantity={transaction.quantity}
                  price={transaction.price}
                  totalValue={transaction.total_value}
                  createdAt={transaction.created_at}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
