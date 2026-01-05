import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useVirtualAccount } from './useVirtualAccount';
import { toast } from 'sonner';

interface PlaceOrderParams {
  stockId: string;
  orderType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
}

export function useOrders() {
  const { user } = useAuth();
  const { account, updateBalance } = useVirtualAccount();
  const queryClient = useQueryClient();

  const placeOrder = useMutation({
    mutationFn: async ({ stockId, orderType, quantity, price }: PlaceOrderParams) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (!account) throw new Error('Virtual account not found');

      const totalValue = quantity * price;

      // Validate balance for BUY orders
      if (orderType === 'BUY' && totalValue > account.balance) {
        throw new Error('Insufficient virtual cash balance');
      }

      // For SELL orders, validate holdings
      if (orderType === 'SELL') {
        const { data: holding, error: holdingError } = await supabase
          .from('portfolio_holdings')
          .select('quantity')
          .eq('user_id', user.id)
          .eq('stock_id', stockId)
          .maybeSingle();

        if (holdingError) throw holdingError;
        if (!holding || holding.quantity < quantity) {
          throw new Error('Insufficient shares to sell');
        }
      }

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          stock_id: stockId,
          order_type: orderType,
          quantity,
          price,
          total_value: totalValue,
          status: 'COMPLETED',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          order_id: order.id,
          stock_id: stockId,
          transaction_type: orderType,
          quantity,
          price,
          total_value: totalValue,
        });

      if (transactionError) throw transactionError;

      // Update portfolio holdings
      const { data: existingHolding } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id)
        .eq('stock_id', stockId)
        .maybeSingle();

      if (orderType === 'BUY') {
        if (existingHolding) {
          // Update existing holding
          const newQuantity = existingHolding.quantity + quantity;
          const newTotalInvested = existingHolding.total_invested + totalValue;
          const newAveragePrice = newTotalInvested / newQuantity;

          await supabase
            .from('portfolio_holdings')
            .update({
              quantity: newQuantity,
              average_price: newAveragePrice,
              total_invested: newTotalInvested,
            })
            .eq('id', existingHolding.id);
        } else {
          // Create new holding
          await supabase
            .from('portfolio_holdings')
            .insert({
              user_id: user.id,
              stock_id: stockId,
              quantity,
              average_price: price,
              total_invested: totalValue,
            });
        }

        // Deduct from balance
        await updateBalance.mutateAsync(account.balance - totalValue);
      } else {
        // SELL order
        if (existingHolding) {
          const newQuantity = existingHolding.quantity - quantity;
          const sellProportion = quantity / existingHolding.quantity;
          const newTotalInvested = existingHolding.total_invested * (1 - sellProportion);

          if (newQuantity === 0) {
            await supabase
              .from('portfolio_holdings')
              .delete()
              .eq('id', existingHolding.id);
          } else {
            await supabase
              .from('portfolio_holdings')
              .update({
                quantity: newQuantity,
                total_invested: newTotalInvested,
              })
              .eq('id', existingHolding.id);
          }
        }

        // Add to balance
        await updateBalance.mutateAsync(account.balance + totalValue);
      }

      return order;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['virtual-account'] });
      
      toast.success(
        `${variables.orderType} order completed successfully!`,
        {
          description: `${variables.quantity} shares at ₹${variables.price.toFixed(2)}`,
        }
      );
    },
    onError: (error: Error) => {
      toast.error('Order failed', {
        description: error.message,
      });
    },
  });

  return {
    placeOrder,
    isPlacingOrder: placeOrder.isPending,
  };
}
