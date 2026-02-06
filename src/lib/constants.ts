export const MASTER_WALLETS = {
  BTC: {
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    network: "Bitcoin Network",
    isAutomated: false
  },
  SOL: {
    address: "HuD9F7kH5G8yJ9kL2mN4pQ3rS6tV8wX1z",
    network: "Solana",
    isAutomated: false
  },
  TRX: {
    address: "TYKS829103928192039123",
    network: "Tron (TRC20)",
    isAutomated: false
  },
  ETH: { 
    network: "ERC-20",
    isAutomated: true 
  },
  USDT: { 
    network: "ERC-20 / TRC-20", 
    isAutomated: true 
  }
};

export const CRYPTO_ASSETS = [
  { id: 'BTC', name: 'Bitcoin', icon: '₿', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'text-slate-200', bg: 'bg-slate-800' },
  { id: 'USDT', name: 'Tether', icon: '₮', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'SOL', name: 'Solana', icon: '◎', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'TRX', name: 'Tron', icon: '♦', color: 'text-red-500', bg: 'bg-red-500/10' },
];