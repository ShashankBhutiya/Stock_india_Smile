import { useStocks } from '@/hooks/useStocks';
import { useVirtualAccount } from '@/hooks/useVirtualAccount';
import { StockCard } from '@/components/StockCard';
import { Disclaimer } from '@/components/Disclaimer';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function Market() {
  const { stocks, isLoading, refetch } = useStocks();
  const { balance, isLoading: balanceLoading } = useVirtualAccount();

  const topGainers = [...stocks]
    .filter(s => s.current_price && s.previous_close)
    .sort((a, b) => {
      const aChange = ((a.current_price! - a.previous_close!) / a.previous_close!) * 100;
      const bChange = ((b.current_price! - b.previous_close!) / b.previous_close!) * 100;
      return bChange - aChange;
    })
    .slice(0, 5);

  const topLosers = [...stocks]
    .filter(s => s.current_price && s.previous_close)
    .sort((a, b) => {
      const aChange = ((a.current_price! - a.previous_close!) / a.previous_close!) * 100;
      const bChange = ((b.current_price! - b.previous_close!) / b.previous_close!) * 100;
      return aChange - bChange;
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 safe-area-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">StockEdu India</h1>
                <p className="text-xs text-muted-foreground">
                  Prices delayed by 15 min • {format(new Date(), 'h:mm a')}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Virtual Cash Card */}
        <Card className="p-4 bg-primary text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary-foreground/10 rounded-full flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-80">Virtual Cash Balance</p>
              {balanceLoading ? (
                <Skeleton className="h-7 w-32 bg-primary-foreground/20" />
              ) : (
                <p className="text-2xl font-bold">
                  ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <Disclaimer />

        {/* Top Gainers */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-profit" />
            Top Gainers
          </h2>
          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-12 w-full" />
                </Card>
              ))
            ) : (
              topGainers.map((stock) => (
                <StockCard key={stock.id} stock={stock} />
              ))
            )}
          </div>
        </section>

        {/* Top Losers */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-loss rotate-180" />
            Top Losers
          </h2>
          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-12 w-full" />
                </Card>
              ))
            ) : (
              topLosers.map((stock) => (
                <StockCard key={stock.id} stock={stock} />
              ))
            )}
          </div>
        </section>

        {/* All Stocks */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">All Stocks</h2>
          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-12 w-full" />
                </Card>
              ))
            ) : (
              stocks.map((stock) => (
                <StockCard key={stock.id} stock={stock} />
              ))
            )}
          </div>
        </section>
      </div>

      <BottomNavigation />
    </div>
  );
}
