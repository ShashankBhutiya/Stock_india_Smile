import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface HoldingCardProps {
  stockId: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export function HoldingCard({
  stockId,
  symbol,
  name,
  quantity,
  averagePrice,
  currentPrice,
  pnl,
  pnlPercent,
}: HoldingCardProps) {
  const isPositive = pnl >= 0;
  const currentValue = quantity * currentPrice;

  return (
    <Link to={`/stock/${stockId}`}>
      <Card className="p-4 hover:bg-accent/50 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-semibold text-foreground">{symbol}</span>
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{name}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-foreground">
              ₹{currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                {isPositive ? '+' : ''}₹{pnl.toFixed(2)} ({isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Qty</p>
            <p className="font-medium">{quantity}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Avg Price</p>
            <p className="font-medium">₹{averagePrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">LTP</p>
            <p className="font-medium">₹{currentPrice.toFixed(2)}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
