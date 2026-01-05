import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, PieChart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useVirtualAccount } from '@/hooks/useVirtualAccount';
import { HoldingCard } from '@/components/HoldingCard';
import { EducationalTooltip } from '@/components/EducationalTooltip';
import { Disclaimer } from '@/components/Disclaimer';
import { BottomNavigation } from '@/components/BottomNavigation';
import { cn } from '@/lib/utils';

export default function Portfolio() {
  const navigate = useNavigate();
  const { summary, holdings, isLoading } = usePortfolio();
  const { balance, initialBalance, isLoading: balanceLoading } = useVirtualAccount();

  const totalPortfolioValue = summary.totalValue + balance;
  const overallPnL = totalPortfolioValue - initialBalance;
  const overallPnLPercent = (overallPnL / initialBalance) * 100;
  const isPositive = overallPnL >= 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 safe-area-top">
        <div className="px-4 py-4">
          <h1 className="text-lg font-bold text-foreground">Portfolio</h1>
          <p className="text-sm text-muted-foreground">Your investment summary</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Total Value Card */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                <PieChart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm opacity-80">Total Portfolio Value</p>
                {balanceLoading || isLoading ? (
                  <Skeleton className="h-8 w-40 bg-primary-foreground/20" />
                ) : (
                  <p className="text-2xl font-bold">
                    ₹{totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium',
                isPositive ? 'bg-profit/20' : 'bg-loss/20'
              )}>
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {isPositive ? '+' : ''}₹{overallPnL.toFixed(2)} ({isPositive ? '+' : ''}{overallPnLPercent.toFixed(2)}%)
                </span>
              </div>
              <span className="text-sm opacity-80">Overall P&L</span>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Margin Available</span>
              </div>
              {balanceLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <p className="font-semibold text-sm sm:text-base">
                  ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  <EducationalTooltip term="m2m">M2M</EducationalTooltip>
                </span>
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <p className={cn(
                  'font-semibold text-sm sm:text-base',
                  summary.totalM2M >= 0 ? 'text-profit' : 'text-loss'
                )}>
                  {summary.totalM2M >= 0 ? '+' : ''}₹{summary.totalM2M.toFixed(2)}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  <EducationalTooltip term="unrealized">Active PnL</EducationalTooltip>
                </span>
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <p className={cn(
                  'font-semibold text-sm sm:text-base',
                  summary.totalPnL >= 0 ? 'text-profit' : 'text-loss'
                )}>
                  {summary.totalPnL >= 0 ? '+' : ''}₹{summary.totalPnL.toFixed(2)}
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Disclaimer */}
        <Disclaimer variant="inline" />

        {/* Holdings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Holdings ({holdings.length})</span>
              {holdings.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  Invested: ₹{summary.totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))
            ) : holdings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No holdings yet</p>
                <Button onClick={() => navigate('/market')}>
                  Explore Stocks
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              holdings.map((holding) => (
                <HoldingCard
                  key={holding.id}
                  stockId={holding.stock_id}
                  symbol={holding.stock?.symbol || 'Unknown'}
                  name={holding.stock?.name || 'Unknown Stock'}
                  quantity={holding.quantity}
                  averagePrice={holding.average_price}
                  currentPrice={holding.stock?.current_price || holding.average_price}
                  pnl={holding.pnl}
                  pnlPercent={holding.pnlPercent}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
