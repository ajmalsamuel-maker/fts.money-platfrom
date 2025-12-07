// Automated Compliance Alert Service
// Monitors merchant activity and triggers alerts for compliance issues
import { base44 } from '@/api/base44Client';

export const COMPLIANCE_THRESHOLDS = {
    CHARGEBACK_RATE: 1.0, // 1% threshold
    CHARGEBACK_COUNT_30_DAYS: 10,
    DECLINE_RATE: 15.0, // 15% threshold
    TRANSACTION_VOLUME_SPIKE: 200, // 200% increase
    HIGH_RISK_COUNTRY_PERCENTAGE: 30, // 30% of transactions
    RAPID_TRANSACTION_COUNT: 50, // transactions in 1 hour
};

export const COMPLIANCE_ISSUE_TYPES = {
    HIGH_CHARGEBACK_RATE: 'high_chargeback_rate',
    EXCESSIVE_CHARGEBACKS: 'excessive_chargebacks',
    HIGH_DECLINE_RATE: 'high_decline_rate',
    VOLUME_SPIKE: 'volume_spike',
    SUSPICIOUS_PATTERN: 'suspicious_pattern',
    AML_FLAG: 'aml_flag',
    HIGH_RISK_GEOGRAPHY: 'high_risk_geography',
    RAPID_TRANSACTIONS: 'rapid_transactions',
};

