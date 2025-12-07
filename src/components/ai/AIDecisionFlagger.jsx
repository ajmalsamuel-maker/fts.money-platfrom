import { base44 } from '@/api/base44Client';

// Configuration for auto-flagging criteria
const FLAGGING_CRITERIA = {
    confidence_threshold: 0.75,
    high_amount_threshold: 5000,
    high_risk_score: 70,
    critical_decision_types: ['decline', 'flag']
};

export async function autoFlagDecision(decision, transaction) {
    const flags = [];

    // Check confidence threshold
    if (decision.confidence_score < FLAGGING_CRITERIA.confidence_threshold) {
        flags.push({
            reason: 'low_confidence',
            priority: decision.confidence_score < 0.5 ? 'high' : 'medium'
        });
    }

    // Check transaction amount
    if (transaction?.amount && transaction.amount > FLAGGING_CRITERIA.high_amount_threshold) {
        flags.push({
            reason: 'high_amount',
            priority: transaction.amount > 10000 ? 'urgent' : 'high'
        });
    }

    // Check risk score
    if (decision.risk_score && decision.risk_score > FLAGGING_CRITERIA.high_risk_score) {
        flags.push({
            reason: 'high_risk',
            priority: decision.risk_score > 85 ? 'urgent' : 'high'
        });
    }

    // Flag critical decision types
    if (FLAGGING_CRITERIA.critical_decision_types.includes(decision.decision_type)) {
        flags.push({
            reason: 'policy_violation',
            priority: 'high'
        });
    }

    // Create flags in database
    for (const flag of flags) {
        await base44.entities.AIReviewFlag.create({
            flag_id: `FLAG-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            decision_id: decision.id,
            transaction_id: transaction?.id || decision.transaction_id,
            flag_reason: flag.reason,
            priority: flag.priority,
            status: 'pending',
            original_ai_decision: {
                decision_type: decision.decision_type,
                confidence: decision.confidence_score,
                reasoning: decision.reasoning
            }
        });
    }

    return flags;
}

export function calculatePriority(decision, transaction) {
    if (decision.confidence_score < 0.5) return 'urgent';
    if (transaction?.amount > 10000) return 'urgent';
    if (decision.risk_score > 85) return 'urgent';
    if (transaction?.amount > 5000) return 'high';
    if (decision.risk_score > 70) return 'high';
    if (decision.confidence_score < 0.75) return 'medium';
    return 'low';
}