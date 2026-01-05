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
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-bold text-base text-foreground">{stock.symbol}</span>
              <span className="ml-2 text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                {stock.exchange === 'NSE' ? 'FUT' : stock.exchange}
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-lg text-foreground">
                ₹{stock.current_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs">Buy</span>
              <span className="font-medium text-profit">
                ₹{(stock.current_price ? stock.current_price * 1.0005 : 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs">Sell</span>
              <span className="font-medium text-loss">
                ₹{(stock.current_price ? stock.current_price * 0.9995 : 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs">High</span>
              <span className="font-medium">
                ₹{stock.day_high?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs">Low</span>
              <span className="font-medium">
                ₹{stock.day_low?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '--'}
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-1 text-sm">
            <span className={cn(
              "flex items-center text-xs font-semibold",
              isPositive ? "text-profit" : "text-loss"
            )}>
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
