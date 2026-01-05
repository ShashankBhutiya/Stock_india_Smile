import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceDisplayProps {
  price: number;
  previousPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  showChange?: boolean;
  className?: string;
}

export function PriceDisplay({ 
  price, 
  previousPrice, 
  size = 'md', 
  showChange = true,
  className 
}: PriceDisplayProps) {
  const change = previousPrice ? price - previousPrice : 0;
  const changePercent = previousPrice ? (change / previousPrice) * 100 : 0;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const sizeClasses = {
    sm: {
      price: 'text-lg font-semibold',
      change: 'text-xs',
      icon: 'h-3 w-3',
    },
    md: {
      price: 'text-2xl font-bold',
      change: 'text-sm',
      icon: 'h-4 w-4',
    },
    lg: {
      price: 'text-4xl font-bold',
      change: 'text-base',
      icon: 'h-5 w-5',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={className}>
      <p className={cn(sizes.price, 'text-foreground')}>
        ₹{price.toLocaleString('en-IN', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </p>
      {showChange && previousPrice && (
        <div className={cn(
          'flex items-center gap-1 mt-1',
          sizes.change,
          isNeutral ? 'text-muted-foreground' : isPositive ? 'text-profit' : 'text-loss'
        )}>
          {isNeutral ? (
            <Minus className={sizes.icon} />
          ) : isPositive ? (
            <TrendingUp className={sizes.icon} />
          ) : (
            <TrendingDown className={sizes.icon} />
          )}
          <span>
            {isPositive ? '+' : ''}₹{Math.abs(change).toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        </div>
      )}
    </div>
  );
}
