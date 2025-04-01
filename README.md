# MCP Stock Analysis Server by Akshay Bavkar

This is an MCP server that provides access to real-time and historical Indian stock data using the Yahoo Finance API. It allows stock data retrieval to be used as context by local LLMs via Claude Desktop, Cursor, and other MCP-compatible agents.

## Available Features

- **getStockQuote**: Get the current quote for an Indian stock.
- **getHistoricalData**: Get historical data for an Indian stock with custom intervals and periods.
---

## Setup

```bash
npm install mcp-stock-analysis
```

## Usage in Host
Configure your MCP client (e.g., Claude Desktop) to connect to the server:

```JSON
{
  "mcpServers": {
    "mcp-stock-analysis": {
      "command": "npx",
      "args": ["-y", "mcp-stock-analysis"],
    }
  }
}
```

## Tools
### `getStockQuote`
Get the current quote for a stock.

Input:

`symbol`: The stock symbol (e.g., RELIANCE.NS)

Output:
```JSON
{
  "symbol": "RELIANCE.NS",
  "price": 2748.15,
  "name": "Reliance Industries Ltd"
}
```

### `getHistoricalData`
Get historical data for a stock.

Input:

- `symbol`: the stock symbol (e.g., RELIANCE.NS)
- `interval`: the time interval for the data (`daily`, `weekly`, or `monthly`) (optional, default: `daily`)

Output:
```JSON
{
    "date": "2025-03-21T00:00:00+05:30",
    "open": 2735,
    "high": 2750,
    "low": 2725,
    "close": 2748.15,
    "volume": 21780769
}
```

JSON object containing the historical data. The structure of the output depends on the interval parameter.

## Contributing
Contributions are welcome! Please open an issue or pull request.


### License
MIT
