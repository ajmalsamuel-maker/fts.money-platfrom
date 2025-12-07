import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { method } = req;
        
        // Verify authentication
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (method === 'POST') {
            const body = await req.json();
            const { action, merchant_id } = body;
            
            if (action === 'check_merchant') {
                // Check specific merchant
                const result = await checkMerchantCompliance(base44, merchant_id);
                return Response.json(result);
            }
            
            if (action === 'scan_all') {
                // Scan all active merchants
                const results = await scanAllMerchants(base44);
                return Response.json({ results });
            }
            
            if (action === 'handle_issue') {
                // Handle a specific compliance issue
                const { merchant, issue } = body;
                const result = await handleComplianceIssue(base44, merchant, issue);
                return Response.json(result);
            }
        }

        return Response.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        console.error('Compliance monitor error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkMerchantCompliance(base44, merchantId) {
    const issues = [];
    const THRESHOLDS = {
        CHARGEBACK_RATE: 1.0,
        CHARGEBACK_COUNT: 10,
        DECLINE_RATE: 15.0,
        VOLUME_SPIKE: 200,
    };
    
    try {
        const merchants = await base44.entities.Merchant.filter({ merchant_id: merchantId });
        if (!merchants || merchants.length === 0) return { issues: [], merchant: null };
        
        const merchant = merchants[0];
        
        // AML checks
        if (merchant.aml_status === 'flagged' || merchant.aml_status === 'blocked') {
            issues.push({
                type: 'aml_flag',
                severity: 'critical',
                title: 'AML Alert Triggered',
                description: `Merchant flagged by AML screening: ${merchant.aml_status}`,
                data: { aml_status: merchant.aml_status, aml_risk_score: merchant.aml_risk_score }
            });
        }
        
        if (merchant.aml_risk_score && merchant.aml_risk_score >= 70) {
            issues.push({
                type: 'aml_flag',
                severity: 'high',
                title: 'High AML Risk Score',
                description: `AML risk score: ${merchant.aml_risk_score}/100`,
                data: { aml_risk_score: merchant.aml_risk_score }
            });
        }
        
        // Transaction analysis
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const transactions = await base44.entities.Transaction.filter({ merchant_id: merchantId });
        const recentTxns = transactions.filter(t => new Date(t.created_date) > thirtyDaysAgo);
        
        const chargebacks = await base44.entities.Chargeback.filter({ merchant_id: merchantId });
        const recentCBs = chargebacks.filter(cb => new Date(cb.created_date) > thirtyDaysAgo);
        
        // Chargeback checks
        if (recentCBs.length >= THRESHOLDS.CHARGEBACK_COUNT) {
            issues.push({
                type: 'excessive_chargebacks',
                severity: 'high',
                title: 'Excessive Chargebacks',
                description: `${recentCBs.length} chargebacks in last 30 days`,
                data: { count: recentCBs.length, threshold: THRESHOLDS.CHARGEBACK_COUNT }
            });
        }
        
        if (recentTxns.length > 0) {
            const cbRate = (recentCBs.length / recentTxns.length) * 100;
            if (cbRate >= THRESHOLDS.CHARGEBACK_RATE) {
                issues.push({
                    type: 'high_chargeback_rate',
                    severity: 'critical',
                    title: 'High Chargeback Rate',
                    description: `Chargeback rate: ${cbRate.toFixed(2)}%`,
                    data: { rate: cbRate, count: recentCBs.length, total: recentTxns.length }
                });
            }
            
            // Decline rate
            const declined = recentTxns.filter(t => t.status === 'declined' || t.status === 'failed');
            const declineRate = (declined.length / recentTxns.length) * 100;
            if (declineRate >= THRESHOLDS.DECLINE_RATE) {
                issues.push({
                    type: 'high_decline_rate',
                    severity: 'medium',
                    title: 'High Decline Rate',
                    description: `Decline rate: ${declineRate.toFixed(2)}%`,
                    data: { rate: declineRate, declined: declined.length, total: recentTxns.length }
                });
            }
        }
        
        return { issues, merchant };
    } catch (error) {
        console.error('Error checking compliance:', error);
        return { issues: [], error: error.message };
    }
}

async function handleComplianceIssue(base44, merchant, issue) {
    try {
        const ticketId = `TKT-COMP-${Date.now()}`;
        
        await base44.asServiceRole.entities.SupportTicket.create({
            ticket_id: ticketId,
            subject: `[Compliance Alert] ${issue.title} - ${merchant.business_name}`,
            description: `
Automated compliance alert for ${merchant.business_name} (${merchant.merchant_id})

Type: ${issue.type}
Severity: ${issue.severity}
${issue.description}

Details: ${JSON.stringify(issue.data, null, 2)}

Merchant: ${merchant.business_name}
MID: ${merchant.merchant_id}
Status: ${merchant.status}
Contact: ${merchant.contact_email}
            `,
            category: 'compliance',
            priority: issue.severity === 'critical' ? 'urgent' : issue.severity === 'high' ? 'high' : 'medium',
            status: 'open',
            requester_name: 'Compliance System',
            requester_email: 'compliance@system.internal',
            merchant_id: merchant.merchant_id
        });
        
        // Send merchant notification
        await sendMerchantNotification(base44, merchant, issue, ticketId);
        
        return { success: true, ticketId };
    } catch (error) {
        console.error('Error handling issue:', error);
        return { success: false, error: error.message };
    }
}

async function sendMerchantNotification(base44, merchant, issue, ticketId) {
    const actionSteps = {
        'high_chargeback_rate': 'Review recent transactions and customer service. High rates may result in restrictions.',
        'excessive_chargebacks': 'Multiple chargebacks detected. Implement fraud prevention measures.',
        'high_decline_rate': 'High decline rate may indicate payment issues or fraud attempts.',
        'aml_flag': 'AML alert triggered. Contact compliance team immediately with additional documentation.'
    };
    
    try {
        await base44.integrations.Core.SendEmail({
            to: merchant.contact_email,
            subject: `⚠️ Compliance Alert - ${issue.title}`,
            body: `
Dear ${merchant.contact_name || 'Valued Partner'},

Our compliance monitoring detected an issue with your account for ${merchant.business_name}.

ALERT: ${issue.title}
Severity: ${issue.severity.toUpperCase()}
Description: ${issue.description}

Reference: ${ticketId}

ACTION REQUIRED:
${actionSteps[issue.type] || 'Please contact our compliance team.'}

Next Steps:
1. Review your recent account activity
2. Take corrective action as outlined above
3. Contact compliance team with reference ${ticketId}
4. Respond within 24-48 hours to avoid restrictions

Contact: compliance@netxhub.tech

Best regards,
Compliance Team
            `
        });
    } catch (error) {
        console.error('Failed to send notification:', error);
    }
}

async function scanAllMerchants(base44) {
    const results = [];
    const merchants = await base44.entities.Merchant.filter({ status: 'active' });
    
    for (const merchant of merchants) {
        const { issues } = await checkMerchantCompliance(base44, merchant.merchant_id);
        
        for (const issue of issues) {
            const result = await handleComplianceIssue(base44, merchant, issue);
            results.push({
                merchant_id: merchant.merchant_id,
                business_name: merchant.business_name,
                issue: issue.title,
                severity: issue.severity,
                ticket_id: result.ticketId,
                success: result.success
            });
        }
    }
    
    return results;
}