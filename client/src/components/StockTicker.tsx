import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Stock {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function StockTicker() {
  const [stocks, setStocks] = useState<Stock[]>([
    { symbol: "TSLA", price: 245.67, change: 5.23, changePercent: 2.18 },
    { symbol: "AAPL", price: 189.45, change: -2.15, changePercent: -1.12 },
    { symbol: "AMD", price: 156.78, change: 8.92, changePercent: 6.03 },
    { symbol: "GOOG", price: 142.89, change: 3.45, changePercent: 2.47 },
    { symbol: "META", price: 498.23, change: -12.34, changePercent: -2.42 },
    { symbol: "MSFT", price: 378.91, change: 6.78, changePercent: 1.82 },
  ]);

  useEffect(() => {
    // Simulate price updates every 5 seconds
    const interval = setInterval(() => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          const randomChange = (Math.random() - 0.5) * 10;
          const newPrice = Math.max(stock.price + randomChange, 1);
          const change = newPrice - stock.price;
          const changePercent = (change / stock.price) * 100;

          return {
            ...stock,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-border/30 rounded-lg p-6 mb-8">
      <h3 className="font-display text-2xl font-bold mb-6 text-foreground">
        ราคาหุ้นสดใจ
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            className="bg-white rounded-lg p-4 border border-border/20 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-lg text-foreground">
                {stock.symbol}
              </span>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  stock.change >= 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {stock.change >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                <span className="text-sm font-semibold">
                  {stock.changePercent > 0 ? "+" : ""}
                  {stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">
                ${stock.price.toFixed(2)}
              </p>
              <p
                className={`text-sm ${
                  stock.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stock.change > 0 ? "+" : ""}
                {stock.change.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        * ข้อมูลราคาหุ้นนี้เป็นข้อมูลจำลองเพื่อการสาธิต
      </p>
    </div>
  );
}
