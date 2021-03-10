import _ from "lodash";
import { useEffect, useState } from "react";

const orders = [
  { type: "SELL", price: 51.505, shares: 5 },
  { type: "SELL", price: 79.9, shares: 3 },
  { type: "SELL", price: 108, shares: 4 },
  { type: "BUY", price: 80, shares: 3 },
  { type: "BUY", price: 80.4999, shares: 1 },
  { type: "BUY", price: 97.56, shares: 3 },
  { type: "BUY", price: 144, shares: 1 },
  { type: "BUY", price: 148, shares: 3 },
  { type: "BUY", price: 223, shares: 2 },
  { type: "BUY", price: 224, shares: 1 },
  { type: "BUY", price: 293, shares: 7 },
];

const USD_NOK = 8.57;

const url = "wss://finnhub.io/ws";
const tickers = ["GME.US"];

export default function App() {
  const [state, setState] = useState({});

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      for (const ticker of tickers) {
        ws.send(
          JSON.stringify({
            type: 50,
            ticker,
          })
        );
      }
    };

    ws.onmessage = (ev) => {
      const { content } = JSON.parse(ev.data);
      setState((state) => ({ ...state, ...content }));
    };

    return () => ws.close();
  }, []);

  // const { displayName, prevClose, price } = state;
  const { price } = state;

  if (!price) {
    return "No price data available.";
  }

  const buyOrders = orders.filter((x) => x.type === "BUY");
  const sellOrders = orders.filter((x) => x.type === "SELL");

  const valueInMarket =
    _.sum(buyOrders.map((x) => x.price * x.shares)) -
    _.sum(sellOrders.map((x) => x.price * x.shares));

  const sharesInMarket =
    _.sum(buyOrders.map((x) => x.shares)) -
    _.sum(sellOrders.map((x) => x.shares));

  const minSellPrice = valueInMarket / sharesInMarket;
  const revenue = (price - minSellPrice) * sharesInMarket;

  document.title = `$${price.toFixed(2)} | ${(revenue * USD_NOK).toFixed(
    2
  )} NOK `;

  return (
    <>
      <h1>{revenue}</h1>
    </>
  );
}
