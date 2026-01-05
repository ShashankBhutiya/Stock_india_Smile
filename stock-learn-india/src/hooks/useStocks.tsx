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
  // MCX Commodities
  'GOLD': 62500.00,
  'SILVER': 74500.00,
  'CRUDEOIL': 6100.00,
  'NATURALGAS': 240.50,
  'COPPER': 720.00,
  'ZINC': 225.00,
  'ALUMINIUM': 205.00,
  'LEAD': 185.00,
  'NICKEL': 1450.00,
  'MENTHAOIL': 920.00,
  'COTTON': 56500.00,
  'RUBBER': 18000.00,
  'CPO': 850.00,
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

      let stocksData = data as Stock[];

      // Check if MCX stocks are missing (migration not run yet)
      const hasMCX = stocksData.some(s => s.exchange === 'MCX');
      if (!hasMCX) {
        const mcxStocks: Stock[] = [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            symbol: 'GOLD',
            name: 'Gold Futures',
            exchange: 'MCX',
            sector: 'Commodity',
            description: 'Gold futures contract traded on MCX.',
            current_price: 62500.00,
            previous_close: 62200.00,
            day_high: 62800.00,
            day_low: 62100.00,
            day_open: 62300.00,
            volume: 15000,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            symbol: 'SILVER',
            name: 'Silver Futures',
            exchange: 'MCX',
            sector: 'Commodity',
            description: 'Silver futures contract traded on MCX.',
            current_price: 74500.00,
            previous_close: 74000.00,
            day_high: 75000.00,
            day_low: 73800.00,
            day_open: 74100.00,
            volume: 25000,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440003',
            symbol: 'CRUDEOIL',
            name: 'Crude Oil Futures',
            exchange: 'MCX',
            sector: 'Commodity',
            description: 'Crude Oil futures contract traded on MCX.',
            current_price: 6100.00,
            previous_close: 6050.00,
            day_high: 6150.00,
            day_low: 6000.00,
            day_open: 6080.00,
            volume: 500000,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440004',
            symbol: 'NATURALGAS',
            name: 'Natural Gas Futures',
            exchange: 'MCX',
            sector: 'Commodity',
            description: 'Natural Gas futures contract traded on MCX.',
            current_price: 240.50,
            previous_close: 238.00,
            day_high: 245.00,
            day_low: 235.00,
            day_open: 239.00,
            volume: 800000,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440005',
            symbol: 'COPPER',
            name: 'Copper Futures',
            exchange: 'MCX',
            sector: 'Commodity',
            description: 'Copper futures contract traded on MCX.',
            current_price: 720.00,
            previous_close: 715.00,
            day_high: 725.00,
            day_low: 712.00,
            day_open: 718.00,
            volume: 45000,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440006',
            symbol: 'ZINC',
            name: 'Zinc Futures',
            exchange: 'MCX',
            sector: 'Commodity',
            description: 'Zinc futures contract traded on MCX.',
            current_price: 225.00,
            previous_close: 223.00,
            day_high: 228.00,
            day_low: 221.00,
            day_open: 224.00,
            volume: 30000,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440007',
            symbol: 'ALUMINIUM',
            name: 'Aluminium Futures',
            exchange: 'MCX',
            sector: 'Commodity',
            description: 'Aluminium futures contract traded on MCX.',
            current_price: 205.00,
            previous_close: 203.00,
            day_high: 207.00,
            day_low: 202.00,
            day_open: 204.00,
            volume: 25000,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440008',
            symbol: 'LEAD',
            name: 'Lead Futures',
            exchange: 'MCX',
            sector: 'Commodity',
            description: 'Lead futures contract traded on MCX.',
            current_price: 185.00,
            previous_close: 183.00,
            day_high: 187.00,
            day_low: 182.00,
            day_open: 184.00,
            volume: 15000,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440009',
            symbol: 'NICKEL',
            name: 'Nickel Futures',
            exchange: 'MCX',
            sector: 'Commodity',
            description: 'Nickel futures contract traded on MCX.',
            current_price: 1450.00,
            previous_close: 1440.00,
            day_high: 1460.00,
            day_low: 1435.00,
            day_open: 1445.00,
            volume: 12000,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440010',
            symbol: 'MENTHAOIL',
            name: 'Mentha Oil Futures',
            exchange: 'MCX',
            sector: 'Commodity',
            description: 'Mentha Oil futures contract traded on MCX.',
            current_price: 920.00,
            previous_close: 915.00,
            day_high: 925.00,
            day_low: 910.00,
            day_open: 918.00,
            volume: 5000,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440011',
            symbol: 'COTTON',
            name: 'Cotton Futures',
            exchange: 'MCX',
            sector: 'Commodity',
            description: 'Cotton futures contract traded on MCX.',
            current_price: 56500.00,
            previous_close: 56200.00,
            day_high: 56800.00,
            day_low: 56000.00,
            day_open: 56300.00,
            volume: 8000,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440012',
            symbol: 'RUBBER',
            name: 'Rubber Futures',
            exchange: 'MCX',
            sector: 'Commodity',
            description: 'Rubber futures contract traded on MCX.',
            current_price: 18000.00,
            previous_close: 17900.00,
            day_high: 18100.00,
            day_low: 17850.00,
            day_open: 17950.00,
            volume: 4000,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440013',
            symbol: 'CPO',
            name: 'CPO Futures',
            exchange: 'MCX',
            sector: 'Commodity',
            description: 'Crude Palm Oil futures contract traded on MCX.',
            current_price: 850.00,
            previous_close: 845.00,
            day_high: 855.00,
            day_low: 840.00,
            day_open: 848.00,
            volume: 9000,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        ];
        stocksData = [...stocksData, ...mcxStocks];
      }

      // Simulate real-time prices for demo
      return stocksData.map(stock => {
        const basePrice = BASE_PRICES[stock.symbol] || stock.current_price || 1000;
        const currentPrice = generateSimulatedPrice(basePrice);
        const previousClose = stock.previous_close || basePrice * 0.995;

        return {
          ...stock,
          current_price: currentPrice,
          previous_close: previousClose,
          day_open: stock.day_open || basePrice,
          day_high: Number(stock.day_high) || currentPrice * 1.015,
          day_low: Number(stock.day_low) || currentPrice * 0.985,
          volume: Number(stock.volume) || Math.floor(Math.random() * 10000000) + 1000000,
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
