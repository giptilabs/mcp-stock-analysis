// src/index.ts — MCP Server for Stock Analysis using yfinance (built for dist/ publishing)

import { spawn } from "child_process";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  CallToolRequest,
  CallToolResult,
  Tool
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

function runPythonScript(args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const proc = spawn("python3", ["fetch.py", ...args]);
    let output = "";
    let error = "";

    proc.stdout.on("data", (data) => (output += data));
    proc.stderr.on("data", (data) => (error += data));

    proc.on("close", (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch (err) {
          reject(`JSON parse error: ${err}`);
        }
      } else {
        reject(`Python error: ${error}`);
      }
    });
  });
}

const getStockQuoteTool: Tool = {
  name: "getStockQuote",
  description: "Get the current price of an Indian stock",
  inputSchema: {
    type: "object",
    properties: {
      symbol: { type: "string" }
    },
    required: ["symbol"]
  },
  outputSchema: {
    type: "object",
    properties: {
      symbol: { type: "string" },
      price: { type: "number" },
      name: { type: "string" }
    },
    required: ["symbol", "price", "name"]
  }
};

const getHistoricalDataTool: Tool = {
  name: "getHistoricalData",
  description: "Fetch historical stock prices",
  inputSchema: {
    type: "object",
    properties: {
      symbol: { type: "string" },
      period: { type: "string", default: "1mo" },
      interval: { type: "string", default: "1d" }
    },
    required: ["symbol"]
  },
  outputSchema: {
    type: "array",
    items: {
      type: "object",
      properties: {
        date: { type: "string" },
        open: { type: "number" },
        high: { type: "number" },
        low: { type: "number" },
        close: { type: "number" },
        volume: { type: "number" }
      },
      required: ["date", "open", "high", "low", "close", "volume"]
    }
  }
};

const server = new Server(
  {
    name: "mcp-stock-analysis",
    version: "0.1.0",
    description: "A stock analysis tool that provides real-time and historical stock data",
    author: "Gipti Labs",
    capabilities: {
      tools: {
        getStockQuote: {
          description: "Get the current price of an Indian stock",
          parameters: {
            symbol: {
              type: "string",
              description: "The stock symbol (e.g., RELIANCE.NS for Reliance Industries)"
            }
          }
        },
        getHistoricalData: {
          description: "Fetch historical stock prices",
          parameters: {
            symbol: {
              type: "string",
              description: "The stock symbol (e.g., RELIANCE.NS for Reliance Industries)"
            },
            period: {
              type: "string",
              description: "Time period (e.g., 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)",
              default: "1mo"
            },
            interval: {
              type: "string",
              description: "Data interval (e.g., 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)",
              default: "1d"
            }
          }
        }
      }
    }
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [getStockQuoteTool, getHistoricalDataTool],
}));

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest): Promise<CallToolResult> => {
  const { name, arguments: args } = request.params;

  if (name === "getStockQuote") {
    try {
      const input = args as { symbol: string };
      const result = await runPythonScript(["quote", input.symbol]);
      return {
        content: [{ type: "text", text: JSON.stringify(result) }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true
      };
    }
  } else if (name === "getHistoricalData") {
    try {
      const input = args as { symbol: string; period?: string; interval?: string };
      const period = input.period || "1mo";
      const interval = input.interval || "1d";
      const result = await runPythonScript(["history", input.symbol, period, interval]);
      return {
        content: [{ type: "text", text: JSON.stringify(result) }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true
      };
    }
  } else {
    return {
      content: [{ type: "text", text: "Unknown tool" }],
      isError: true
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("✅ MCP Server started and ready for requests...");
