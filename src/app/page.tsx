"use client";

/**
 * Trading Dashboard
 * UI Layer
 * 
 * Purpose: Main trading interface
 * 
 * Features:
 * - Trade analysis form
 * - Analysis results display
 * - Open positions table
 * - Manual trade execution
 */

import { useState, useEffect } from "react";

type TradeSide = "LONG" | "SHORT";

interface TradeForm {
  symbol: string;
  side: TradeSide;
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  accountBalance: string;
  riskPercent: string;
  leverage: string;
}

interface TradeAnalysis {
  positionSize: number;
  riskAmount: number;
  rewardAmount: number;
  riskRewardRatio: number;
  liquidationPrice: number | null;
  isValid: boolean;
  warnings: string[];
}

interface OpenTrade {
  id: string;
  symbol: string;
  side: TradeSide;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  currentPrice?: number;
  unrealizedPnL?: number;
  riskAmount: number;
  rewardAmount: number;
  createdAt: string;
}

export default function Dashboard() {
  const [form, setForm] = useState<TradeForm>({
    symbol: "BTCUSDT",
    side: "LONG",
    entryPrice: "50000",
    stopLoss: "49000",
    takeProfit: "52000",
    accountBalance: "10000",
    riskPercent: "2",
    leverage: "10",
  });

  const [analysis, setAnalysis] = useState<TradeAnalysis | null>(null);
  const [openTrades, setOpenTrades] = useState<OpenTrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch open trades on mount and every 10 seconds
  useEffect(() => {
    fetchOpenTrades();
    const interval = setInterval(fetchOpenTrades, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOpenTrades = async () => {
    try {
      const response = await fetch("/api/trade/list");
      const data = await response.json();
      if (data.success) {
        setOpenTrades(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch trades:", err);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/trade/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: form.symbol,
          side: form.side,
          entryPrice: parseFloat(form.entryPrice),
          stopLoss: parseFloat(form.stopLoss),
          takeProfit: parseFloat(form.takeProfit),
          accountBalance: parseFloat(form.accountBalance),
          riskPercent: parseFloat(form.riskPercent),
          leverage: parseInt(form.leverage),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.data);
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (err) {
      setError("Failed to analyze trade");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/trade/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: form.symbol,
          side: form.side,
          entryPrice: parseFloat(form.entryPrice),
          stopLoss: parseFloat(form.stopLoss),
          takeProfit: parseFloat(form.takeProfit),
          accountBalance: parseFloat(form.accountBalance),
          riskPercent: parseFloat(form.riskPercent),
          leverage: parseInt(form.leverage),
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Trade opened successfully! ID: ${data.data.id}`);
        setAnalysis(null);
        fetchOpenTrades();
      } else {
        setError(data.error || "Failed to open trade");
      }
    } catch (err) {
      setError("Failed to open trade");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTrade = async (tradeId: string) => {
    if (!confirm("Are you sure you want to close this trade?")) return;

    try {
      const response = await fetch("/api/trade/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeId }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Trade closed! PnL: $${data.data.netPnL?.toFixed(2)}`);
        fetchOpenTrades();
      } else {
        alert(`Failed to close trade: ${data.error}`);
      }
    } catch (err) {
      alert("Failed to close trade");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          TradeGuard V2 - Trading Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trade Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">New Trade</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symbol
                </label>
                <input
                  type="text"
                  value={form.symbol}
                  onChange={(e) =>
                    setForm({ ...form, symbol: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Side
                </label>
                <select
                  value={form.side}
                  onChange={(e) =>
                    setForm({ ...form, side: e.target.value as TradeSide })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="LONG">LONG</option>
                  <option value="SHORT">SHORT</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entry Price
                  </label>
                  <input
                    type="number"
                    value={form.entryPrice}
                    onChange={(e) =>
                      setForm({ ...form, entryPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stop Loss
                  </label>
                  <input
                    type="number"
                    value={form.stopLoss}
                    onChange={(e) =>
                      setForm({ ...form, stopLoss: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Take Profit
                </label>
                <input
                  type="number"
                  value={form.takeProfit}
                  onChange={(e) =>
                    setForm({ ...form, takeProfit: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Balance
                  </label>
                  <input
                    type="number"
                    value={form.accountBalance}
                    onChange={(e) =>
                      setForm({ ...form, accountBalance: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk %
                  </label>
                  <input
                    type="number"
                    value={form.riskPercent}
                    onChange={(e) =>
                      setForm({ ...form, riskPercent: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leverage
                  </label>
                  <input
                    type="number"
                    value={form.leverage}
                    onChange={(e) =>
                      setForm({ ...form, leverage: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? "Analyzing..." : "Analyze"}
                </button>

                <button
                  onClick={handleOpenTrade}
                  disabled={loading || !analysis?.isValid}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? "Opening..." : "Open Trade"}
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Display */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Analysis</h2>

            {analysis ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-md ${
                    analysis.isValid
                      ? "bg-green-100 border border-green-300"
                      : "bg-red-100 border border-red-300"
                  }`}
                >
                  <p className="font-semibold">
                    {analysis.isValid ? "✓ Valid Trade" : "✗ Invalid Trade"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Position Size</p>
                    <p className="text-xl font-semibold">
                      {analysis.positionSize.toFixed(4)}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Risk Amount</p>
                    <p className="text-xl font-semibold text-red-600">
                      ${analysis.riskAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Reward Amount</p>
                    <p className="text-xl font-semibold text-green-600">
                      ${analysis.rewardAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">R:R Ratio</p>
                    <p className="text-xl font-semibold">
                      {analysis.riskRewardRatio.toFixed(2)}
                    </p>
                  </div>
                </div>

                {analysis.liquidationPrice && (
                  <div className="p-3 bg-yellow-50 border border-yellow-300 rounded">
                    <p className="text-sm text-gray-600">Liquidation Price</p>
                    <p className="text-xl font-semibold text-yellow-700">
                      ${analysis.liquidationPrice.toFixed(2)}
                    </p>
                  </div>
                )}

                {analysis.warnings.length > 0 && (
                  <div className="p-3 bg-yellow-100 border border-yellow-300 rounded">
                    <p className="font-semibold mb-2">Warnings:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.warnings.map((warning, i) => (
                        <li key={i} className="text-sm text-yellow-800">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">
                Click "Analyze" to calculate risk metrics
              </p>
            )}
          </div>
        </div>

        {/* Open Positions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Open Positions ({openTrades.length})
          </h2>

          {openTrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Symbol
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Side
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Entry
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Current
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      SL / TP
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      PnL
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {openTrades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">
                        {trade.symbol}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            trade.side === "LONG"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {trade.side}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        ${trade.entryPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {trade.currentPrice
                          ? `$${trade.currentPrice.toFixed(2)}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        ${trade.stopLoss.toFixed(2)} / $
                        {trade.takeProfit.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {trade.unrealizedPnL !== undefined ? (
                          <span
                            className={`font-semibold ${
                              trade.unrealizedPnL >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            ${trade.unrealizedPnL.toFixed(2)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleCloseTrade(trade.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No open trades</p>
          )}
        </div>
      </div>
    </div>
  );
}
