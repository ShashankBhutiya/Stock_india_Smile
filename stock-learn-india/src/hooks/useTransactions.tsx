import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useStocks, Stock } from './useStocks';

export interface Transaction {
  id: string;
  user_id: string;
  order_id: string;
  stock_id: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total_value: number;
  created_at: string;
  stock?: Stock;
}

export function useTransactions() {
  const { user } = useAuth();
  const { stocks } = useStocks();

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user?.id,
  });

  // Enrich transactions with stock data
  const enrichedTransactions = (transactions || []).map(transaction => ({
    ...transaction,
    stock: stocks.find(s => s.id === transaction.stock_id),
  }));

  return {
    transactions: enrichedTransactions,
    isLoading,
    error,
  };
}
