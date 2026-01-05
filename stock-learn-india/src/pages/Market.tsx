import { useStocks, Stock } from '@/hooks/useStocks';
import { useVirtualAccount } from '@/hooks/useVirtualAccount';
import { StockCard } from '@/components/StockCard';
import { Disclaimer } from '@/components/Disclaimer';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Market() {
  const { stocks, isLoading, refetch } = useStocks();
  const { balance, isLoading: balanceLoading } = useVirtualAccount();

  const getGainersLosers = (exchangeStocks: Stock[]) => {
    const gainers = [...exchangeStocks]
      .filter(s => s.current_price && s.previous_close)
      .sort((a, b) => {
        const aChange = ((a.current_price! - a.previous_close!) / a.previous_close!) * 100;
        const bChange = ((b.current_price! - b.previous_close!) / b.previous_close!) * 100;
        return bChange - aChange;
      })
      .slice(0, 5);

    const losers = [...exchangeStocks]
      .filter(s => s.current_price && s.previous_close)
      .sort((a, b) => {
        const aChange = ((a.current_price! - a.previous_close!) / a.previous_close!) * 100;
        const bChange = ((b.current_price! - b.previous_close!) / b.previous_close!) * 100;
        return aChange - bChange;
      })
      .slice(0, 5);

    return { gainers, losers };
  };

  const nseStocks = stocks.filter(s => s.exchange === 'NSE');
  const mcxStocks = stocks.filter(s => s.exchange === 'MCX');

  const { gainers: nseGainers, losers: nseLosers } = getGainersLosers(nseStocks);
  const { gainers: mcxGainers, losers: mcxLosers } = getGainersLosers(mcxStocks);

  const MarketView = ({
    stocks,
    gainers,
    losers,
    title,
    isLoading
  }: {
    stocks: Stock[],
    gainers: Stock[],
    losers: Stock[],
    title: string,
    isLoading: boolean
  }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
            gainers.map((stock) => (
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
            losers.map((stock) => (
              <StockCard key={stock.id} stock={stock} />
            ))
          )}
        </div>
      </section>

      {/* List */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">{title} List</h2>
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
  );

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

        <Tabs defaultValue="NSE" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="NSE">NSE Futures</TabsTrigger>
            <TabsTrigger value="MCX">MCX Futures</TabsTrigger>
          </TabsList>

          <TabsContent value="NSE">
            <MarketView
              stocks={nseStocks}
              gainers={nseGainers}
              losers={nseLosers}
              title="NSE Futures"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="MCX">
            <MarketView
              stocks={mcxStocks}
              gainers={mcxGainers}
              losers={mcxLosers}
              title="MCX Commodities"
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}
