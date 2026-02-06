"use client";
import React from 'react';

interface AssetIconProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
}

export function AssetIcon({ symbol, size = 'md', className = '' }: AssetIconProps) {
  const s = symbol.toLowerCase();

  // Size mapping (Pixel perfect for high-res screens)
  const sizeClasses = {
    sm: 'w-6 h-6',      // Top Nav / Small lists
    md: 'w-10 h-10',    // List Items
    lg: 'w-12 h-12',    // Featured Cards
    xl: 'w-16 h-16',    // Headers
    xxl: 'w-24 h-24'    // Detail Page Hero
  };

  const currentSize = sizeClasses[size];

  // We use the "cryptocurrency-icons" CDN which is the industry standard for high-res (128px) icons
  // This ensures we get the EXACT color and shape used by Binance/Coinbase
  const baseUrl = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color";
  
  // Handle edge cases where the symbol might differ in file names
  const iconMap: Record<string, string> = {
    'btc': 'btc.png',
    'eth': 'eth.png',
    'usdt': 'usdt.png',
    'sol': 'sol.png',
    'trx': 'trx.png',
    // Add more as needed: 'bnb': 'bnb.png', 'ltc': 'ltc.png'
  };

  const iconFile = iconMap[s] || 'btc.png'; // Default to BTC if unknown (safety)

  return (
    <div className={`relative ${currentSize} ${className} shrink-0`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${baseUrl}/${iconFile}`}
        alt={symbol}
        className="w-full h-full object-contain drop-shadow-lg"
        loading="lazy"
      />
    </div>
  );
}