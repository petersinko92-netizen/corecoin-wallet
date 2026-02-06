"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Check, X, Clock, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTransactionsPage() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('processing'); // Default to showing pending tasks

  // 1. FETCH TRANSACTIONS (Real-time)
  useEffect(() => {
    fetchTransactions();

    // Listen for new user submissions instantly
    const channel = supabase
      .channel('admin_tx_view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    let query = supabase
      .from('transactions')
      .select('*, profiles:user_id(email, full_name)') // Assuming you have a profiles table, or just use user_id
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;
    if (data) setTransactions(data);
    setLoading(false);
  };

  // 2. ADMIN ACTIONS
  const handleStatusUpdate = async (txId: string, newStatus: 'completed' | 'failed') => {
    // Optimistic UI update (makes it feel instant)
    setTransactions(prev => prev.filter(tx => tx.id !== txId));
    
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', txId);

      if (error) throw error;
      
      toast.success(`Transaction marked as ${newStatus}`);
      
      // IF REJECTED/FAILED: Refund the balance?
      // Note: We already deducted balance when they sent. 
      // If you reject, you MUST refund them.
      if (newStatus === 'failed') {
         const tx = transactions.find(t => t.id === txId);
         if (tx) await refundUser(tx);
      }

    } catch (err) {
      toast.error("Update failed");
      fetchTransactions(); // Revert on error
    }
  };

  const refundUser = async (tx: any) => {
     // Determine column based on asset
     const asset = tx.currency;
     const col = asset === 'BTC' ? 'btc_balance' : 
                 asset === 'USDT' ? 'usdt_balance' : 'balance';
     
// 1. Get current balance
    const { data: w } = await supabase
      .from('wallets')
      .select(col)
      .eq('user_id', tx.user_id)
      .single();

    // ✅ FIX: Cast 'w' to 'any' to allow dynamic indexing with [col]
    const current = w ? (w as any)[col] || 0 : 0;

    // 2. Add back (Amount is stored as negative for sends)
    const refundAmount = Math.abs(tx.amount); 
     
    await supabase.from('wallets').update({
       [col]: current + refundAmount 
    }).eq('user_id', tx.user_id);
     
    toast.info("User has been automatically refunded.");
  return (
    <div className="p-8 bg-zinc-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-black text-slate-900">Transaction Operations</h1>
           <p className="text-zinc-500 text-sm">Manage user withdrawals and deposits</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg border">
           <FilterBtn label="Pending" active={filter === 'processing'} onClick={() => setFilter('processing')} />
           <FilterBtn label="All History" active={filter === 'all'} onClick={() => setFilter('all')} />
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="p-4 font-bold text-zinc-500">Time</th>
              <th className="p-4 font-bold text-zinc-500">User</th>
              <th className="p-4 font-bold text-zinc-500">Asset</th>
              <th className="p-4 font-bold text-zinc-500">Amount</th>
              <th className="p-4 font-bold text-zinc-500">Network Info</th>
              <th className="p-4 font-bold text-zinc-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="p-4 text-zinc-500 font-mono text-xs">
                   {new Date(tx.created_at).toLocaleString()}
                </td>
                <td className="p-4 font-medium">
                   {/* Fallback if no profile relation yet */}
                   {tx.profiles?.email || tx.user_id.slice(0, 8) + '...'}
                </td>
                <td className="p-4 font-bold">
                   <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${tx.status === 'processing' ? 'bg-yellow-500 animate-pulse' : tx.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {tx.currency}
                   </div>
                </td>
                <td className="p-4 font-black font-mono text-base">
                   {Math.abs(tx.amount)}
                </td>
                <td className="p-4">
                   <div className="text-xs text-zinc-500">
                      <div className="font-bold text-slate-700">{tx.metadata?.network || 'N/A'}</div>
                      <div className="font-mono truncate w-32">{tx.metadata?.to_address}</div>
                   </div>
                </td>
                <td className="p-4 text-right">
                  {tx.status === 'processing' ? (
                     <div className="flex justify-end gap-2">
                        <button 
                           onClick={() => handleStatusUpdate(tx.id, 'failed')}
                           className="p-2 hover:bg-red-50 text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-all"
                           title="Reject & Refund"
                        >
                           <X size={18} />
                        </button>
                        <button 
                           onClick={() => handleStatusUpdate(tx.id, 'completed')}
                           className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95"
                        >
                           <Check size={16} /> Approve
                        </button>
                     </div>
                  ) : (
                     <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${tx.status === 'completed' ? 'bg-zinc-100 text-zinc-500' : 'bg-red-50 text-red-500'}`}>
                        {tx.status}
                     </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {transactions.length === 0 && !loading && (
           <div className="p-12 text-center text-zinc-400">
              No transactions found in this filter.
           </div>
        )}
      </div>
    </div>
  );
}

function FilterBtn({ label, active, onClick }: any) {
   return (
      <button 
         onClick={onClick}
         className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${active ? 'bg-slate-900 text-white' : 'hover:bg-zinc-50 text-zinc-500'}`}
      >
         {label}
      </button>
   )
}