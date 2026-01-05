import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrders } from '@/hooks/useOrders';
import { useVirtualAccount } from '@/hooks/useVirtualAccount';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Stock } from '@/hooks/useStocks';
import { Disclaimer } from './Disclaimer';
import { Loader2 } from 'lucide-react';

interface OrderFormProps {
  stock: Stock;
  onSuccess?: () => void;
}

export function OrderForm({ stock, onSuccess }: OrderFormProps) {
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const { placeOrder, isPlacingOrder } = useOrders();
  const { balance } = useVirtualAccount();
  const { holdings } = usePortfolio();

  const holding = holdings.find(h => h.stock_id === stock.id);
  const currentPrice = stock.current_price || 0;
  const qty = parseInt(quantity) || 0;
  const estimatedValue = qty * currentPrice;

  const canBuy = orderType === 'BUY' && estimatedValue <= balance && qty > 0;
  const canSell = orderType === 'SELL' && qty > 0 && holding && qty <= holding.quantity;
  const canSubmit = orderType === 'BUY' ? canBuy : canSell;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    await placeOrder.mutateAsync({
      stockId: stock.id,
      orderType,
      quantity: qty,
      price: currentPrice,
    });

    setQuantity('');
    onSuccess?.();
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Place Order</CardTitle>
        <Disclaimer variant="inline" />
      </CardHeader>
      <CardContent>
        <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'BUY' | 'SELL')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="BUY" className="data-[state=active]:bg-profit data-[state=active]:text-white">
              Buy
            </TabsTrigger>
            <TabsTrigger value="SELL" className="data-[state=active]:bg-loss data-[state=active]:text-white">
              Sell
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="price">Price per unit</Label>
              <Input
                id="price"
                value={`₹${currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                disabled
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Market order at current price (15-min delayed)
              </p>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={orderType === 'SELL' ? holding?.quantity : undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="mt-1.5"
              />
              {orderType === 'SELL' && holding && (
                <p className="text-xs text-muted-foreground mt-1">
                  Available to sell: {holding.quantity} units
                </p>
              )}
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Value</span>
                <span className="font-semibold">
                  ₹{estimatedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Cash</span>
                <span className={orderType === 'BUY' && estimatedValue > balance ? 'text-loss font-semibold' : ''}>
                  ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {orderType === 'BUY' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining Cash</span>
                  <span>
                    ₹{Math.max(0, balance - estimatedValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit || isPlacingOrder}
              variant={orderType === 'BUY' ? 'default' : 'destructive'}
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `${orderType} ${qty || 0} units`
              )}
            </Button>

            {orderType === 'BUY' && estimatedValue > balance && qty > 0 && (
              <p className="text-sm text-loss text-center">
                Insufficient virtual cash balance
              </p>
            )}
            {orderType === 'SELL' && (!holding || (qty > 0 && qty > holding.quantity)) && qty > 0 && (
              <p className="text-sm text-loss text-center">
                Insufficient quantity to sell
              </p>
            )}
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
