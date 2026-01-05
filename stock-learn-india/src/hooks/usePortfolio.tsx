import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useStocks, Stock } from './useStocks';

export interface PortfolioHolding {
  id: string;
  user_id: string;
  stock_id: string;
  quantity: number;
  average_price: number;
  total_invested: number;
  created_at: string;
  updated_at: string;
  stock?: Stock;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  holdings: (PortfolioHolding & { currentValue: number; pnl: number; pnlPercent: number })[];
}

export function usePortfolio() {
  const { user } = useAuth();
  const { stocks } = useStocks();
  const queryClient = useQueryClient();

  const { data: holdings, isLoading, error } = useQuery({
    queryKey: ['portfolio', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id)
        .gt('quantity', 0);

      if (error) throw error;
      return data as PortfolioHolding[];
    },
    enabled: !!user?.id,
  });

  // Enrich holdings with stock data and calculate P&L
  const enrichedHoldings = (holdings || []).map(holding => {
    const stock = stocks.find(s => s.id === holding.stock_id);
    const currentPrice = stock?.current_price || holding.average_price;
    const currentValue = holding.quantity * currentPrice;
    const pnl = currentValue - holding.total_invested;
    const pnlPercent = holding.total_invested > 0 
      ? (pnl / holding.total_invested) * 100 
      : 0;

    return {
      ...holding,
      stock,
      currentValue,
      pnl,
      pnlPercent,
    };
  });

  const summary: PortfolioSummary = {
    totalValue: enrichedHoldings.reduce((sum, h) => sum + h.currentValue, 0),
    totalInvested: enrichedHoldings.reduce((sum, h) => sum + h.total_invested, 0),
    totalPnL: enrichedHoldings.reduce((sum, h) => sum + h.pnl, 0),
    totalPnLPercent: 0,
    holdings: enrichedHoldings,
  };
  
  summary.totalPnLPercent = summary.totalInvested > 0 
    ? (summary.totalPnL / summary.totalInvested) * 100 
    : 0;

  return {
    holdings: enrichedHoldings,
    summary,
    isLoading,
    error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['portfolio', user?.id] }),
  };
}
