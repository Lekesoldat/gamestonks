import _ from "lodash";
import { useEffect, useState } from "react";

const USD_NOK = 8.57;

const all_orders = [
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

const orders = [
  { buyPrice: 144, total: 1, sellPrice: null },
  /*{ buyPrice: 148, total: 3 },*/
  /*{ buyPrice: 223, total: 2 },*/
  { buyPrice: 224, total: 1, sellPrice: null },
  { buyPrice: 293, total: 7, sellPrice: null },
];

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
      console.log("MESSAGE");
      setState((state) => ({ ...state, ...content }));
    };

    return () => ws.close();
  }, []);

  const { displayName, prevClose, price } = state;

  if (!price) {
    return null;
  }

  const positive = price > prevClose;

  const moneySpent = _.sum(
    all_orders.filter((x) => x.type === "BUY").map((x) => x.price * x.shares)
  );

  const moneyReturned = _.sum(
    all_orders.filter((x) => x.type === "SELL").map((x) => x.price * x.shares)
  );

  const sharesInMarket = _.sum(
    all_orders.map((x) => (x.type === "BUY" ? x.shares : -x.shares))
  );

  const totalRevenue = moneyReturned - moneySpent;

  let priceToZero = null;
  if (totalRevenue < 0) {
    priceToZero = -(totalRevenue / sharesInMarket);
  }

  let opt = "";
  if (priceToZero > price) {
    opt = `If you sell now you have lost $${(
      totalRevenue +
      sharesInMarket * price
    ).toFixed(2)}. You need to sell at ${priceToZero.toFixed(2)} to hit 0.`;
  }

  if (priceToZero <= price) {
    opt = `If you sell now you have earned $${(
      totalRevenue +
      sharesInMarket * price
    ).toFixed(2)}`;
  }

  // document.title = `$${price.toFixed(2)} | ${(totalProfit * USD_NOK).toFixed(
  //   2
  // )} NOK `;

  return (
    <>
      <h1>
        {displayName}:{" "}
        <span style={{ color: positive ? "green" : "red" }}>
          ${price.toFixed(2)} {positive ? "😄" : "😔"}
        </span>
      </h1>
      <h1>{opt}</h1>
      {/* <Trade price={price} USD_NOK={USD_NOK} orders={orders} /> */}
      {/* 
      <h1>
        Total profit is{" "}
        <span style={{ color: totalProfit > 0 ? "green" : "red" }}>
          ${totalProfit}
        </span>{" "}
        which is{" "}
        <span style={{ color: totalProfit > 0 ? "green" : "red" }}>
          {(totalProfit * USD_NOK).toFixed(2)} NOK
        </span>
      </h1>
  */}{" "}
    </>
  );
}
