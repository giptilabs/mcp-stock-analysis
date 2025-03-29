import sys
import yfinance as yf
import json

mode = sys.argv[1]
symbol = sys.argv[2]

if mode == "quote":
    stock = yf.Ticker(symbol)
    info = stock.info
    result = {
        "symbol": symbol,
        "price": float(info.get("currentPrice") or info.get("regularMarketPrice")),
        "name": info.get("shortName")
    }
    print(json.dumps(result))

elif mode == "history":
    period = sys.argv[3]
    interval = sys.argv[4]
    stock = yf.Ticker(symbol)
    hist = stock.history(period=period, interval=interval).reset_index()
    result = []
    for _, row in hist.iterrows():
        result.append({
            "date": row["Date"].isoformat(),
            "open": float(row["Open"]),
            "high": float(row["High"]),
            "low": float(row["Low"]),
            "close": float(row["Close"]),
            "volume": int(row["Volume"])
        })
    print(json.dumps(result))