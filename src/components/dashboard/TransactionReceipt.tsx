"use client";
import React, { useRef, useState } from 'react';
import { X, Share2, Loader2, Info, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';

interface TransactionReceiptProps {
  tx: any;
  onClose: () => void;
}

export function TransactionReceipt({ tx, onClose }: TransactionReceiptProps) {
  const { theme } = useTheme();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!tx) return null;

  // --- 1. CONFIGURATION ---
  const PRICES: Record<string, number> = {
     'ETH': 2950.00,
     'BTC': 65000.00,
     'USDT': 1.00,
     'SOL': 145.00,
     'TRX': 0.15
  };

  const assetPrice = PRICES[tx.currency] || 0;
  const ethPrice = PRICES['ETH']; 

  const amount = Math.abs(tx.amount);
  // Honest Fee Logic: Read from DB, fallback to 0 if missing
  const fee = tx.metadata?.fee ? parseFloat(tx.metadata.fee) : 0; 
  
  // USD Calculations
  const amountUsd = (amount * assetPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const feeUsd = (fee * ethPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  // Formatting
  const isDeposit = tx.type === 'deposit';
  const status = tx.status === 'completed' ? 'Completed' : tx.status === 'failed' ? 'Failed' : 'Processing';

  // --- 2. SMART DATE LOGIC (The Fix) ---
  // This ensures it renders "Yesterday", "Today", or "Feb 05, 2026" correctly forever.
  const dateStr = formatSmartDate(tx.created_at);

  // Recipient Formatting
  const rawAddress = tx.metadata?.to_address || tx.metadata?.from_address || '0xcb45a...a62f5B';
  const displayAddress = rawAddress.length > 10 
     ? `${rawAddress.slice(0, 6)}...${rawAddress.slice(-5)}` 
     : rawAddress;

  // --- 3. DOWNLOAD ENGINE ---
  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    
    try {
       await new Promise(r => setTimeout(r, 100)); 

       const dataUrl = await toPng(receiptRef.current, {
          cacheBust: true,
          pixelRatio: 3, 
          backgroundColor: theme === 'dark' ? '#000000' : '#F2F2F7'
       });

       const link = document.createElement('a');
       link.download = `Receipt-${tx.id.slice(0, 8)}.png`;
       link.href = dataUrl;
       link.click();
       toast.success("Receipt Saved to Photos");
    } catch (e) {
       toast.error("Save failed");
    } finally {
       setIsDownloading(false);
    }
  };

  const isDark = theme === 'dark';
  
  // STYLES
  const bgMain = isDark ? 'bg-black' : 'bg-[#F2F2F7]'; 
  const bgCard = isDark ? 'bg-[#1C1C1E]' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-[#000000]';
  const textSub = isDark ? 'text-[#8E8E93]' : 'text-[#8A8A8E]';
  const blueLink = 'text-[#3375BB]'; 

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[390px] mx-4 flex flex-col gap-4"
      >
         {/* --- THE RECEIPT --- */}
         <div 
            ref={receiptRef}
            className={`w-full overflow-hidden rounded-[20px] ${bgMain} font-sans shadow-2xl relative pb-6`}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
         >
            {/* Header */}
            <div className={`flex justify-between items-center px-4 pt-4 pb-2 ${bgMain}`}>
               <ArrowLeft size={24} className={`${textMain} cursor-pointer`} onClick={onClose} />
               <h2 className={`text-[17px] font-semibold ${textMain}`}>
                  {tx.currency} {isDeposit ? 'Received' : 'Sent'}
               </h2>
               <Share2 size={24} className={textMain} />
            </div>

            {/* Hero Amount */}
            <div className={`flex flex-col items-center justify-center py-8 ${bgMain}`}>
               <h1 className={`text-[32px] font-bold tracking-tight leading-tight ${textMain}`}>
                  {isDeposit ? '' : '-'}{amount} {tx.currency}
               </h1>
               <p className={`text-[15px] mt-1 ${textSub} font-medium`}>
                  ≈ {amountUsd}
               </p>
            </div>

            {/* Details Card 1 */}
            <div className={`mx-4 rounded-[12px] overflow-hidden ${bgCard}`}>
               {/* Smart Date Row */}
               <Row label="Date" value={dateStr} isDark={isDark} divider />
               
               <div className={`flex justify-between items-center p-[16px] border-b ${isDark ? 'border-[#38383A]' : 'border-[#E5E5EA]'}`}>
                  <div className="flex items-center gap-1">
                     <span className={`text-[16px] ${textSub}`}>Status</span>
                     <Info size={14} className={textSub} />
                  </div>
                  <span className={`text-[16px] ${textMain} font-medium`}>{status}</span>
               </div>

               <Row 
                  label="Recipient" 
                  value={displayAddress} 
                  isDark={isDark} 
               />
            </div>

            {/* Details Card 2 (Fee) */}
            <div className={`mx-4 mt-6 rounded-[12px] overflow-hidden ${bgCard}`}>
               <div className={`flex justify-between items-center p-[16px]`}>
                  <div className="flex items-center gap-1">
                     <span className={`text-[16px] ${textSub}`}>Network fee</span>
                     <Info size={14} className={textSub} />
                  </div>
                  <div className="text-right">
                     <span className={`text-[16px] ${textMain} font-medium`}>
                        {fee} ETH <span className={textSub}>({feeUsd})</span>
                     </span>
                  </div>
               </div>
            </div>

            {/* Explorer Link */}
            <div className={`mx-4 mt-8 text-center ${bgMain}`}>
               <span className={`text-[16px] ${blueLink} font-medium cursor-pointer`}>
                  View on block explorer
               </span>
            </div>
         </div>

         {/* Download Button */}
         <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className={`w-full py-3.5 rounded-xl font-bold text-[17px] text-white shadow-lg active:scale-95 transition-all
               ${isDark ? 'bg-[#2C2C2E]' : 'bg-[#3375BB]'}
            `}
         >
            {isDownloading ? <Loader2 className="animate-spin mx-auto" /> : 'Save Receipt'}
         </button>
      </div>
    </div>
  );
}

// --- HELPER FUNCTIONS ---

function Row({ label, value, isDark, divider }: any) {
   return (
      <div className={`flex justify-between items-center p-[16px] ${divider ? `border-b ${isDark ? 'border-[#38383A]' : 'border-[#E5E5EA]'}` : ''}`}>
         <span className={`text-[16px] ${isDark ? 'text-[#8E8E93]' : 'text-[#8A8A8E]'}`}>
            {label}
         </span>
         <span className={`text-[16px] ${isDark ? 'text-white' : 'text-black'} font-medium`}>
            {value}
         </span>
      </div>
   );
}

// THE SMART DATE ENGINE
function formatSmartDate(dateString: string): string {
  if (!dateString) return 'Unknown Date';
  
  const date = new Date(dateString);
  const now = new Date();
  
  // Format Time (e.g., "9:29 AM")
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // Reset hours to compare pure calendar days
  const d = new Date(date); d.setHours(0,0,0,0);
  const n = new Date(now); n.setHours(0,0,0,0);

  const diffTime = n.getTime() - d.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
     return `Today at ${timeStr}`;
  } 
  if (diffDays === 1) {
     return `Yesterday at ${timeStr}`;
  }
  if (diffDays < 7 && diffDays > 0) {
     // e.g. "Monday at 9:29 AM"
     return `${date.toLocaleDateString('en-US', { weekday: 'long' })} at ${timeStr}`;
  }
  
  // e.g. "Feb 5, 2026 at 9:29 AM"
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${timeStr}`;
}