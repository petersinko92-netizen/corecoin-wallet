require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

async function testSweepAPI() {
    console.log("=== TESTING SWEEP API LOGIC ===");

    // Simulate getting a user
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: users } = await supabase.from('wallets').select('*').limit(1).order('created_at', { ascending: false });
    if (!users || users.length === 0) {
        console.log("No users found");
        return;
    }
    const user = users[0];
    console.log(`Testing Sweep for User: ${user.address}`);

    // SIMULATE DECRYPTION (lib/encryption.ts logic)
    const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Assuming hex, if not, it will fail
    // In our encryption.ts:
    function decrypt(text) {
        if (!text) return null;
        try {
            const key = ENCRYPTION_KEY.length === 64 ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : Buffer.from(process.env.ENCRYPTION_KEY);
            const textParts = text.split(':');
            const iv = Buffer.from(textParts.shift(), 'hex');
            const encryptedText = Buffer.from(textParts.join(':'), 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch (e) {
            console.error("Decryption err:", e.message);
            return null;
        }
    }

    const keyString = user.encrypted_private_key || user.private_key;
    let userPrivateKey = '';

    // Admin Sweep logic copy
    if (keyString.startsWith('0x') && keyString.length === 66) {
        userPrivateKey = keyString;
    } else if (keyString.length === 64 && !keyString.includes(':')) {
        userPrivateKey = '0x' + keyString;
    } else {
        const decrypted = decrypt(keyString);
        if (!decrypted) {
            console.log("Failed to decrypt");
            return;
        }
        userPrivateKey = decrypted.startsWith('0x') ? decrypted : '0x' + decrypted;
    }

    console.log("Decrypted Private Key Length:", userPrivateKey.length);

    try {
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const userWallet = new ethers.Wallet(userPrivateKey, provider);
        console.log("Successfully rebuilt Wallet:", userWallet.address);

        const balance = await provider.getBalance(userWallet.address);
        console.log("Live ETH Balance:", ethers.formatEther(balance));

        // ETH Sweep logic
        const gasPriceMatch = await provider.getFeeData();
        const gasPrice = gasPriceMatch.gasPrice || 30000000000n;
        const gasLimit = 21000n;
        const cost = gasLimit * gasPrice;

        console.log("Sweep Cost:", ethers.formatEther(cost));
        const amountToSend = balance - cost;

        if (amountToSend <= 0n) {
            console.log("ETH Balance too low to sweep (Dust)");
        } else {
            console.log("Ready to sweep ETH:", ethers.formatEther(amountToSend));
        }

    } catch (e) {
        console.error("Ether Error:", e);
    }
}

testSweepAPI();
