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
        'p-3 hover:bg-accent/50 transition-colors cursor-pointer',
        className
      )}>
        <div className="flex-1 min-w-0">
          {/* Header: Symbol + Exchange | LTP */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-foreground">{stock.symbol}</span>
              <span className="text-[10px] text-muted-foreground px-1 py-0 bg-muted rounded">
                {stock.exchange === 'NSE' ? 'FUT' : stock.exchange}
              </span>
            </div>
            <div className="text-right leading-none">
              <span className="font-bold text-base text-foreground">
                ₹{stock.current_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Stats Grid: Buy/Sell/High/Low */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground text-[10px] font-medium">Buy</span>
              <span className="font-medium text-profit">
                ₹{(stock.current_price ? stock.current_price * 1.0005 : 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground text-[10px] font-medium">Sell</span>
              <span className="font-medium text-loss">
                ₹{(stock.current_price ? stock.current_price * 0.9995 : 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground text-[10px] font-medium">High</span>
              <span className="font-medium">
                ₹{stock.day_high?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '--'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground text-[10px] font-medium">Low</span>
              <span className="font-medium">
                ₹{stock.day_low?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '--'}
              </span>
            </div>
          </div>

          {/* Footer: Change % Right Aligned */}
          <div className="flex items-center justify-end">
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
