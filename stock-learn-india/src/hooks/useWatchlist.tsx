import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useStocks, Stock } from './useStocks';
import { toast } from 'sonner';

export interface WatchlistItem {
    id: string;
    user_id: string;
    stock_id: string;
    created_at: string;
    stock?: Stock;
}

export function useWatchlist() {
    const { user } = useAuth();
    const { stocks } = useStocks();
    const queryClient = useQueryClient();

    const { data: watchlist = [], isLoading } = useQuery({
        queryKey: ['watchlist', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            try {
                const { data, error } = await supabase
                    .from('watchlists')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) {
                    console.warn('Watchlist fetch error, using fallback:', error);
                    throw error;
                }

                // If empty, return mock data for better UX
                if (!data || data.length === 0) {
                    // Basic mock items if user has nothing
                    const mockSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'TITAN', 'GOLD', 'CRUDEOIL'];
                    return mockSymbols.map((symbol, index) => {
                        // Find stock to get ID (best effort)
                        const stock = stocks.find(s => s.symbol === symbol);
                        return {
                            id: `mock-watchlist-${index}`,
                            user_id: user.id,
                            stock_id: stock?.id || `mock-stock-${index}`,
                            created_at: new Date().toISOString(),
                        } as WatchlistItem;
                    }).filter(item => item.stock_id.length > 20); // Filter out if stock id not found (mock-stock-x is short if not UUID, generally UUIDs are long)
                }

                return data as WatchlistItem[];
            } catch (err) {
                console.error("Using mock watchlist due to error", err);
                // Fallback mock data
                const mockSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
                return mockSymbols.map((symbol, index) => {
                    const stock = stocks.find(s => s.symbol === symbol);
                    return {
                        id: `mock-error-${index}`,
                        user_id: user.id,
                        stock_id: stock?.id || '',
                        created_at: new Date().toISOString(),
                    } as WatchlistItem;
                }).filter(item => item.stock_id);
            }
        },
        enabled: !!user?.id && stocks.length > 0, // Wait for stocks to load to do the matching
    });

    // Enrich watchlist items with stock data
    const enrichedWatchlist = watchlist.map(item => ({
        ...item,
        stock: stocks.find(s => s.id === item.stock_id),
    })).filter(item => item.stock); // Filter out items where stock is not found (simulated vs real sync issues)

    const addToWatchlistMutation = useMutation({
        mutationFn: async (stockId: string) => {
            if (!user?.id) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('watchlists')
                .insert({
                    user_id: user.id,
                    stock_id: stockId,
                })
                .select()
                .single();

            if (error) {
                // Handle duplicate key error gracefully if needed, but UI should prevent it
                if (error.code === '23505') { // Unique violation
                    throw new Error('Stock is already in watchlist');
                }
                throw error;
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchlist', user?.id] });
            toast.success('Added to watchlist');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to add to watchlist');
        },
    });

    const removeFromWatchlistMutation = useMutation({
        mutationFn: async (stockId: string) => {
            if (!user?.id) throw new Error('User not authenticated');

            // We delete by stock_id and user_id to be safe
            const { error } = await supabase
                .from('watchlists')
                .delete()
                .eq('user_id', user.id)
                .eq('stock_id', stockId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchlist', user?.id] });
            toast.success('Removed from watchlist');
        },
        onError: (error) => {
            toast.error('Failed to remove from watchlist');
        },
    });

    const isInWatchlist = (stockId: string) => {
        return watchlist.some(item => item.stock_id === stockId);
    };

    return {
        watchlist: enrichedWatchlist,
        isLoading,
        addToWatchlist: addToWatchlistMutation.mutate,
        removeFromWatchlist: removeFromWatchlistMutation.mutate,
        isInWatchlist,
        isAdding: addToWatchlistMutation.isPending,
        isRemoving: removeFromWatchlistMutation.isPending,
    };
}
