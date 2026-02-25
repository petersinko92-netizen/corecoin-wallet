require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { ethers } = require('ethers');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSync() {
    const { data: wallets, error: err } = await supabase.from('wallets').select('*').limit(1).order('created_at', { ascending: false });
    if (err || !wallets.length) {
        console.log("No wallets found");
        return;
    }
    const wallet = wallets[0];
    console.log("Testing sync for wallet:", wallet.address, "UserID:", wallet.user_id);

    const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
    console.log("RPC_URL:", RPC_URL);

    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const balWei = await provider.getBalance(wallet.address);
        const liveBalance = parseFloat(ethers.formatEther(balWei));
        console.log("Live ETH Balance:", liveBalance);
        console.log("Last Known:", wallet.last_chain_balance || 0);
        console.log("Ghost Balance:", wallet.balance || 0);

        const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS;
        if (USDT_ADDRESS) {
            const ERC20_ABI = ["function balanceOf(address owner) view returns (uint256)"];
            const contract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
            const usdtWei = await contract.balanceOf(wallet.address);
            const usdtBal = parseFloat(ethers.formatUnits(usdtWei, 6));
            console.log("Live USDT Balance:", usdtBal);
        }
    } catch (e) {
        console.error("RPC Error:", e.message);
    }
}

testSync();
