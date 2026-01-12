import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { ethers } from 'npm:ethers@6.10.0';

const TOKEN_ABI = [
    "function burn(address from, uint256 amount) public",
    "function balanceOf(address account) public view returns (uint256)"
];

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { participant_id, points_redeemed, redemption_id } = await req.json();

        if (!participant_id || !points_redeemed) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get participant details
        const participant = await base44.asServiceRole.entities.LoyaltyParticipant.filter({ id: participant_id });
        if (!participant || participant.length === 0) {
            return Response.json({ error: 'Participant not found' }, { status: 404 });
        }

        const programId = participant[0].program_id;

        // Get token info
        const tokens = await base44.asServiceRole.entities.LoyaltyToken.filter({ program_id: programId });
        if (!tokens || tokens.length === 0 || !tokens[0].is_blockchain_enabled) {
            return Response.json({ error: 'Blockchain not enabled for this program' }, { status: 400 });
        }

        const token = tokens[0];

        // Get participant balance
        const balances = await base44.asServiceRole.entities.TokenBalance.filter({ 
            participant_id,
            token_id: token.id 
        });

        if (!balances || balances.length === 0) {
            return Response.json({ error: 'Wallet not found' }, { status: 404 });
        }

        const balance = balances[0];

        // Check sufficient balance
        if (balance.available_balance < points_redeemed) {
            return Response.json({ error: 'Insufficient balance' }, { status: 400 });
        }

        // Connect to blockchain
        const rpcUrl = Deno.env.get('BLOCKCHAIN_RPC_URL');
        const privateKey = Deno.env.get('BLOCKCHAIN_PRIVATE_KEY');

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(token.contract_address, TOKEN_ABI, wallet);

        // Burn tokens
        const amount = ethers.parseEther(points_redeemed.toString());
        const tx = await contract.burn(balance.wallet_address, amount);
        await tx.wait();

        console.log(`Burned ${points_redeemed} tokens from ${balance.wallet_address}`);

        // Update balance
        await base44.asServiceRole.entities.TokenBalance.update(balance.id, {
            available_balance: balance.available_balance - points_redeemed,
            lifetime_spent: (balance.lifetime_spent || 0) + points_redeemed,
            last_transaction_date: new Date().toISOString()
        });

        // Update participant balance
        await base44.asServiceRole.entities.LoyaltyParticipant.update(participant_id, {
            current_balance: (participant[0].current_balance || 0) - points_redeemed,
            lifetime_redeemed: (participant[0].lifetime_redeemed || 0) + points_redeemed
        });

        // Update token circulation
        await base44.asServiceRole.entities.LoyaltyToken.update(token.id, {
            circulating_supply: Math.max(0, (token.circulating_supply || 0) - points_redeemed)
        });

        return Response.json({
            success: true,
            tokens_burned: points_redeemed,
            transaction_hash: tx.hash,
            new_balance: balance.available_balance - points_redeemed,
            wallet_address: balance.wallet_address
        });

    } catch (error) {
        console.error('Burning error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});