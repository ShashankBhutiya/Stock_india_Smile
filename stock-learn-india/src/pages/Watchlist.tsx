import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useStocks } from '@/hooks/useStocks';
import { StockCard } from '@/components/StockCard';
import { BottomNavigation } from '@/components/BottomNavigation';
import { toast } from 'sonner';

export default function Watchlist() {
    const navigate = useNavigate();
    const { watchlist, isLoading, removeFromWatchlist, addToWatchlist } = useWatchlist();
    const { stocks } = useStocks();
    const hasAutoAdded = useRef(false);

    useEffect(() => {
        if (!isLoading && watchlist.length === 0 && stocks.length > 0 && !hasAutoAdded.current) {
            // Check session storage to avoid re-adding if user intentionally cleared it in this session
            if (sessionStorage.getItem('watchlistAutoAdded')) return;

            hasAutoAdded.current = true;
            const popularSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ITC', 'GOLD'];
            const stocksToAdd = stocks.filter(s => popularSymbols.includes(s.symbol));

            if (stocksToAdd.length > 0) {
                toast.info('Adding popular stocks to your watchlist...');
                stocksToAdd.forEach(stock => {
                    addToWatchlist(stock.id);
                });
                sessionStorage.setItem('watchlistAutoAdded', 'true');
            }
        }
    }, [isLoading, watchlist.length, stocks.length, addToWatchlist, stocks]);

    const handleRemove = (e: React.MouseEvent, stockId: string) => {
        e.preventDefault();
        e.stopPropagation();
        removeFromWatchlist(stockId);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-card border-b border-border sticky top-0 z-40 safe-area-top">
                <div className="px-4 py-4 flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-bold text-foreground">My Watchlist</h1>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))
                ) : watchlist.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground mb-4">Your watchlist is empty</p>
                        <Button onClick={() => navigate('/market')}>Explore Stocks</Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {watchlist.map((item) => (
                            <div key={item.id} className="relative group">
                                <StockCard stock={item.stock!} className="pr-12" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => handleRemove(e, item.stock_id)}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNavigation />
        </div>
    );
}
