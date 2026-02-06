"use client";
import React, { useState } from 'react';
import { X, Copy, CheckCircle2, Share2, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AssetIcon } from './AssetIcon';
import QRCode from "react-qr-code";
import { toast } from 'sonner';

interface ReceiveModalProps {
  asset: string;
  userAddress: string; 
  onClose: () => void;
}

// ⚠️ PRODUCTION NOTE: 
// In a real app, these should be in your Database (Global Settings) or Environment Variables.
// Hardcoding them here means you must redeploy to change wallets.
const MASTER_WALLETS: Record<string, string> = {
  'BTC': 'bc1qefx0jexahn2r6t89anrj8n3s22d0ggetesnr56',
  'TRX': 'TM61tkjeEPizTNviYszkYJqDWef2twjdqB',
  'SOL': '6NYpSagGM8sTmCR45HbDtUNtzK9kcvNNJ9SqTAEY5h2Z',
  // ETH & USDT are handled dynamically via userAddress
};

const NETWORKS: Record<string, string> = {
  'BTC': 'Bitcoin Network',
  'ETH': 'Ethereum (ERC20)',
  'USDT': 'Ethereum (ERC20)',
  'SOL': 'Solana',
  'TRX': 'Tron (TRC20)'
};

export function ReceiveModal({ asset, userAddress, onClose }: ReceiveModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);

  // LOGIC: 
  // 1. ERC20 Tokens (ETH, USDT) -> MUST use the generated User Address for auto-tracking.
  // 2. Other Chains (BTC, SOL) -> Use the Master Wallet (Manual Deposit/Custodial).
  const isEVM = asset === 'ETH' || asset === 'USDT';
  const finalAddress = isEVM ? userAddress : (MASTER_WALLETS[asset] || userAddress);

  const handleCopy = () => {
    if (!finalAddress || finalAddress === "0x...") {
      toast.error("Address loading...");
      return;
    }
    navigator.clipboard.writeText(finalAddress);
    setCopied(true);
    toast.success("Address Copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Deposit ${asset}`,
          text: finalAddress,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  // Styles
  const bgMain = isDark ? 'bg-[#121212]' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-zinc-500' : 'text-slate-500';

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      
      {/* Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full md:w-[400px] rounded-t-[32px] md:rounded-[32px] shadow-2xl overflow-hidden ${bgMain} flex flex-col pb-8 md:pb-6`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
           <span className={`text-xl font-bold ${textMain}`}>Receive {asset}</span>
           <button onClick={onClose} className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${textMain}`}>
              <X size={20} />
           </button>
        </div>

        <div className="flex flex-col items-center px-6">
           
           {/* QR Code Card */}
           <div className="mt-4 p-4 rounded-[24px] bg-white shadow-sm border border-slate-100 relative group cursor-pointer" onClick={handleCopy}>
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                 <AssetIcon symbol={asset} size="lg" />
              </div>
              
              {/* QR CODE GENERATOR */}
              <div className="relative z-10">
                 {finalAddress && finalAddress !== "0x..." ? (
                   <QRCode 
                      value={finalAddress} 
                      size={200}
                      level="M" 
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                   />
                 ) : (
                   <div className="w-[200px] h-[200px] bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                     Generating...
                   </div>
                 )}
              </div>
              
              {/* Scan Hint */}
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[20px]">
                 <span className="text-xs font-bold text-black">Tap to Copy</span>
              </div>
           </div>

           {/* Network Badge */}
           <div className={`mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-[#2C2C2E]' : 'bg-slate-100'}`}>
              <Info size={14} className={textSub} />
              <span className={`text-xs font-bold ${textSub}`}>
                Send only 
                <span className={`mx-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{asset}</span> 
                on {NETWORKS[asset] || 'its Network'}
              </span>
           </div>

           {/* WARNING FOR NON-EVM (Custodial) */}
           {!isEVM && (
              <div className="mt-2 text-[10px] text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg flex items-center gap-1.5">
                <AlertTriangle size={10} />
                Deposits to this address require 1 network confirmation.
              </div>
           )}

           {/* Address Box */}
           <div className="w-full mt-6">
              <div className="flex justify-between items-center mb-2 px-1">
                 <span className={`text-xs font-bold ${textSub}`}>Wallet Address</span>
                 {copied && <span className="text-xs font-bold text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> Copied</span>}
              </div>
              
              <button 
                onClick={handleCopy}
                className={`w-full p-4 rounded-[20px] border flex items-center justify-between group transition-all active:scale-[0.98]
                   ${isDark ? 'bg-[#1E1E1E] border-white/5 hover:bg-[#252525]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}
                `}
              >
                 <span className={`font-mono text-xs md:text-sm break-all text-left mr-4 ${textMain} opacity-80 group-hover:opacity-100`}>
                    {finalAddress || "Loading Address..."}
                 </span>
                 <Copy size={18} className={isDark ? 'text-white' : 'text-slate-900'} />
              </button>
           </div>

           {/* Share Button */}
           <button 
              onClick={handleShare}
              className={`w-full mt-4 py-3.5 rounded-[20px] font-bold text-sm flex items-center justify-center gap-2 transition-all
              ${isDark ? 'bg-[#2C2C2E] text-white hover:bg-[#3A3A3C]' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}
           `}>
              <Share2 size={18} />
              Share Address
           </button>

        </div>
      </div>
    </div>
  );
}