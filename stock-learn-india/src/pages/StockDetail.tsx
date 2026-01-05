import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStock } from '@/hooks/useStocks';
import { PriceDisplay } from '@/components/PriceDisplay';
import { StockChart } from '@/components/StockChart';
import { OrderForm } from '@/components/OrderForm';
import { Disclaimer } from '@/components/Disclaimer';
import { EducationalTooltip } from '@/components/EducationalTooltip';
import { BottomNavigation } from '@/components/BottomNavigation';

import { useWatchlist } from '@/hooks/useWatchlist';
import { Eye, EyeOff } from 'lucide-react';

export default function StockDetail() {
  const { stockId } = useParams<{ stockId: string }>();
  const navigate = useNavigate();
  const { stock, isLoading } = useStock(stockId);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isAdding, isRemoving } = useWatchlist();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-card border-b border-border sticky top-0 z-40 safe-area-top">
          <div className="px-4 py-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex-1">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-1" />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Stock not found</p>
          <Button onClick={() => navigate('/market')}>Go to Market</Button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const isWatched = stockId ? isInWatchlist(stockId) : false;

  const handleWatchlistToggle = () => {
    if (!stockId) return;
    if (isWatched) {
      removeFromWatchlist(stockId);
    } else {
      addToWatchlist(stockId);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 safe-area-top">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground">{stock.symbol}</h1>
                <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                  {stock.exchange}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleWatchlistToggle}
              disabled={isAdding || isRemoving}
            >
              {isWatched ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-primary" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Price Display */}
        <Card className="p-4">
          <PriceDisplay
            price={stock.current_price || 0}
            previousPrice={stock.previous_close || undefined}
            size="lg"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Prices are delayed by 15 minutes
          </p>
        </Card>

        {/* Chart */}
        <Card className="p-4">
          <StockChart stock={stock} />
        </Card>

        {/* OHLC Data */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <EducationalTooltip term="ohlc">Today's Range</EducationalTooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Open</p>
                <p className="font-semibold">₹{stock.day_open?.toFixed(2) || '--'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">High</p>
                <p className="font-semibold text-profit">₹{stock.day_high?.toFixed(2) || '--'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Low</p>
                <p className="font-semibold text-loss">₹{stock.day_low?.toFixed(2) || '--'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  <EducationalTooltip term="previous_close">Prev Close</EducationalTooltip>
                </p>
                <p className="font-semibold">₹{stock.previous_close?.toFixed(2) || '--'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Volume */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                <EducationalTooltip term="volume">Volume</EducationalTooltip>
              </p>
              <p className="font-semibold text-lg">
                {stock.volume?.toLocaleString('en-IN') || '--'}
              </p>
            </div>
            {stock.sector && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Sector</p>
                <p className="font-semibold">{stock.sector}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Company Description */}
        {stock.description && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                About {stock.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{stock.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Disclaimer />

        {/* Order Form */}
        <OrderForm stock={stock} />
      </div>

      <BottomNavigation />
    </div>
  );
}
