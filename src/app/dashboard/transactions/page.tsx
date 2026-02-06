"use client";
import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { createClient } from '@/lib/supabase';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Download, Loader2, ChevronDown } from 'lucide-react';
import { TransactionReceipt } from '@/components/dashboard/TransactionReceipt';

const ITEMS_PER_PAGE = 20; // Fetch 20 at a time for smoother loading

export default function TransactionsPage() {
  const { theme } = useTheme();
  const supabase = createClient();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [filter, setFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState<any>(null);
  
  // PAGINATION STATE
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 1. RESET WHEN FILTER CHANGES
  useEffect(() => {
    setTransactions([]);
    setPage(0);
    setHasMore(true);
    setLoading(true);
    fetchTx(0, filter, true); // Fetch Page 0 immediately
  }, [filter]);

  // 2. FETCH FUNCTION
  const fetchTx = async (pageIndex: number, currentFilter: string, isReset: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Calculate Range (e.g., 0-19, 20-39)
    const from = pageIndex * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to); // ✅ PAGINATION MAGIC

    if (currentFilter === 'withdrawal') {
        query = query.neq('type', 'deposit'); 
    } else if (currentFilter !== 'all') {
        query = query.eq('type', currentFilter);
    }
    
    const { data } = await query;
    const newTxs = data || [];

    // If we got fewer items than requested, we reached the end
    if (newTxs.length < ITEMS_PER_PAGE) {
        setHasMore(false);
    }

    if (isReset) {
        setTransactions(newTxs);
        setLoading(false);
    } else {
        setTransactions(prev => [...prev, ...newTxs]); // Append to list
        setLoadingMore(false);
    }
  };

  // 3. HANDLER: LOAD MORE
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchTx(nextPage, filter, false);
  };

  const isDark = theme === 'dark';

  return (
    <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      
      {selectedTx && (
        <TransactionReceipt tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>View and export your financial history.</p>
        </div>
        <div className="flex gap-2">
          <button className={`p-2.5 rounded-xl border flex items-center gap-2 text-sm font-bold ${isDark ? 'bg-zinc-900 border-white/10 text-zinc-300' : 'bg-white border-slate-200 text-slate-600'}`}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'deposit', 'withdrawal', 'swap'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all ${filter === f ? 'bg-emerald-500 text-black' : (isDark ? 'bg-zinc-900 text-zinc-500 hover:text-white' : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200')}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={`border rounded-2xl overflow-hidden mb-6 ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
            <thead className={`text-xs uppercase font-bold ${isDark ? 'bg-white/5 text-zinc-500' : 'bg-slate-50 text-slate-500'}`}>
                <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Status</th>
                </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500 mb-2" />Loading history...</td></tr>
                ) : transactions.length > 0 ? transactions.map((tx) => (
                <tr 
                    key={tx.id} 
                    onClick={() => setSelectedTx(tx)}
                    className={`cursor-pointer transition-colors ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50'}`}
                >
                    <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : (tx.type === 'swap' ? 'bg-purple-500/10 text-purple-500' : 'bg-zinc-500/10 text-zinc-500')}`}>
                        {tx.type === 'deposit' ? <ArrowDownLeft size={14} /> : (tx.type === 'swap' ? <RefreshCw size={14} /> : <ArrowUpRight size={14} />)}
                        </div>
                        <span className={`font-bold text-sm capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>{tx.type}</span>
                    </div>
                    </td>
                    <td className="px-6 py-4"><span className="font-mono text-xs text-zinc-500">{tx.id.slice(0, 8)}...</span></td>
                    
                    <td className={`px-6 py-4 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {formatSmartDate(tx.created_at)}
                    </td>

                    <td className={`px-6 py-4 text-sm font-mono font-bold ${tx.type === 'deposit' ? 'text-emerald-500' : (isDark ? 'text-white' : 'text-slate-900')}`}>
                        {tx.type === 'deposit' ? '+' : '-'}{Math.abs(tx.amount)} <span className="text-xs text-zinc-500">{tx.currency}</span>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded capitalize ${
                            tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                            tx.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                            {tx.status}
                        </span>
                    </td>
                </tr>
                )) : (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500 text-sm">No transactions found.</td></tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* --- LOAD MORE BUTTON --- */}
      {transactions.length > 0 && hasMore && (
        <div className="flex justify-center mb-8">
            <button 
                onClick={handleLoadMore} 
                disabled={loadingMore}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all active:scale-95 ${
                    isDark 
                    ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
                {loadingMore ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
                {loadingMore ? 'Loading...' : 'Load More'}
            </button>
        </div>
      )}

    </div>
  );
}

function formatSmartDate(dateString: string): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  
  const d = new Date(date); d.setHours(0,0,0,0);
  const n = new Date(now); n.setHours(0,0,0,0);
  
  const diffTime = n.getTime() - d.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  if (diffDays < 7) return `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${timeStr}`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}