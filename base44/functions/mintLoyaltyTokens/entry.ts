import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { ethers } from 'npm:ethers@6.10.0';

const TOKEN_ABI = [
    "function mint(address to, uint256 amount) public",
    "function balanceOf(address account) public view returns (uint256)"
];

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { participant_id, points_earned, activity_log_id } = await req.json();

        if (!participant_id || !points_earned) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get participant and program details
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
        
        // Get or create participant wallet
        let balances = await base44.asServiceRole.entities.TokenBalance.filter({ 
            participant_id,
            token_id: token.id 
        });

        let balance;
        if (!balances || balances.length === 0) {
            // Provision new wallet
            const walletResponse = await base44.functions.invoke('provisionParticipantWallet', { 
                participant_id,
                program_id: programId 
            });
            
            balance = await base44.asServiceRole.entities.TokenBalance.create({
                program_id: programId,
                participant_id,
                token_id: token.id,
                available_balance: 0,
                wallet_address: walletResponse.data.wallet_address
            });
        } else {
            balance = balances[0];
        }

        // Connect to blockchain
        const rpcUrl = Deno.env.get('BLOCKCHAIN_RPC_URL');
        const privateKey = Deno.env.get('BLOCKCHAIN_PRIVATE_KEY');

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(token.contract_address, TOKEN_ABI, wallet);

        // Mint tokens
        const amount = ethers.parseEther(points_earned.toString());
        const tx = await contract.mint(balance.wallet_address, amount);
        await tx.wait();

        console.log(`Minted ${points_earned} tokens to ${balance.wallet_address}`);

        // Update balance
        await base44.asServiceRole.entities.TokenBalance.update(balance.id, {
            available_balance: (balance.available_balance || 0) + points_earned,
            lifetime_earned: (balance.lifetime_earned || 0) + points_earned,
            last_transaction_date: new Date().toISOString()
        });

        // Update participant balance
        await base44.asServiceRole.entities.LoyaltyParticipant.update(participant_id, {
            current_balance: (participant[0].current_balance || 0) + points_earned,
            lifetime_earned: (participant[0].lifetime_earned || 0) + points_earned
        });

        // Update token circulation
        await base44.asServiceRole.entities.LoyaltyToken.update(token.id, {
            circulating_supply: (token.circulating_supply || 0) + points_earned
        });

        return Response.json({
            success: true,
            tokens_minted: points_earned,
            transaction_hash: tx.hash,
            new_balance: (balance.available_balance || 0) + points_earned,
            wallet_address: balance.wallet_address
        });

    } catch (error) {
        console.error('Minting error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});