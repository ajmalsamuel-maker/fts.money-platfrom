import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { program_id, redemption_option_id, participant_email } = await req.json();

        // Get participant
        const participants = await base44.entities.LoyaltyParticipant.filter({
            program_id,
            participant_email
        });

        if (participants.length === 0) {
            return Response.json({ error: 'Participant not found' }, { status: 404 });
        }

        const participant = participants[0];

        // Get redemption option
        const option = await base44.entities.RedemptionOption.filter({ id: redemption_option_id });
        if (option.length === 0) {
            return Response.json({ error: 'Reward not found' }, { status: 404 });
        }

        const reward = option[0];

        // Get token balance
        const tokenBalances = await base44.entities.TokenBalance.filter({
            program_id,
            participant_id: participant.id
        });

        if (tokenBalances.length === 0) {
            return Response.json({ error: 'No token balance found' }, { status: 400 });
        }

        const balance = tokenBalances[0];

        // Check sufficient balance
        if (balance.available_balance < reward.points_required) {
            return Response.json({ error: 'Insufficient token balance' }, { status: 400 });
        }

        // Check inventory
        if (reward.inventory_available === 0) {
            return Response.json({ error: 'Reward out of stock' }, { status: 400 });
        }

        // Determine if approval is needed (high-value redemptions >= 10,000 tokens)
        const requiresApproval = reward.points_required >= 10000;

        // Create redemption record
        const redemption = await base44.entities.TokenRedemption.create({
            program_id,
            participant_id: participant.id,
            redemption_option_id: reward.id,
            tokens_redeemed: reward.points_required,
            status: requiresApproval ? 'pending_approval' : 'approved',
            requires_approval: requiresApproval,
            approved_by: requiresApproval ? null : 'auto',
            approved_date: requiresApproval ? null : new Date().toISOString()
        });

        // If auto-approved, deduct tokens immediately
        if (!requiresApproval) {
            // Update token balance
            await base44.entities.TokenBalance.update(balance.id, {
                available_balance: balance.available_balance - reward.points_required,
                lifetime_spent: balance.lifetime_spent + reward.points_required
            });

            // Create transaction record
            const newBalance = balance.available_balance - reward.points_required;
            await base44.entities.TokenTransaction.create({
                program_id,
                participant_id: participant.id,
                token_id: balance.token_id,
                transaction_type: 'redeem',
                amount: -reward.points_required,
                balance_after: newBalance,
                reference_id: redemption.id,
                reference_type: 'redemption',
                description: `Redeemed: ${reward.reward_name}`,
                status: 'completed'
            });

            // Update inventory if tracked
            if (reward.inventory_available > 0) {
                await base44.entities.RedemptionOption.update(reward.id, {
                    inventory_available: reward.inventory_available - 1
                });
            }
        }

        return Response.json({
            success: true,
            redemption,
            requires_approval: requiresApproval,
            message: requiresApproval 
                ? 'Redemption submitted for admin approval' 
                : 'Redemption processed successfully'
        });

    } catch (error) {
        console.error('Redemption error:', error);
        return Response.json({ 
            error: error.message || 'Failed to process redemption' 
        }, { status: 500 });
    }
});