// Check for compliance issues for a specific merchant
export const checkMerchantCompliance = async (merchantId) => {
    const issues = [];
    
    try {
        // Get merchant data
        const merchants = await base44.entities.Merchant.filter({ merchant_id: merchantId });
        if (!merchants || merchants.length === 0) return issues;
        
        const merchant = merchants[0];
        
        // Check AML status
        if (merchant.aml_status === 'flagged' || merchant.aml_status === 'blocked') {
            issues.push({
                type: COMPLIANCE_ISSUE_TYPES.AML_FLAG,
                severity: 'critical',
                title: 'AML Alert Triggered',
                description: `Merchant has been flagged by AML screening with status: ${merchant.aml_status}`,
                data: {
                    aml_status: merchant.aml_status,
                    aml_risk_score: merchant.aml_risk_score
                }
            });
        }
        
        // Check high AML risk score
        if (merchant.aml_risk_score && merchant.aml_risk_score >= 70) {
            issues.push({
                type: COMPLIANCE_ISSUE_TYPES.AML_FLAG,
                severity: 'high',
                title: 'High AML Risk Score',
                description: `Merchant has a high AML risk score of ${merchant.aml_risk_score}/100`,
                data: {
                    aml_risk_score: merchant.aml_risk_score
                }
            });
        }
        
        // Get recent transactions (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const transactions = await base44.entities.Transaction.filter({ 
            merchant_id: merchantId 
        });
        
        const recentTransactions = transactions.filter(t => 
            new Date(t.created_date) > thirtyDaysAgo
        );
        
        // Calculate chargeback metrics
        const chargebacks = await base44.entities.Chargeback.filter({ 
            merchant_id: merchantId 
        });
        
        const recentChargebacks = chargebacks.filter(cb => 
            new Date(cb.created_date) > thirtyDaysAgo
        );
        
        // Check chargeback count
        if (recentChargebacks.length >= COMPLIANCE_THRESHOLDS.CHARGEBACK_COUNT_30_DAYS) {
            issues.push({
                type: COMPLIANCE_ISSUE_TYPES.EXCESSIVE_CHARGEBACKS,
                severity: 'high',
                title: 'Excessive Chargebacks',
                description: `${recentChargebacks.length} chargebacks in the last 30 days (threshold: ${COMPLIANCE_THRESHOLDS.CHARGEBACK_COUNT_30_DAYS})`,
                data: {
                    chargeback_count: recentChargebacks.length,
                    threshold: COMPLIANCE_THRESHOLDS.CHARGEBACK_COUNT_30_DAYS
                }
            });
        }
        
        // Check chargeback rate
        if (recentTransactions.length > 0) {
            const chargebackRate = (recentChargebacks.length / recentTransactions.length) * 100;
            
            if (chargebackRate >= COMPLIANCE_THRESHOLDS.CHARGEBACK_RATE) {
                issues.push({
                    type: COMPLIANCE_ISSUE_TYPES.HIGH_CHARGEBACK_RATE,
                    severity: 'critical',
                    title: 'High Chargeback Rate',
                    description: `Chargeback rate is ${chargebackRate.toFixed(2)}% (threshold: ${COMPLIANCE_THRESHOLDS.CHARGEBACK_RATE}%)`,
                    data: {
                        chargeback_rate: chargebackRate,
                        chargeback_count: recentChargebacks.length,
                        transaction_count: recentTransactions.length
                    }
                });
            }
        }
        
        // Check decline rate
        const declinedTransactions = recentTransactions.filter(t => 
            t.status === 'declined' || t.status === 'failed'
        );
        
        if (recentTransactions.length > 0) {
            const declineRate = (declinedTransactions.length / recentTransactions.length) * 100;
            
            if (declineRate >= COMPLIANCE_THRESHOLDS.DECLINE_RATE) {
                issues.push({
                    type: COMPLIANCE_ISSUE_TYPES.HIGH_DECLINE_RATE,
                    severity: 'medium',
                    title: 'High Decline Rate',
                    description: `Transaction decline rate is ${declineRate.toFixed(2)}% (threshold: ${COMPLIANCE_THRESHOLDS.DECLINE_RATE}%)`,
                    data: {
                        decline_rate: declineRate,
                        declined_count: declinedTransactions.length,
                        total_count: recentTransactions.length
                    }
                });
            }
        }
        
        // Check for volume spikes (compare last 7 days to previous 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        
        const lastWeekTransactions = recentTransactions.filter(t => 
            new Date(t.created_date) > sevenDaysAgo
        );
        const previousWeekTransactions = recentTransactions.filter(t => 
            new Date(t.created_date) > fourteenDaysAgo && new Date(t.created_date) <= sevenDaysAgo
        );
        
        if (previousWeekTransactions.length > 0) {
            const volumeIncrease = ((lastWeekTransactions.length - previousWeekTransactions.length) / previousWeekTransactions.length) * 100;
            
            if (volumeIncrease >= COMPLIANCE_THRESHOLDS.TRANSACTION_VOLUME_SPIKE) {
                issues.push({
                    type: COMPLIANCE_ISSUE_TYPES.VOLUME_SPIKE,
                    severity: 'high',
                    title: 'Suspicious Volume Spike',
                    description: `Transaction volume increased by ${volumeIncrease.toFixed(0)}% in the last 7 days`,
                    data: {
                        volume_increase: volumeIncrease,
                        last_week_count: lastWeekTransactions.length,
                        previous_week_count: previousWeekTransactions.length
                    }
                });
            }
        }
        
        // Check for rapid transactions (50+ in 1 hour)
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        
        const lastHourTransactions = recentTransactions.filter(t => 
            new Date(t.created_date) > oneHourAgo
        );
        
        if (lastHourTransactions.length >= COMPLIANCE_THRESHOLDS.RAPID_TRANSACTION_COUNT) {
            issues.push({
                type: COMPLIANCE_ISSUE_TYPES.RAPID_TRANSACTIONS,
                severity: 'high',
                title: 'Rapid Transaction Activity',
                description: `${lastHourTransactions.length} transactions detected in the last hour`,
                data: {
                    transaction_count: lastHourTransactions.length,
                    threshold: COMPLIANCE_THRESHOLDS.RAPID_TRANSACTION_COUNT
                }
            });
        }
        
        // Check high-risk geography
        const highRiskCountries = ['NG', 'PK', 'BD', 'VN', 'ID', 'MY', 'PH'];
        const highRiskTransactions = recentTransactions.filter(t => 
            highRiskCountries.includes(t.customer_country)
        );
        
        if (recentTransactions.length > 0) {
            const highRiskPercentage = (highRiskTransactions.length / recentTransactions.length) * 100;
            
            if (highRiskPercentage >= COMPLIANCE_THRESHOLDS.HIGH_RISK_COUNTRY_PERCENTAGE) {
                issues.push({
                    type: COMPLIANCE_ISSUE_TYPES.HIGH_RISK_GEOGRAPHY,
                    severity: 'medium',
                    title: 'High-Risk Geography Activity',
                    description: `${highRiskPercentage.toFixed(1)}% of transactions from high-risk countries`,
                    data: {
                        high_risk_percentage: highRiskPercentage,
                        high_risk_count: highRiskTransactions.length,
                        total_count: recentTransactions.length
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('Error checking merchant compliance:', error);
    }
    
    return issues;
};

// Create support ticket and notify merchant
export const handleComplianceIssue = async (merchant, issue) => {
    try {
        // Create support ticket for PSP admin
        const ticketId = `TKT-COMP-${Date.now()}`;
        await base44.entities.SupportTicket.create({
            ticket_id: ticketId,
            subject: `[Compliance Alert] ${issue.title} - ${merchant.business_name}`,
            description: `
Automated compliance alert detected for merchant ${merchant.business_name} (${merchant.merchant_id}).

Issue Type: ${issue.type}
Severity: ${issue.severity}
Description: ${issue.description}

Details:
${JSON.stringify(issue.data, null, 2)}

Merchant Information:
- Business Name: ${merchant.business_name}
- MID: ${merchant.merchant_id}
- Status: ${merchant.status}
- Risk Level: ${merchant.risk_level}
- AML Status: ${merchant.aml_status}
- Contact: ${merchant.contact_email}

Please review this alert and take appropriate action.
            `,
            category: 'compliance',
            priority: issue.severity === 'critical' ? 'urgent' : issue.severity === 'high' ? 'high' : 'medium',
            status: 'open',
            requester_name: 'Compliance Monitoring System',
            requester_email: 'compliance@system.internal',
            merchant_id: merchant.merchant_id
        });
        
        // Send notification to merchant
        await sendMerchantComplianceNotification({
            merchantEmail: merchant.contact_email,
            merchantName: merchant.contact_name || 'Valued Partner',
            businessName: merchant.business_name,
            issue: issue,
            ticketId: ticketId
        });
        
        return { success: true, ticketId };
    } catch (error) {
        console.error('Error handling compliance issue:', error);
        return { success: false, error: error.message };
    }
};

// Send compliance notification to merchant
export const sendMerchantComplianceNotification = async ({
    merchantEmail,
    merchantName,
    businessName,
    issue,
    ticketId
}) => {
    try {
        // Get PSP settings for branding
        const pspSettings = await base44.entities.PSPSettings.list();
        const themeSettings = await base44.entities.ThemeSettings.list();
        
        const companyName = pspSettings?.[0]?.company_name || 'netXhub.tech';
        const supportEmail = pspSettings?.[0]?.support_email || 'support@netxhub.tech';
        const logoUrl = themeSettings?.[0]?.logo_url;
        const primaryColor = themeSettings?.[0]?.primary_color || '#3b82f6';
        
        const severityColors = {
            critical: '#ef4444',
            high: '#f97316',
            medium: '#eab308',
            low: '#3b82f6'
        };
        
        const actionSteps = {
            [COMPLIANCE_ISSUE_TYPES.HIGH_CHARGEBACK_RATE]: 'Please review your recent transactions and customer service processes. High chargeback rates may result in account restrictions.',
            [COMPLIANCE_ISSUE_TYPES.EXCESSIVE_CHARGEBACKS]: 'Multiple chargebacks have been detected. Please investigate and implement fraud prevention measures.',
            [COMPLIANCE_ISSUE_TYPES.HIGH_DECLINE_RATE]: 'Your transaction decline rate is higher than normal. This may indicate payment processing issues or fraud attempts.',
            [COMPLIANCE_ISSUE_TYPES.VOLUME_SPIKE]: 'Unusual transaction volume detected. If this is legitimate business growth, please contact us to update your account limits.',
            [COMPLIANCE_ISSUE_TYPES.AML_FLAG]: 'Your account has triggered an AML alert. Please contact our compliance team immediately to provide additional documentation.',
            [COMPLIANCE_ISSUE_TYPES.HIGH_RISK_GEOGRAPHY]: 'High percentage of transactions from high-risk countries detected. Please verify these are legitimate business transactions.',
            [COMPLIANCE_ISSUE_TYPES.RAPID_TRANSACTIONS]: 'Unusual transaction frequency detected. If this is normal for your business, please contact us to adjust your account settings.'
        };
        
        await base44.integrations.Core.SendEmail({
            to: merchantEmail,
            subject: `⚠️ Compliance Alert - ${issue.title}`,
            body: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <!-- Alert Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, ${severityColors[issue.severity]}, #dc2626); padding: 40px 20px; text-align: center;">
                            ${logoUrl ? `
                            <img src="${logoUrl}" alt="${companyName}" style="max-width: 150px; max-height: 60px; height: auto; width: auto; display: block; margin: 0 auto 20px auto;" />
                            ` : ''}
                            <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
                            <h1 style="color: white; margin: 0; font-size: 24px;">Compliance Alert</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">${issue.severity} Priority</p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                                Dear ${merchantName},
                            </p>
                            
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                                Our automated compliance monitoring system has detected an issue with your merchant account for <strong>${businessName}</strong>.
                            </p>
                            
                            <!-- Alert Details -->
                            <div style="margin: 30px 0; padding: 20px; background: #fef2f2; border-radius: 8px; border-left: 4px solid ${severityColors[issue.severity]};">
                                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #1e293b;">${issue.title}</h3>
                                <p style="margin: 0 0 15px 0; font-size: 14px; color: #475569; line-height: 1.6;">${issue.description}</p>
                                
                                <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px;">
                                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">Reference Number:</p>
                                    <p style="margin: 0; font-size: 14px; font-family: monospace; color: #1e293b; font-weight: bold;">${ticketId}</p>
                                </div>
                            </div>
                            
                            <!-- Action Required -->
                            <div style="margin: 30px 0; padding: 20px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid ${primaryColor};">
                                <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">Action Required</h3>
                                <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.6;">${actionSteps[issue.type] || 'Please contact our compliance team to discuss this alert.'}</p>
                            </div>
                            
                            <!-- Next Steps -->
                            <div style="margin: 30px 0;">
                                <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">Next Steps</h3>
                                <ol style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                                    <li>Review your recent account activity</li>
                                    <li>Take corrective action as outlined above</li>
                                    <li>Contact our compliance team if you have questions</li>
                                    <li>Respond with reference number ${ticketId}</li>
                                </ol>
                            </div>
                            
                            <div style="margin: 30px 0; padding: 15px; background: #fff7ed; border-radius: 6px;">
                                <p style="margin: 0; font-size: 13px; color: #92400e;">
                                    <strong>⏰ Time Sensitive:</strong> Please address this alert within 24-48 hours to avoid potential account restrictions.
                                </p>
                            </div>
                            
                            <p style="margin: 30px 0 0 0; font-size: 14px; color: #64748b; line-height: 1.6;">
                                If you believe this alert was triggered in error or need assistance, please contact us immediately.
                            </p>
                            
                            <p style="margin: 20px 0 0 0; font-size: 14px; color: #475569;">
                                Best regards,<br/>
                                <strong>${companyName} Compliance Team</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #475569;">
                                <strong>Need Help?</strong> Contact us at <a href="mailto:${supportEmail}" style="color: ${primaryColor}; text-decoration: none;">${supportEmail}</a>
                            </p>
                            <p style="margin: 0 0 15px 0; font-size: 12px; color: #94a3b8;">
                                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                                This is an automated compliance notification. Reference: ${ticketId}
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `
        });
        
        return true;
    } catch (error) {
        console.error('Failed to send merchant compliance notification:', error);
        return false;
    }
};

// Scan all merchants for compliance issues
export const scanAllMerchants = async () => {
    try {
        const merchants = await base44.entities.Merchant.filter({ 
            status: 'active' 
        });
        
        const results = [];
        
        for (const merchant of merchants) {
            const issues = await checkMerchantCompliance(merchant.merchant_id);
            
            if (issues.length > 0) {
                for (const issue of issues) {
                    const result = await handleComplianceIssue(merchant, issue);
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
        }
        
        return results;
    } catch (error) {
        console.error('Error scanning merchants:', error);
        return [];
    }
};