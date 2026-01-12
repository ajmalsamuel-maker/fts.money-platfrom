import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { participant_id, program_id } = await req.json();

        // Get participant data
        const participant = await base44.entities.LoyaltyParticipant.filter({ id: participant_id });
        if (participant.length === 0) {
            return Response.json({ error: 'Participant not found' }, { status: 404 });
        }

        const participantData = participant[0];

        // Get token balance
        const balances = await base44.entities.TokenBalance.filter({
            program_id,
            participant_id
        });

        const balance = balances[0] || { available_balance: 0 };

        // Get past redemptions
        const redemptions = await base44.entities.TokenRedemption.filter({
            program_id,
            participant_id,
            status: 'fulfilled'
        });

        // Get activity history
        const activities = await base44.entities.ActivityLog.filter({
            program_id,
            participant_id
        });

        // Get all available rewards
        const allRewards = await base44.entities.RedemptionOption.filter({
            program_id,
            is_active: true
        });

        // Build context for AI
        const context = `
Participant Profile:
- Current Balance: ${balance.available_balance} tokens
- Tier: ${participantData.current_tier}
- Lifetime Earned: ${balance.lifetime_earned || 0} tokens
- Lifetime Spent: ${balance.lifetime_spent || 0} tokens
- Activity Count: ${activities.length} activities
- Past Redemptions: ${redemptions.length} (types: ${redemptions.map(r => r.redemption_option_id).join(', ')})
- Preferred Activity: ${activities[0]?.activity_type || 'unknown'}

Available Rewards:
${allRewards.map(r => `- ${r.reward_name} (${r.points_required} tokens, type: ${r.reward_type})`).join('\n')}

Task: Suggest 3-5 personalized rewards based on the participant's balance, tier, activity patterns, and past redemptions.
Return JSON array with: reward_id, reward_name, relevance_score (0-100), personalized_reason.
`;

        // Call AI to generate suggestions
        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: context,
            response_json_schema: {
                type: "object",
                properties: {
                    suggestions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                reward_id: { type: "string" },
                                reward_name: { type: "string" },
                                relevance_score: { type: "number" },
                                personalized_reason: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        return Response.json({
            success: true,
            suggestions: aiResponse.suggestions || [],
            participant_context: {
                balance: balance.available_balance,
                tier: participantData.current_tier,
                activity_count: activities.length
            }
        });

    } catch (error) {
        console.error('AI Suggestion Error:', error);
        return Response.json({ 
            error: error.message || 'Failed to generate suggestions' 
        }, { status: 500 });
    }
});