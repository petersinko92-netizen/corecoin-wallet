"use client";
import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Search, Star, Loader2, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

interface Coin {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
}

const BACKUP_COINS: Coin[] = [
  { id: 'bitcoin', rank: '1', symbol: 'BTC', name: 'Bitcoin', priceUsd: '64230.50', changePercent24Hr: '2.4', marketCapUsd: '1200000000000', volumeUsd24Hr: '35000000000' },
  { id: 'ethereum', rank: '2', symbol: 'ETH', name: 'Ethereum', priceUsd: '3450.12', changePercent24Hr: '-1.1', marketCapUsd: '400000000000', volumeUsd24Hr: '15000000000' },
  { id: 'solana', rank: '3', symbol: 'SOL', name: 'Solana', priceUsd: '145.40', changePercent24Hr: '5.7', marketCapUsd: '65000000000', volumeUsd24Hr: '4000000000' },
  { id: 'tether', rank: '4', symbol: 'USDT', name: 'Tether', priceUsd: '1.00', changePercent24Hr: '0.01', marketCapUsd: '103000000000', volumeUsd24Hr: '45000000000' },
  { id: 'bnb', rank: '5', symbol: 'BNB', name: 'BNB', priceUsd: '590.20', changePercent24Hr: '-0.5', marketCapUsd: '87000000000', volumeUsd24Hr: '1200000000' },
];

export default function MarketsPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingBackup, setUsingBackup] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coincap.io/v2/assets?limit=20');
        if (!res.ok) throw new Error("API Error");
        const data = await res.json();
        setCoins(data.data);
        setUsingBackup(false);
        setLoading(false);
      } catch (error) {
        setCoins(BACKUP_COINS);
        setUsingBackup(true);
        setLoading(false);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredCoins = coins.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const topGainer = coins.length > 0 ? [...coins].sort((a, b) => parseFloat(b.changePercent24Hr) - parseFloat(a.changePercent24Hr))[0] : BACKUP_COINS[2];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      <Navbar />
      
      {/* Reduced padding on mobile (pt-24) vs desktop (pt-32) */}
      <main className="pt-24 md:pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        
        {/* Header: Stacked on mobile, Row on desktop */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 md:mb-12 gap-6">
           <div className="w-full">
             <h1 className="text-3xl md:text-5xl font-black mb-3 md:mb-4">Live Markets</h1>
             <p className="text-zinc-400 text-sm md:text-base flex flex-wrap items-center gap-2">
               Real-time global prices.
               {usingBackup && (
                 <span className="text-xs text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                   <AlertCircle size={10} /> Data Offline
                 </span>
               )}
             </p>
           </div>
           
           {/* Search: Full width on mobile */}
           <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Search Coin" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 bg-zinc-900/50 border border-white/10 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-white"
              />
           </div>
        </div>

        {/* Highlight Cards: Grid 1 on Mobile, Grid 3 on Desktop */}
        {!loading && coins.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
             <HighlightCard label="Market Leader" coin={coins[0].name} symbol={coins[0].symbol} price={formatPrice(coins[0].priceUsd)} change={coins[0].changePercent24Hr} />
             <HighlightCard label="Top Gainer" coin={topGainer.name} symbol={topGainer.symbol} price={formatPrice(topGainer.priceUsd)} change={topGainer.changePercent24Hr} />
             <HighlightCard label="Trending" coin={coins[2].name} symbol={coins[2].symbol} price={formatPrice(coins[2].priceUsd)} change={coins[2].changePercent24Hr} />
          </div>
        )}

        {/* Responsive Table Wrapper */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden min-h-[400px]">
           {loading ? (
             <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
             </div>
           ) : (
             <div className="overflow-x-auto -mx-4 md:mx-0"> {/* Negative margin on mobile to let it bleed to edges */}
               <div className="inline-block min-w-full align-middle px-4 md:px-0">
                 <table className="min-w-full text-left">
                   <thead className="bg-white/5 text-xs uppercase text-zinc-500 font-bold border-b border-white/5">
                     <tr>
                       <th className="p-4 md:p-6">Name</th>
                       <th className="p-4 md:p-6 text-right">Price</th>
                       {/* Hide '24h Change' text on very small screens if needed, but usually fits */}
                       <th className="p-4 md:p-6 text-right whitespace-nowrap">24h Change</th>
                       <th className="p-6 text-right hidden lg:table-cell">Market Cap</th>
                       <th className="p-6 text-right hidden lg:table-cell">Volume</th>
                       <th className="p-6 text-center hidden md:table-cell">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {filteredCoins.map((coin) => {
                       const changeNum = parseFloat(coin.changePercent24Hr);
                       const isPositive = changeNum >= 0;
                       
                       return (
                         <tr key={coin.id} className="hover:bg-white/5 transition-colors group">
                           <td className="p-4 md:p-6 flex items-center gap-3 md:gap-4">
                             <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-zinc-400 border border-white/5 shrink-0">
                               {coin.symbol[0]}
                             </div>
                             <div>
                               <div className="font-bold text-white text-sm md:text-base">{coin.name}</div>
                               <div className="text-xs text-zinc-500">{coin.symbol}</div>
                             </div>
                           </td>
                           <td className="p-4 md:p-6 text-right font-mono font-medium text-zinc-200 text-sm md:text-base">
                              {formatPrice(coin.priceUsd)}
                           </td>
                           <td className={`p-4 md:p-6 text-right font-bold text-sm`}>
                             <div className={`flex justify-end items-center gap-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                               {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                               {Math.abs(changeNum).toFixed(2)}%
                             </div>
                           </td>
                           <td className="p-6 text-right text-zinc-400 text-sm hidden lg:table-cell">
                              {formatCompactNumber(coin.marketCapUsd)}
                           </td>
                           <td className="p-6 text-right text-zinc-400 text-sm hidden lg:table-cell">
                              {formatCompactNumber(coin.volumeUsd24Hr)}
                           </td>
                           <td className="p-6 text-center hidden md:table-cell">
                             <button className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black rounded-lg text-xs font-bold transition-all">
                               Trade
                             </button>
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
             </div>
           )}
        </div>

      </main>
      <Footer />
    </div>
  );
}

function HighlightCard({ label, coin, symbol, price, change }: any) {
  const changeNum = parseFloat(change);
  const isPositive = changeNum >= 0;
  return (
    <div className="p-5 md:p-6 bg-zinc-900/30 border border-white/5 rounded-2xl hover:border-emerald-500/20 transition-colors">
      <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">{label}</div>
      <div className="flex justify-between items-end">
        <div>
          <div className="text-lg md:text-xl font-bold text-white">{coin}</div>
          <div className="text-xs text-zinc-500">{symbol}</div>
        </div>
        <div className="text-right">
          <div className="text-base md:text-lg font-bold text-white">{price}</div>
          <div className={`text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{changeNum.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function formatPrice(price: string) {
  const num = parseFloat(price);
  if (isNaN(num)) return '$0.00';
  const maximumFractionDigits = num < 1 ? 4 : 2;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits }).format(num);
}

function formatCompactNumber(number: string) {
  const num = parseFloat(number);
  if (isNaN(num)) return '$0';
  return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1, style: 'currency', currency: 'USD' }).format(num);
}