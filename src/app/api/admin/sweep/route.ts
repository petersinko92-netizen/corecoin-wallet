import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { decrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

// --- 🚨 BULLETPROOF MAINNET OVERRIDES 🚨 ---
const ADMIN_WALLET_ADDRESS = process.env.ADMIN_WALLET_ADDRESS!;
const ADMIN_PRIVATE_KEY = process.env.GAS_WALLET_PRIVATE_KEY!; 

// 1. Force a public Ethereum MAINNET RPC (Removes the Sepolia fallback that causes the 0x error)
const RPC_URL = process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || 'https://eth.llamarpc.com';

// 2. Hardcode the REAL Ethereum Mainnet USDT Contract
const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; 

// USDT Contract ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];
// -------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = body.targetUserId || body.userId; 
    const asset = body.asset || 'ETH';

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    // 1. Setup DB & Provider
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

    // 2. Get User Wallet
    const { data: userWalletData } = await supabase
        .from('wallets')
        .select('address, encrypted_private_key, private_key') 
        .eq('user_id', userId)
        .single();

    if (!userWalletData) return NextResponse.json({ error: 'User wallet not found in database' });

    // 3. Smart Decrypt User Key
    const keyString = userWalletData.encrypted_private_key || userWalletData.private_key;
    if (!keyString) return NextResponse.json({ error: 'No private key found' }, { status: 400 });
    
    let userPrivateKey = '';
    
    // SMART CHECK: Is it a raw, unencrypted private key (Legacy Account fallback)?
    if (keyString.startsWith('0x') && keyString.length === 66) {
        userPrivateKey = keyString;
    } else if (keyString.length === 64 && !keyString.includes(':')) {
        userPrivateKey = '0x' + keyString;
    } else {
        // It is a new account, so decrypt it normally
        const decrypted = decrypt(keyString);
        if (!decrypted) {
            return NextResponse.json({ error: 'Decryption failed. Key mismatch or corrupted old account.' }, { status: 400 });
        }
        userPrivateKey = decrypted.startsWith('0x') ? decrypted : '0x' + decrypted;
    }

    // Wrap wallet creation in a try-catch to catch mathematically invalid keys
    let userWallet;
    try {
        userWallet = new ethers.Wallet(userPrivateKey, provider);
    } catch (err) {
        return NextResponse.json({ error: 'Recovered private key is invalid.' }, { status: 400 });
    }

    console.log(`🧹 Sweeping ${asset} from ${userWallet.address}...`);

    // ==========================================
    // 🌊 SCENARIO A: SWEEPING ETH
    // ==========================================
    if (asset === 'ETH') {
        const balance = await provider.getBalance(userWallet.address);
        const gasPrice = (await provider.getFeeData()).gasPrice || BigInt(30000000000); // 30 Gwei safety
        const gasLimit = BigInt(21000);
        const cost = gasLimit * gasPrice;

        const amountToSend = balance - cost;

        if (amountToSend <= BigInt(0)) {
            return NextResponse.json({ message: 'ETH Balance too low to sweep (Dust)' });
        }

        const tx = await userWallet.sendTransaction({
            to: ADMIN_WALLET_ADDRESS,
            value: amountToSend,
            gasLimit,
            gasPrice
        });

        return NextResponse.json({ success: true, txHash: tx.hash, amount: ethers.formatEther(amountToSend) });
    }

    // ==========================================
    // ⛽ SCENARIO B: SWEEPING USDT (The Gas Station)
    // ==========================================
    if (asset === 'USDT') {
        const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, userWallet);
        const usdtBalance = await usdtContract.balanceOf(userWallet.address);

        if (usdtBalance <= BigInt(0)) {
            return NextResponse.json({ message: 'No USDT to sweep' });
        }

        // Check if user has ETH for gas
        const ethBalance = await provider.getBalance(userWallet.address);
        const estimatedGas = BigInt(65000); // ERC20 Transfer cost
        const gasPrice = (await provider.getFeeData()).gasPrice || BigInt(30000000000);
        const requiredEth = estimatedGas * gasPrice;

        // 🚨 REFUEL LOGIC 🚨
        if (ethBalance < requiredEth) {
            console.log(`⛽ User has ${ethers.formatEther(ethBalance)} ETH. Sending gas for USDT sweep...`);
            
            // Admin sends exact gas needed + buffer
            const gasTx = await adminWallet.sendTransaction({
                to: userWallet.address,
                value: requiredEth - ethBalance + BigInt(10000000000000), // Add tiny buffer
            });
            
            console.log(`⛽ Gas Sent: ${gasTx.hash}. Waiting for confirmation...`);
            await gasTx.wait(1); // Wait for 1 block confirmation
        }

        // Now execute the sweep
        const sweepTx = await usdtContract.transfer(ADMIN_WALLET_ADDRESS, usdtBalance);
        
        return NextResponse.json({ success: true, txHash: sweepTx.hash, message: "USDT Swept" });
    }

    return NextResponse.json({ error: 'Unsupported Asset' });

  } catch (e: any) {
    console.error("Sweep Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
