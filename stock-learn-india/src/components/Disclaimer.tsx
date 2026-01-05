import { AlertTriangle } from 'lucide-react';

interface DisclaimerProps {
  variant?: 'banner' | 'inline';
  className?: string;
}

export function Disclaimer({ variant = 'banner', className = '' }: DisclaimerProps) {
  if (variant === 'inline') {
    return (
      <p className={`text-xs text-muted-foreground ${className}`}>
        ⚠️ This is a stock market simulation for educational purposes only. No real money involved.
      </p>
    );
  }

  return (
    <div className={`bg-warning/10 border border-warning/20 rounded-lg px-4 py-3 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Educational Simulator</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            This is a stock market simulation for educational purposes only. No real money involved. 
            All prices are delayed by 15 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
