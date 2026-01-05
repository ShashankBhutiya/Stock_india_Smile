import { useEffect, useRef, useMemo } from 'react';
import { Stock } from '@/hooks/useStocks';

interface StockChartProps {
  stock: Stock;
  className?: string;
}

// Generate simulated historical data for demo
function generateHistoricalData(basePrice: number, days: number = 30) {
  const data = [];
  let price = basePrice;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = days; i >= 0; i--) {
    const time = Math.floor((now - i * dayMs) / 1000);
    const change = (Math.random() - 0.48) * basePrice * 0.03;
    price = Math.max(price + change, basePrice * 0.7);
    
    const open = price;
    const close = price + (Math.random() - 0.5) * basePrice * 0.02;
    const high = Math.max(open, close) + Math.random() * basePrice * 0.01;
    const low = Math.min(open, close) - Math.random() * basePrice * 0.01;

    data.push({
      time,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    });

    price = close;
  }

  return data;
}

export function StockChart({ stock, className = '' }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  const historicalData = useMemo(
    () => generateHistoricalData(stock.current_price || 1000, 60),
    [stock.symbol]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamic import of lightweight-charts
    import('lightweight-charts').then((LightweightCharts) => {
      if (chartRef.current) {
        chartRef.current.remove();
      }

      const chart = LightweightCharts.createChart(containerRef.current!, {
        width: containerRef.current!.clientWidth,
        height: 300,
        layout: {
          background: { type: LightweightCharts.ColorType.Solid, color: 'transparent' },
          textColor: '#888',
        },
        grid: {
          vertLines: { color: '#e0e0e0' },
          horzLines: { color: '#e0e0e0' },
        },
        rightPriceScale: {
          borderColor: '#e0e0e0',
        },
        timeScale: {
          borderColor: '#e0e0e0',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const candlestickSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#22c55e',
        borderDownColor: '#ef4444',
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });

      candlestickSeries.setData(historicalData);
      chart.timeScale().fitContent();

      chartRef.current = chart;
      seriesRef.current = candlestickSeries;

      const handleResize = () => {
        if (containerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: containerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    });
  }, [historicalData]);

  return (
    <div className={className}>
      <div ref={containerRef} className="w-full" />
      <p className="text-xs text-muted-foreground text-center mt-2">
        📊 Historical price chart (simulated data for demo)
      </p>
    </div>
  );
}
