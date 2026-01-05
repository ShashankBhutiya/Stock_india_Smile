import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface VirtualAccount {
  id: string;
  user_id: string;
  balance: number;
  initial_balance: number;
  created_at: string;
  updated_at: string;
}

export function useVirtualAccount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: account, isLoading, error } = useQuery({
    queryKey: ['virtual-account', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('virtual_accounts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as VirtualAccount | null;
    },
    enabled: !!user?.id,
  });

  const updateBalance = useMutation({
    mutationFn: async (newBalance: number) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('virtual_accounts')
        .update({ balance: newBalance })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-account', user?.id] });
    },
  });

  return {
    account,
    balance: account?.balance ?? 0,
    initialBalance: account?.initial_balance ?? 1000000,
    isLoading,
    error,
    updateBalance,
  };
}
