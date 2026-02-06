import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Load Config
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
const GAS_PK = process.env.GAS_WALLET_PRIVATE_KEY;
const ADMIN_ADDR = process.env.ADMIN_WALLET_ADDRESS;

export async function GET() {
  try {
    if (!GAS_PK || !ADMIN_ADDR) {
      return NextResponse.json({ error: 'Environment variables missing' }, { status: 500 });
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // 1. Get Gas Tank Details
    const gasWallet = new ethers.Wallet(GAS_PK, provider);
    const gasBalanceWei = await provider.getBalance(gasWallet.address);
    const gasBalance = parseFloat(ethers.formatEther(gasBalanceWei));

    // 2. Get Master Vault Details
    const masterBalanceWei = await provider.getBalance(ADMIN_ADDR);
    const masterBalance = parseFloat(ethers.formatEther(masterBalanceWei));

    // 3. Check RPC Health
    const blockNumber = await provider.getBlockNumber();

    return NextResponse.json({
      success: true,
      blockNumber,
      gasTank: {
        address: gasWallet.address,
        balance: gasBalance,
        status: gasBalance > 0.005 ? 'healthy' : 'critical' // Warn if < $15
      },
      masterVault: {
        address: ADMIN_ADDR,
        balance: masterBalance
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}