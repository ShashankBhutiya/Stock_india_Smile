import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  sector: string | null;
  description: string | null;
  current_price: number | null;
  previous_close: number | null;
  day_high: number | null;
  day_low: number | null;
  day_open: number | null;
  volume: number | null;
  last_updated: string | null;
  created_at: string;
}

// Simulated prices for demo (in production, fetch from Yahoo Finance)
const generateSimulatedPrice = (basePrice: number): number => {
  const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
  return Math.round((basePrice * (1 + variation)) * 100) / 100;
};

const BASE_PRICES: Record<string, number> = {
  'RELIANCE': 2456.75,
  'TCS': 3892.50,
  'HDFCBANK': 1654.30,
  'INFY': 1523.45,
  'ICICIBANK': 1087.60,
  'HINDUNILVR': 2534.80,
  'SBIN': 628.45,
  'BHARTIARTL': 1456.90,
  'ITC': 445.25,
  'KOTAKBANK': 1823.40,
  'LT': 3567.80,
  'AXISBANK': 1134.55,
  'ASIANPAINT': 2876.30,
  'MARUTI': 11234.50,
  'SUNPHARMA': 1678.90,
  'TITAN': 3234.65,
  'BAJFINANCE': 6789.20,
  'WIPRO': 467.85,
  'HCLTECH': 1534.60,
  'TATAMOTORS': 845.30,
};

export function useStocks() {
  const queryClient = useQueryClient();

  const { data: stocks, isLoading, error } = useQuery({
    queryKey: ['stocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .order('symbol');

      if (error) throw error;
      
      // Simulate real-time prices for demo
      return (data as Stock[]).map(stock => {
        const basePrice = BASE_PRICES[stock.symbol] || 1000;
        const currentPrice = generateSimulatedPrice(basePrice);
        const previousClose = basePrice * 0.995; // Slight difference for demo
        
        return {
          ...stock,
          current_price: currentPrice,
          previous_close: previousClose,
          day_open: basePrice,
          day_high: currentPrice * 1.015,
          day_low: currentPrice * 0.985,
          volume: Math.floor(Math.random() * 10000000) + 1000000,
        };
      });
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const searchStocks = (query: string): Stock[] => {
    if (!stocks || !query) return stocks || [];
    const lowerQuery = query.toLowerCase();
    return stocks.filter(
      stock =>
        stock.symbol.toLowerCase().includes(lowerQuery) ||
        stock.name.toLowerCase().includes(lowerQuery)
    );
  };

  const getStockById = (id: string): Stock | undefined => {
    return stocks?.find(stock => stock.id === id);
  };

  const getStockBySymbol = (symbol: string): Stock | undefined => {
    return stocks?.find(stock => stock.symbol === symbol);
  };

  return {
    stocks: stocks || [],
    isLoading,
    error,
    searchStocks,
    getStockById,
    getStockBySymbol,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['stocks'] }),
  };
}

export function useStock(stockId: string | undefined) {
  const { stocks, isLoading, error } = useStocks();
  
  const stock = stockId ? stocks.find(s => s.id === stockId) : undefined;
  
  return {
    stock,
    isLoading,
    error,
  };
}
