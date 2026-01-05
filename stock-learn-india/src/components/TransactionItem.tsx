import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionItemProps {
  type: 'BUY' | 'SELL';
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  totalValue: number;
  createdAt: string;
}

export function TransactionItem({
  type,
  symbol,
  name,
  quantity,
  price,
  totalValue,
  createdAt,
}: TransactionItemProps) {
  const isBuy = type === 'BUY';
  const date = new Date(createdAt);

  return (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
      <div className={cn(
        'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
        isBuy ? 'bg-profit/10' : 'bg-loss/10'
      )}>
        {isBuy ? (
          <ArrowDownLeft className="h-5 w-5 text-profit" />
        ) : (
          <ArrowUpRight className="h-5 w-5 text-loss" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{symbol}</span>
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded font-medium',
            isBuy ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'
          )}>
            {type}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {format(date, 'MMM d, yyyy • h:mm a')}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={cn('font-semibold', isBuy ? 'text-loss' : 'text-profit')}>
          {isBuy ? '-' : '+'}₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground">
          {quantity} units × ₹{price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
