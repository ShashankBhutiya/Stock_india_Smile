import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Stock } from '@/hooks/useStocks';
import { Link } from 'react-router-dom';

interface StockCardProps {
  stock: Stock;
  className?: string;
}

export function StockCard({ stock, className }: StockCardProps) {
  const priceChange = stock.current_price && stock.previous_close
    ? stock.current_price - stock.previous_close
    : 0;
  const priceChangePercent = stock.previous_close
    ? (priceChange / stock.previous_close) * 100
    : 0;
  const isPositive = priceChange >= 0;

  return (
    <Link to={`/stock/${stock.id}`}>
      <Card className={cn(
        'p-4 hover:bg-accent/50 transition-colors cursor-pointer',
        className
      )}>
        <div className="flex-1 min-w-0">
          {/* Header: Symbol & Price */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-foreground">{stock.symbol}</span>
              <span className="text-[10px] font-medium text-muted-foreground px-1.5 py-0.5 bg-muted rounded uppercase tracking-wide">
                {stock.exchange === 'NSE' ? 'FUT' : stock.exchange}
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-xl text-foreground tracking-tight">
                ₹{stock.current_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 mb-2">
            {/* Left Column: Buy & High */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Buy</span>
                <span className="font-medium text-profit">
                  ₹{(stock.current_price ? stock.current_price * 1.0005 : 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">High</span>
                <span className="font-medium text-foreground">
                  {stock.day_high?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '--'}
                </span>
              </div>
            </div>

            {/* Right Column: Sell & Low */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Sell</span>
                <span className="font-medium text-loss">
                  ₹{(stock.current_price ? stock.current_price * 0.9995 : 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Low</span>
                <span className="font-medium text-foreground">
                  {stock.day_low?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer: Change % */}
          <div className="flex justify-end mt-1">
            <span className={cn(
              "flex items-center text-sm font-semibold",
              isPositive ? "text-profit" : "text-loss"
            )}>
              {isPositive ? <TrendingUp className="h-4 w-4 mr-1.5" /> : <TrendingDown className="h-4 w-4 mr-1.5" />}
              {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
