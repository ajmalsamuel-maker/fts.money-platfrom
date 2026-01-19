import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { ethers } from 'npm:ethers@6.10.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { participant_id, program_id } = await req.json();

        if (!participant_id || !program_id) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if wallet already exists
        const existingBalances = await base44.asServiceRole.entities.TokenBalance.filter({ 
            participant_id,
            program_id 
        });

        if (existingBalances && existingBalances.length > 0 && existingBalances[0].wallet_address) {
            return Response.json({
                success: true,
                wallet_address: existingBalances[0].wallet_address,
                message: 'Wallet already exists'
            });
        }

        // Generate new wallet (server-side, no MetaMask needed)
        const wallet = ethers.Wallet.createRandom();
        const walletAddress = wallet.address;
        const privateKey = wallet.privateKey;

        console.log(`✅ Generated wallet for participant ${participant_id}: ${walletAddress}`);

        // Update TokenBalance with wallet address
        if (existingBalances && existingBalances.length > 0) {
            await base44.asServiceRole.entities.TokenBalance.update(existingBalances[0].id, {
                wallet_address: walletAddress
            });
        }
        
        return Response.json({
            success: true,
            wallet_address: walletAddress,
            private_key: privateKey, // ⚠️ In production, encrypt this or use custodial solution
            mnemonic: wallet.mnemonic?.phrase,
            message: 'Wallet provisioned successfully. Save your private key securely!'
        });

    } catch (error) {
        console.error('❌ Wallet provisioning error:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});