import { describe, expect, it } from "vitest";

describe("Alpha Vantage Stock API", () => {
  it("should validate API key and fetch stock data", async () => {
    const apiKey = process.env.VITE_ALPHA_VANTAGE_API_KEY;
    
    if (!apiKey) {
      throw new Error("VITE_ALPHA_VANTAGE_API_KEY is not set");
    }

    // Test with a simple API call to Alpha Vantage
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${apiKey}`
    );

    expect(response.ok).toBe(true);
    
    const data = await response.json();
    
    // Check if the response contains expected fields
    expect(data).toHaveProperty("Global Quote");
    expect(data["Global Quote"]).toHaveProperty("05. price");
    expect(data["Global Quote"]).toHaveProperty("09. change");
    expect(data["Global Quote"]).toHaveProperty("10. change percent");
  });
});
