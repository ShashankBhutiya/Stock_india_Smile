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
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{stock.symbol}</span>
              <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                {stock.exchange}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {stock.name}
            </p>
          </div>
          
          <div className="text-right flex-shrink-0 ml-4">
            <p className="font-semibold text-foreground">
              ₹{stock.current_price?.toLocaleString('en-IN', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              }) || '--'}
            </p>
            <div className={cn(
              'flex items-center justify-end gap-1 text-sm',
              isPositive ? 'text-profit' : 'text-loss'
            )}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>
                {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
