"use client";
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const COINS = [
  { name: 'Bitcoin', symbol: 'BTC', price: '$84,210.50', change: '+2.4%', up: true },
  { name: 'Ethereum', symbol: 'ETH', price: '$2,840.12', change: '-1.1%', up: false },
  { name: 'Solana', symbol: 'SOL', price: '$118.40', change: '+5.7%', up: true },
  { name: 'Tether', symbol: 'USDT', price: '$1.00', change: '+0.0%', up: true },
  { name: 'Binance', symbol: 'BNB', price: '$412.30', change: '-0.5%', up: false },
  { name: 'Cardano', symbol: 'ADA', price: '$0.55', change: '+1.2%', up: true },
  { name: 'Ripple', symbol: 'XRP', price: '$0.62', change: '-2.3%', up: false },
];

export function MarketTicker() {
  return (
    <div className="w-full bg-[#080808] border-y border-white/5 overflow-hidden py-4">
      <div className="flex animate-scroll whitespace-nowrap hover:pause">
        {/* Double the list to create seamless infinite scroll */}
        {[...COINS, ...COINS, ...COINS].map((coin, i) => (
          <div key={i} className="inline-flex items-center gap-3 mx-8 md:mx-12 group cursor-pointer">
            <span className="font-bold text-zinc-400 text-sm">{coin.symbol}</span>
            <span className="font-bold text-white text-sm">{coin.price}</span>
            <span className={`text-xs font-bold flex items-center ${coin.up ? 'text-emerald-500' : 'text-red-500'}`}>
              {coin.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {coin.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}