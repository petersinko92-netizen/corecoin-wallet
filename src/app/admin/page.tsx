"use client";
import React, { useEffect, useState } from 'react';
import { 
  Users, Search, TrendingUp, TrendingDown, 
  ShieldAlert, Wallet, Loader2, Save, ArrowRight, RefreshCw, Hash, 
  CheckCircle2, XCircle, Clock, LayoutList, Hourglass, X, Lock, Key, Copy, AlertTriangle, Fuel 
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase';

// 🔒 CREDENTIALS (Consider moving to env variables in production)
const ADMIN_USER = "admin";
const ADMIN_PASS = "core2026";

// --- 1. FUND MANAGER MODAL ---
function FundManager({ user, onClose, onSuccess }: any) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [currency, setCurrency] = useState('ETH'); // Default Asset
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'general' | 'danger'>('general'); 
  const [sweeping, setSweeping] = useState(false);
  
  // 🟢 Live Blockchain Sync State
  const [liveChainBalance, setLiveChainBalance] = useState<string>('...');
  const [syncing, setSyncing] = useState(false);
  
  const ASSETS = ['ETH', 'BTC', 'USDT', 'SOL', 'TRX'];

  const getCurrentBalance = () => {
      if (!user) return 0;
      switch(currency) {
          case 'ETH': return user.balance || 0;
          case 'BTC': return user.btc_balance || 0;
          case 'SOL': return user.sol_balance || 0;
          case 'TRX': return user.trx_balance || 0;
          case 'USDT': return user.usdt_balance || 0;
          default: return 0;
      }
  };

  // Auto-Sync Effect (Checks Real Blockchain Balance)
  useEffect(() => {
      const sync = async () => {
          if (!user.user_id) return;
          setSyncing(true);
          try {
              // We pass the asset so the backend knows what to check (if supported)
              // Currently likely defaults to ETH, but good for future-proofing
              const res = await fetch('/api/wallet/sync', {
                  method: 'POST',
                  body: JSON.stringify({ userId: user.user_id, asset: currency })
              });
              const data = await res.json();
              setLiveChainBalance(data.success ? data.chainBalance.toFixed(5) : '0.00000');
          } catch(e) { 
              setLiveChainBalance('Error'); 
          } finally { 
              setSyncing(false); 
          }
      };
      sync();
  }, [user.user_id, currency]); // Re-sync when currency changes

  const handleExecute = async () => {
    if (!amount || parseFloat(amount) <= 0) {
        toast.error("Enter a valid amount");
        return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: user.user_id, amount, type, currency })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Success: ${type === 'credit' ? 'Added' : 'Deducted'} ${amount} ${currency}`);
        onSuccess(); 
        onClose(); 
      } else {
        toast.error(data.error || "Operation failed");
      }
    } catch (e) { toast.error("Network connection error"); } finally { setLoading(false); }
  };

  const handleSweep = async () => {
    if (!confirm(`⚠️ SWEEP WARNING\n\nMoving ALL ${currency} from this user to Admin Wallet.\n\nAsset: ${currency}\n\nContinue?`)) return;
    
    setSweeping(true);
    try {
      // ✅ FIX: Sending 'asset' allows the backend to trigger Gas Station for USDT
      const res = await fetch('/api/admin/sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: user.user_id, asset: currency })
      });
      const data = await res.json();
      
      if (data.success) { 
          toast.success(`Sweep Successful! Tx: ${data.txHash?.slice(0,6)}...`);
          setLiveChainBalance("0.00000"); 
          onSuccess(); 
      } else { 
          toast.error(data.error || data.message || "Sweep Failed"); 
      }
    } catch (e) { toast.error("Network Error"); } finally { setSweeping(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0A0A0A] border-t md:border border-zinc-800 w-full md:max-w-md rounded-t-[32px] md:rounded-3xl p-6 shadow-2xl h-[90vh] md:h-auto flex flex-col">
        
        <div className="flex items-center justify-between mb-4">
          <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 {mode === 'danger' ? 'Advanced Controls' : 'Fund Manager'}
              </h3>
              <p className="text-zinc-500 text-xs font-mono mt-1">
                 {user.readable_id || user.user_id}
              </p>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors"><X size={20} className="text-zinc-400" /></button>
        </div>

        {/* ASSET SELECTOR (Moved to top so it works for BOTH modes) */}
        <div className="mb-6">
            <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-wider">Select Asset</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {ASSETS.map((asset) => (
                    <button key={asset} onClick={() => setCurrency(asset)} className={`px-4 py-2 border rounded-lg font-bold text-xs transition-all whitespace-nowrap min-w-[60px] ${currency === asset ? 'border-white bg-white/10 text-white' : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}>{asset}</button>
                ))}
            </div>
        </div>

        <div className="flex p-1 bg-zinc-900 rounded-xl mb-6 shrink-0">
           <button onClick={() => setMode('general')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === 'general' ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}>DB Adjustment</button>
           <button onClick={() => setMode('danger')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === 'danger' ? 'bg-red-500/10 text-red-500 shadow-sm border border-red-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}>Sweep Funds</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
          {mode === 'general' ? (
              <>
                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setType('credit')} className={`py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all border ${type === 'credit' ? 'bg-white text-black border-white' : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}><TrendingUp size={16} /> Credit (+)</button>
                    <button onClick={() => setType('debit')} className={`py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all border ${type === 'debit' ? 'bg-white text-black border-white' : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}><TrendingDown size={16} /> Debit (-)</button>
                 </div>

                 <div>
                    <div className="text-right text-[10px] text-zinc-500 mt-1 font-mono">Current DB Balance: {getCurrentBalance()?.toFixed(4)} {currency}</div>
                 </div>

                 <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-wider">Amount</label>
                    <div className="relative">
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white text-2xl font-medium outline-none focus:border-white/50 transition-colors placeholder:text-zinc-800 font-mono" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">{currency}</span>
                    </div>
                 </div>

                 <button onClick={handleExecute} disabled={loading} className="w-full py-4 rounded-xl font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2 transition-all mt-auto">
                     {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Confirm {type === 'credit' ? 'Deposit' : 'Deduction'}
                 </button>
              </>
          ) : (
              <div className="flex flex-col h-full">
                 <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl mb-6">
                     <div className="flex items-start gap-3 mb-4">
                         <div className="bg-red-500/10 p-2 rounded-lg text-red-500"><AlertTriangle size={20} /></div>
                         <div>
                            <h4 className="font-bold text-white text-sm">Force Sweep ({currency})</h4>
                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                Moves all {currency} from user address to Master Wallet. 
                                {currency === 'USDT' && <span className="text-emerald-500 block mt-1 flex items-center gap-1"><Fuel size={10} /> Auto-Gas Station Active</span>}
                            </p>
                         </div>
                     </div>
                     
                     <div className="flex items-center justify-between py-3 border-t border-white/5">
                         <span className="text-xs font-medium text-zinc-400">Live Chain {currency}</span>
                         <span className="text-xs font-mono text-white flex items-center gap-2">{syncing ? <Loader2 className="animate-spin" size={12}/> : liveChainBalance} {currency}</span>
                     </div>

                     <div className="flex items-center justify-between py-3 border-t border-white/5">
                         <span className="text-xs font-medium text-zinc-400">Target Address</span>
                         <span className="text-xs font-mono text-white truncate max-w-[150px]">{user.address || 'Not Generated'}</span>
                     </div>
                 </div>

                 <button onClick={handleSweep} disabled={sweeping} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-red-600/20">
                     {sweeping ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />} Execute {currency} Sweep
                 </button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 2. TRANSACTION MANAGER ---
function TransactionManager() {
  const supabase = createClient();
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTxs = async () => {
    try {
        const res = await fetch('/api/admin/get-transactions'); 
        const data = await res.json();
        if (data.success) setTxs(data.transactions);
    } catch (e) { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  const handleStatus = async (id: string, status: 'pending' | 'completed' | 'failed') => {
    setTxs(prev => prev.map(t => t.id === id ? { ...t, status } : t)); 
    try {
        await fetch('/api/admin/update-transaction', { method: 'POST', body: JSON.stringify({ id, status }) });
        toast.success(`Request ${status}`);
    } catch (e) { toast.error("Update failed"); fetchTxs(); }
  };

  useEffect(() => {
    fetchTxs();
    const channel = supabase.channel('admin_tx').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchTxs).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const activeTxs = txs.filter(t => {
      const isStatusMatch = ['processing', 'pending'].includes(t.status);
      const isSearchMatch = searchTerm === '' || 
          (t.user_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.metadata?.to_address || '').toLowerCase().includes(searchTerm.toLowerCase());
      return isStatusMatch && isSearchMatch;
  });

  return (
    <div className="animate-in fade-in">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
             <h2 className="text-lg font-bold">Requests <span className="text-zinc-500 text-sm">({activeTxs.length})</span></h2>
             <button onClick={() => { setLoading(true); fetchTxs(); }} className="p-2 bg-zinc-900 rounded-full"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
          </div>
          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
             <input type="text" placeholder="Search ID or Address..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#111] border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none w-full focus:border-emerald-500/50" />
          </div>
       </div>

       {activeTxs.length === 0 ? (
           <div className="p-12 text-center text-zinc-500 border border-zinc-800 rounded-2xl bg-[#0a0a0a]">
               {searchTerm ? 'No matching requests.' : 'No pending requests.'}
           </div>
       ) : (
           <div className="grid grid-cols-1 gap-3">
               {activeTxs.map((tx) => (
                   <div key={tx.id} className="bg-[#111] border border-zinc-800 p-4 rounded-xl flex flex-col gap-4">
                       <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                           <div className="flex items-start gap-3">
                               <div className={`p-3 rounded-full ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                   {tx.type === 'deposit' ? <ArrowRight className="rotate-45" size={18} /> : <ArrowRight className="-rotate-45" size={18} />}
                               </div>
                               <div>
                                   <div className="flex items-center gap-2">
                                       <span className="font-bold text-white text-lg">{Math.abs(tx.amount)} {tx.currency}</span>
                                       {tx.status === 'processing' && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-yellow-500/20 flex items-center gap-1"><Clock size={10} /> New</span>}
                                       {tx.status === 'pending' && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-blue-500/20 flex items-center gap-1"><Hourglass size={10} /> Reviewing</span>}
                                   </div>
                                   <div className="text-xs text-zinc-500 font-mono mt-1 break-all">{tx.metadata?.to_address || 'System'}</div>
                               </div>
                           </div>
                           <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 rounded-md cursor-pointer hover:bg-zinc-800 active:scale-95 transition-all group" onClick={() => { navigator.clipboard.writeText(tx.user_id); toast.success("ID Copied"); }}>
                                    <Hash size={12} className="text-zinc-500 group-hover:text-emerald-500" />
                                    <span className="text-xs font-mono text-zinc-400 group-hover:text-white">{tx.user_id.slice(0, 8)}...</span>
                                    <Copy size={10} className="text-zinc-600 opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="text-[10px] text-zinc-600 font-medium">{new Date(tx.created_at).toLocaleString()}</div>
                           </div>
                       </div>
                       <div className="flex items-center gap-2 border-t border-zinc-800 pt-3">
                           <button onClick={() => handleStatus(tx.id, 'failed')} className="px-4 py-2 bg-red-500/10 text-red-500 font-bold rounded-lg text-xs hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"><XCircle size={14} /> Reject</button>
                           {tx.status === 'processing' ? (
                               <button onClick={() => handleStatus(tx.id, 'pending')} className="flex-1 px-4 py-2 bg-blue-500/10 text-blue-400 font-bold rounded-lg text-xs hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2"><Hourglass size={14} /> Review</button>
                           ) : (
                               <button onClick={() => handleStatus(tx.id, 'completed')} className="flex-1 px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg text-xs hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"><CheckCircle2 size={14} /> Approve</button>
                           )}
                       </div>
                   </div>
               ))}
           </div>
       )}
    </div>
  );
}

// --- 3. MAIN PAGE ---
export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState<'users' | 'txs'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setIsAuthorized(true);
      toast.success("Welcome Back, Admin");
      fetchUsers();
    } else {
      toast.error("Invalid Credentials");
    }
  };

  const fetchUsers = async () => {
     try {
        const res = await fetch('/api/admin/get-users');
        const data = await res.json();
        if(data.success) setUsers(data.users);
     } catch(e) {}
  };

  const filteredUsers = users.filter(u => 
    (u.address || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.readable_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
              <Lock size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Locked</h1>
            <p className="text-zinc-500 text-sm mt-2">Restricted Access Area</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#111] border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white outline-none focus:border-zinc-700 transition-all" />
            </div>
            <div className="relative">
              <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#111] border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white outline-none focus:border-zinc-700 transition-all" />
            </div>
            <button type="submit" className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-all">Unlock Console</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 md:pb-0">
      {selectedUser && <FundManager user={selectedUser} onClose={() => setSelectedUser(null)} onSuccess={fetchUsers} />}

      <header className="border-b border-zinc-900 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="bg-red-500/10 text-red-500 p-1.5 rounded-lg"><ShieldAlert size={18} /></div>
            <span className="font-bold text-sm tracking-tight">Admin<span className="text-zinc-600">Console</span></span>
         </div>
         <div className="flex bg-zinc-900 p-1 rounded-lg">
            <button onClick={() => setActiveTab('users')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'users' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>Users</button>
            <button onClick={() => setActiveTab('txs')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'txs' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>Requests</button>
         </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'users' ? (
            <div className="animate-in fade-in">
                <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide md:grid md:grid-cols-3">
                    <div className="bg-[#111] border border-zinc-800 p-4 rounded-xl min-w-[140px] md:min-w-0">
                        <div className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Users</div>
                        <div className="text-xl font-bold">{users.length}</div>
                    </div>
                    <div className="bg-[#111] border border-zinc-800 p-4 rounded-xl min-w-[140px] md:min-w-0">
                        <div className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Liability</div>
                        <div className="text-xl font-bold text-emerald-500">{users.reduce((a, c) => a + (c.balance || 0), 0).toFixed(2)} <span className="text-xs text-zinc-600">ETH</span></div>
                    </div>
                    <div className="bg-[#111] border border-zinc-800 p-4 rounded-xl min-w-[140px] md:min-w-0">
                        <div className="text-zinc-500 text-[10px] font-bold uppercase mb-1">On-Chain</div>
                        <div className="text-xl font-bold text-blue-500">{users.reduce((a, c) => a + (c.last_chain_balance || 0), 0).toFixed(2)} <span className="text-xs text-zinc-600">ETH</span></div>
                    </div>
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                    <input type="text" placeholder="Search User (ID, Address)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#111] border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-sm outline-none w-full focus:border-emerald-500/50" />
                </div>

                <div className="space-y-3">
                    {filteredUsers.map((user) => (
                        <div key={user.id} onClick={() => setSelectedUser(user)} className="bg-[#111] border border-zinc-800 p-4 rounded-xl active:bg-zinc-900 transition-colors cursor-pointer flex items-center justify-between group">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-white text-sm">
                                        {user.readable_id || <span className="text-zinc-500 italic text-xs">Generating ID...</span>}
                                    </span>
                                    {user.last_chain_balance > 0 && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                                </div>
                                <div className="text-xs text-zinc-500 font-mono truncate w-32 md:w-auto">{user.address?.slice(0,10)}...</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-right">
                                <div className={`text-xs font-mono ${user.balance > 0 ? 'text-blue-400 font-bold' : 'text-zinc-700/50'}`}>{user.balance?.toFixed(4)} ETH</div>
                                <div className={`text-xs font-mono ${user.usdt_balance > 0 ? 'text-emerald-400 font-bold' : 'text-zinc-700/50'}`}>{user.usdt_balance?.toFixed(2)} USDT</div>
                                <div className={`text-xs font-mono ${user.btc_balance > 0 ? 'text-orange-400 font-bold' : 'text-zinc-700/50'}`}>{user.btc_balance?.toFixed(5)} BTC</div>
                                <div className={`text-xs font-mono ${user.sol_balance > 0 ? 'text-purple-400 font-bold' : 'text-zinc-700/50'}`}>{user.sol_balance?.toFixed(2)} SOL</div>
                                <div className={`text-xs font-mono col-span-2 ${user.trx_balance > 0 ? 'text-red-400 font-bold' : 'text-zinc-700/50'}`}>{user.trx_balance?.toFixed(2)} TRX</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <TransactionManager />
        )}
      </main>
    </div>
  );
}