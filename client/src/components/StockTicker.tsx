import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface Stock {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function StockTicker() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const symbols = ["TSLA", "AAPL", "AMD", "GOOG", "META", "MSFT"];
  const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

  const fetchStockData = async () => {
    try {
      setError(null);
      const stockData: Stock[] = [];

      for (const symbol of symbols) {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch ${symbol}`);
        }

        const data = await response.json();

        if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
          const quote = data["Global Quote"];
          const price = parseFloat(quote["05. price"]);
          const change = parseFloat(quote["09. change"]);
          const changePercent = parseFloat(quote["10. change percent"]);

          stockData.push({
            symbol,
            price,
            change,
            changePercent,
          });
        }
      }

      setStocks(stockData);
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch stock data"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();

    // Refresh data every 60 seconds (Alpha Vantage free tier has rate limits)
    const interval = setInterval(fetchStockData, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-border/30 rounded-lg p-6 mb-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="animate-spin text-foreground mr-2" />
        <span className="text-foreground">กำลังโหลดข้อมูลราคาหุ้น...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6 mb-8">
        <p className="text-red-600">เกิดข้อผิดพลาด: {error}</p>
        <button
          onClick={fetchStockData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

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
        * ข้อมูลราคาหุ้นจากแหล่ง Alpha Vantage (อัปเดตทุก 60 วินาที)
      </p>
    </div>
  );
}
