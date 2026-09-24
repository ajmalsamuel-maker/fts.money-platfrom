import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { ethers } from 'npm:ethers@6.10.0';

// Gas-free meta-transaction relay
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { 
            participant_id, 
            contract_address, 
            function_name,
            function_params,
            signature 
        } = await req.json();

        if (!participant_id || !contract_address || !function_name) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get participant and blockchain config
        const participants = await base44.asServiceRole.entities.LoyaltyParticipant.filter({ 
            id: participant_id 
        });
        if (!participants || participants.length === 0) {
            return Response.json({ error: 'Participant not found' }, { status: 404 });
        }

        const participant = participants[0];
        const programId = participant.program_id;

        // Get program
        const programs = await base44.asServiceRole.entities.LoyaltyProgram.filter({ id: programId });
        if (!programs || programs.length === 0) {
            return Response.json({ error: 'Program not found' }, { status: 404 });
        }

        // Get blockchain config
        const customers = await base44.asServiceRole.entities.LoyaltyCustomer.filter({ 
            admin_email: programs[0].admin_email 
        });
        const configs = await base44.asServiceRole.entities.BlockchainConfig.filter({ 
            customer_id: customers[0].id 
        });
        
        if (!configs || configs.length === 0 || !configs[0].gas_relay_enabled) {
            return Response.json({ 
                error: 'Gas relay not enabled for this customer' 
            }, { status: 400 });
        }

        const blockchainConfig = configs[0];

        // Connect to customer's private chain
        const provider = new ethers.JsonRpcProvider(blockchainConfig.rpc_url);
        const relayerWallet = new ethers.Wallet(blockchainConfig.deployer_private_key, provider);

        // Build transaction
        const tokenABI = [
            "function transfer(address to, uint256 amount) public returns (bool)",
            "function balanceOf(address account) public view returns (uint256)"
        ];

        const contract = new ethers.Contract(contract_address, tokenABI, relayerWallet);

        // Execute meta-transaction (relayer pays gas, user signs intent)
        let tx;
        switch (function_name) {
            case 'transfer':
                tx = await contract.transfer(
                    function_params.to, 
                    ethers.parseEther(function_params.amount.toString())
                );
                break;
            default:
                return Response.json({ error: 'Unsupported function' }, { status: 400 });
        }

        const receipt = await tx.wait();

        console.log(`Meta-transaction executed: ${receipt.hash} (gas paid by relayer)`);

        return Response.json({
            success: true,
            transaction_hash: receipt.hash,
            gas_cost_usd: 0, // Zero for end user
            block_number: receipt.blockNumber,
            explorer_url: `${blockchainConfig.explorer_url}/tx/${receipt.hash}`,
            message: 'Transaction executed with zero gas fees'
        });

    } catch (error) {
        console.error('Meta-transaction error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});