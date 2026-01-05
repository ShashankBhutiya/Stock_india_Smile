import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EducationalTooltipProps {
  term: string;
  children?: React.ReactNode;
}

const EDUCATIONAL_CONTENT: Record<string, { title: string; description: string }> = {
  'pnl': {
    title: 'Profit & Loss (P&L)',
    description: 'The difference between your buying price and current market price. Green means profit, red means loss.',
  },
  'unrealized': {
    title: 'Unrealized P&L',
    description: 'Potential profit or loss that hasn\'t been locked in yet. It becomes realized when you sell the stock.',
  },
  'average_price': {
    title: 'Average Price',
    description: 'The weighted average of all your purchase prices for this stock. Used to calculate your P&L.',
  },
  'ohlc': {
    title: 'OHLC Data',
    description: 'Open, High, Low, Close prices for a trading day. Helps understand price movement range.',
  },
  'market_order': {
    title: 'Market Order',
    description: 'An order to buy/sell immediately at the current market price. Fast execution but price may vary.',
  },
  'diversification': {
    title: 'Diversification',
    description: 'Spreading investments across different stocks/sectors to reduce risk. Don\'t put all eggs in one basket!',
  },
  'volume': {
    title: 'Trading Volume',
    description: 'Number of shares traded during a period. High volume often indicates strong interest in the stock.',
  },
  'previous_close': {
    title: 'Previous Close',
    description: 'The stock\'s closing price from the previous trading day. Used to calculate daily change.',
  },
  'm2m': {
    title: 'Mark to Market (M2M)',
    description: 'The daily profit or loss based on the difference between the current price and the previous day\'s closing price.',
  },
};

export function EducationalTooltip({ term, children }: EducationalTooltipProps) {
  const content = EDUCATIONAL_CONTENT[term];

  if (!content) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help border-b border-dashed border-muted-foreground">
          {children}
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-semibold text-sm">{content.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{content.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
