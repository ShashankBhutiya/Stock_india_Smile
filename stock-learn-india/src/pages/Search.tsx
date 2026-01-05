import { useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStocks } from '@/hooks/useStocks';
import { StockCard } from '@/components/StockCard';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Disclaimer } from '@/components/Disclaimer';

export default function Search() {
  const [query, setQuery] = useState('');
  const { stocks, searchStocks, isLoading } = useStocks();

  const filteredStocks = query.trim() ? searchStocks(query) : stocks;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 safe-area-top">
        <div className="px-4 py-4">
          <h1 className="text-lg font-bold text-foreground mb-3">Search Stocks</h1>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or symbol..."
              className="pl-10 pr-10"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Disclaimer variant="inline" className="mb-2" />

        <p className="text-sm text-muted-foreground">
          {filteredStocks.length} {filteredStocks.length === 1 ? 'stock' : 'stocks'} found
        </p>

        <div className="space-y-2">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading stocks...</p>
          ) : filteredStocks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No stocks found for "{query}"
            </p>
          ) : (
            filteredStocks.map((stock) => (
              <StockCard key={stock.id} stock={stock} />
            ))
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
