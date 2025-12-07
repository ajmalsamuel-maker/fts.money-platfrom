import { base44 } from '@/api/base44Client';

/**
 * Real-time Transaction Monitoring Service
 * Detects suspicious activities, fraud patterns, and triggers alerts
 */

// Monitoring Rules Configuration
const MONITORING_RULES = {
    // Velocity Rules
    VELOCITY_THRESHOLD: 5, // transactions per hour
    VELOCITY_AMOUNT: 10000, // total amount per hour
    
    // Amount Rules
    HIGH_AMOUNT_THRESHOLD: 10000,
    SUSPICIOUS_AMOUNT_PATTERN: [9999, 9998, 9997], // Just below reporting thresholds
    
    // Geographic Rules
    RAPID_LOCATION_CHANGE_MINUTES: 30, // Same card, different countries
    HIGH_RISK_COUNTRIES: ['XX', 'YY', 'ZZ'], // Placeholder for high-risk country codes
    
    // Pattern Rules
    DECLINED_ATTEMPTS_THRESHOLD: 3,
    CARD_TESTING_PATTERN: 5, // Multiple small transactions in short time
    BIN_ATTACK_THRESHOLD: 10, // Multiple cards from same BIN
    
    // Time-based Rules
    UNUSUAL_HOUR_THRESHOLD: { start: 2, end: 5 }, // 2 AM - 5 AM local time
};

export class TransactionMonitoringService {
    
    /**
     * Main monitoring function - analyzes transaction for suspicious patterns
     */
    static async monitorTransaction(transaction, merchant) {
        const alerts = [];
        
        try {
            // Run all checks in parallel
            const [
                velocityCheck,
                amountCheck,
                geographicCheck,
                patternCheck,
                timeCheck,
                merchantRiskCheck
            ] = await Promise.all([
                this.checkVelocity(transaction, merchant),
                this.checkSuspiciousAmount(transaction),
                this.checkGeographicAnomaly(transaction, merchant),
                this.checkFraudPatterns(transaction, merchant),
                this.checkUnusualTiming(transaction),
                this.checkMerchantRisk(merchant)
            ]);
            
            // Collect all triggered alerts
            if (velocityCheck) alerts.push(velocityCheck);
            if (amountCheck) alerts.push(amountCheck);
            if (geographicCheck) alerts.push(geographicCheck);
            if (patternCheck) alerts.push(patternCheck);
            if (timeCheck) alerts.push(timeCheck);
            if (merchantRiskCheck) alerts.push(merchantRiskCheck);
            
            // Process alerts if any were triggered
            if (alerts.length > 0) {
                await this.processAlerts(alerts, transaction, merchant);
            }
            
            return { success: true, alerts };
            
        } catch (error) {
            console.error('Transaction monitoring error:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Check for velocity abuse (too many transactions in short time)
     */
    static async checkVelocity(transaction, merchant) {
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            
            const recentTransactions = await base44.entities.Transaction.filter({
                merchant_id: merchant.id,
                created_date: { $gte: oneHourAgo }
            });
            
            const totalAmount = recentTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
            
            if (recentTransactions.length > MONITORING_RULES.VELOCITY_THRESHOLD || 
                totalAmount > MONITORING_RULES.VELOCITY_AMOUNT) {
                return {
                    type: 'velocity',
                    severity: 'high',
                    title: 'High Transaction Velocity Detected',
                    description: `${recentTransactions.length} transactions totaling $${totalAmount.toFixed(2)} in the last hour`,
                    details: {
                        transaction_count: recentTransactions.length,
                        total_amount: totalAmount,
                        threshold_count: MONITORING_RULES.VELOCITY_THRESHOLD,
                        threshold_amount: MONITORING_RULES.VELOCITY_AMOUNT
                    }
                };
            }
        } catch (error) {
            console.error('Velocity check error:', error);
        }
        return null;
    }
    
    /**
     * Check for suspicious transaction amounts
     */
    static async checkSuspiciousAmount(transaction) {
        const amount = transaction.amount || 0;
        
        // Check for high amounts
        if (amount > MONITORING_RULES.HIGH_AMOUNT_THRESHOLD) {
            return {
                type: 'high_amount',
                severity: 'medium',
                title: 'High Transaction Amount',
                description: `Transaction amount $${amount.toFixed(2)} exceeds threshold`,
                details: {
                    amount: amount,
                    threshold: MONITORING_RULES.HIGH_AMOUNT_THRESHOLD
                }
            };
        }
        
        // Check for amounts just below reporting thresholds (structuring)
        const isStructuring = MONITORING_RULES.SUSPICIOUS_AMOUNT_PATTERN.some(
            pattern => Math.abs(amount - pattern) < 10
        );
        
        if (isStructuring) {
            return {
                type: 'structuring',
                severity: 'high',
                title: 'Potential Structuring Detected',
                description: `Transaction amount $${amount.toFixed(2)} matches suspicious pattern`,
                details: {
                    amount: amount,
                    pattern: 'just_below_threshold'
                }
            };
        }
        
        return null;
    }
    
    /**
     * Check for geographic anomalies
     */
    static async checkGeographicAnomaly(transaction, merchant) {
        const country = transaction.customer_country;
        
        // Check high-risk countries
        if (MONITORING_RULES.HIGH_RISK_COUNTRIES.includes(country)) {
            return {
                type: 'geographic',
                severity: 'medium',
                title: 'High-Risk Geographic Location',
                description: `Transaction from high-risk country: ${country}`,
                details: {
                    country: country,
                    merchant_country: merchant.country
                }
            };
        }
        
        // Check for rapid location changes (same card)
        if (transaction.card_last_four) {
            try {
                const recentTransactions = await base44.entities.Transaction.filter({
                    merchant_id: merchant.id,
                    card_last_four: transaction.card_last_four,
                    created_date: { $gte: new Date(Date.now() - 30 * 60 * 1000).toISOString() }
                });
                
                const uniqueCountries = [...new Set(recentTransactions.map(tx => tx.customer_country))];
                if (uniqueCountries.length > 2) {
                    return {
                        type: 'rapid_location_change',
                        severity: 'high',
                        title: 'Rapid Geographic Location Changes',
                        description: `Same card used in ${uniqueCountries.length} different countries within 30 minutes`,
                        details: {
                            countries: uniqueCountries,
                            card_last_four: transaction.card_last_four
                        }
                    };
                }
            } catch (error) {
                console.error('Geographic check error:', error);
            }
        }
        
        return null;
    }
    
    /**
     * Check for fraud patterns (card testing, BIN attacks, etc.)
     */
    static async checkFraudPatterns(transaction, merchant) {
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            
            const recentTransactions = await base44.entities.Transaction.filter({
                merchant_id: merchant.id,
                created_date: { $gte: fiveMinutesAgo }
            });
            
            // Card testing detection (multiple small amounts)
            const smallTransactions = recentTransactions.filter(tx => (tx.amount || 0) < 5);
            if (smallTransactions.length >= MONITORING_RULES.CARD_TESTING_PATTERN) {
                return {
                    type: 'card_testing',
                    severity: 'critical',
                    title: 'Card Testing Pattern Detected',
                    description: `${smallTransactions.length} small transactions detected in 5 minutes`,
                    details: {
                        transaction_count: smallTransactions.length,
                        threshold: MONITORING_RULES.CARD_TESTING_PATTERN
                    }
                };
            }
            
            // Declined transaction pattern
            const declinedCount = recentTransactions.filter(tx => tx.status === 'declined').length;
            if (declinedCount >= MONITORING_RULES.DECLINED_ATTEMPTS_THRESHOLD) {
                return {
                    type: 'declined_pattern',
                    severity: 'high',
                    title: 'Multiple Declined Transactions',
                    description: `${declinedCount} declined transactions in 5 minutes`,
                    details: {
                        declined_count: declinedCount,
                        threshold: MONITORING_RULES.DECLINED_ATTEMPTS_THRESHOLD
                    }
                };
            }
            
            // BIN attack detection (multiple cards from same BIN)
            if (transaction.card_last_four) {
                const cardBins = recentTransactions
                    .map(tx => tx.card_last_four?.substring(0, 6))
                    .filter(Boolean);
                const uniqueCards = [...new Set(recentTransactions.map(tx => tx.card_last_four))];
                
                if (uniqueCards.length >= MONITORING_RULES.BIN_ATTACK_THRESHOLD) {
                    return {
                        type: 'bin_attack',
                        severity: 'critical',
                        title: 'Potential BIN Attack',
                        description: `${uniqueCards.length} different cards used in 5 minutes`,
                        details: {
                            card_count: uniqueCards.length,
                            threshold: MONITORING_RULES.BIN_ATTACK_THRESHOLD
                        }
                    };
                }
            }
            
        } catch (error) {
            console.error('Pattern check error:', error);
        }
        
        return null;
    }
    
    /**
     * Check for unusual transaction timing
     */
    static async checkUnusualTiming(transaction) {
        const hour = new Date().getHours();
        const { start, end } = MONITORING_RULES.UNUSUAL_HOUR_THRESHOLD;
        
        if (hour >= start && hour <= end) {
            return {
                type: 'unusual_timing',
                severity: 'low',
                title: 'Unusual Transaction Time',
                description: `Transaction during unusual hours (${hour}:00)`,
                details: {
                    hour: hour,
                    threshold_start: start,
                    threshold_end: end
                }
            };
        }
        
        return null;
    }
    
    /**
     * Check merchant risk profile
     */
    static async checkMerchantRisk(merchant) {
        if (merchant.risk_level === 'high') {
            return {
                type: 'merchant_risk',
                severity: 'medium',
                title: 'High-Risk Merchant',
                description: `Merchant ${merchant.business_name} is flagged as high-risk`,
                details: {
                    merchant_id: merchant.merchant_id,
                    risk_level: merchant.risk_level,
                    aml_status: merchant.aml_status
                }
            };
        }
        return null;
    }
    
    /**
     * Process triggered alerts - create alert records, tickets, and notify
     */
    static async processAlerts(alerts, transaction, merchant) {
        for (const alert of alerts) {
            try {
                // Create RiskAlert record
                const riskAlert = await base44.entities.RiskAlert.create({
                    alert_id: `RA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    merchant_id: merchant.id,
                    merchant_name: merchant.business_name,
                    alert_type: alert.type,
                    severity: alert.severity,
                    status: 'open',
                    description: alert.title,
                    details: JSON.stringify(alert.details),
                    affected_transactions: 1,
                    affected_amount: transaction.amount || 0,
                    recommended_action: this.getRecommendedAction(alert.type, alert.severity)
                });
                
                // Create support ticket for critical and high severity alerts
                if (alert.severity === 'critical' || alert.severity === 'high') {
                    await this.createSupportTicket(alert, transaction, merchant, riskAlert);
                }
                
                // Send merchant notification for critical alerts
                if (alert.severity === 'critical') {
                    await this.notifyMerchant(alert, transaction, merchant, riskAlert);
                }
                
            } catch (error) {
                console.error('Error processing alert:', error);
            }
        }
    }
    
    /**
     * Get recommended action based on alert type and severity
     */
    static getRecommendedAction(alertType, severity) {
        const actions = {
            velocity: 'Review recent transaction history and consider temporary rate limiting',
            high_amount: 'Verify transaction with merchant and customer',
            structuring: 'Investigate for potential money laundering - file SAR if confirmed',
            geographic: 'Verify customer location and merchant shipping address',
            rapid_location_change: 'Flag for fraud review - likely stolen card',
            card_testing: 'Block IP address and implement CAPTCHA - report to card networks',
            declined_pattern: 'Enable additional authentication (3DS) for this customer',
            bin_attack: 'Emergency block - report to card networks immediately',
            unusual_timing: 'Monitor for additional suspicious patterns',
            merchant_risk: 'Enhanced monitoring and verification required'
        };
        
        const action = actions[alertType] || 'Review and investigate transaction';
        
        if (severity === 'critical') {
            return `URGENT: ${action}`;
        }
        
        return action;
    }
    
    /**
     * Create support ticket for PSP review
     */
    static async createSupportTicket(alert, transaction, merchant, riskAlert) {
        try {
            const ticket = await base44.entities.SupportTicket.create({
                ticket_id: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                subject: `🚨 ${alert.title} - ${merchant.business_name}`,
                description: `
Automated Fraud Detection Alert

Alert Type: ${alert.type}
Severity: ${alert.severity.toUpperCase()}
Merchant: ${merchant.business_name} (${merchant.merchant_id})
Transaction ID: ${transaction.transaction_id || transaction.id}
Amount: $${(transaction.amount || 0).toFixed(2)}

Details:
${alert.description}

${JSON.stringify(alert.details, null, 2)}

Risk Alert ID: ${riskAlert.alert_id}
Recommended Action: ${riskAlert.recommended_action}

This ticket was automatically generated by the Transaction Monitoring System.
Please review and take appropriate action immediately.
                `.trim(),
                category: 'compliance',
                priority: alert.severity === 'critical' ? 'urgent' : 'high',
                status: 'open',
                requester_name: 'Fraud Detection System',
                requester_email: 'fraud-alerts@system.internal',
                merchant_id: merchant.id
            });
            
            return ticket;
            
        } catch (error) {
            console.error('Error creating support ticket:', error);
            throw error;
        }
    }
    
    /**
     * Send notification email to merchant
     */
    static async notifyMerchant(alert, transaction, merchant, riskAlert) {
        try {
            const emailBody = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Security Alert</h1>
        </div>
        
        <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #dc2626; margin-top: 0;">${alert.title}</h2>
            
            <p>Dear ${merchant.contact_name || 'Merchant'},</p>
            
            <p>Our fraud detection system has identified suspicious activity on your account that requires immediate attention.</p>
            
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">Alert Details:</p>
                <ul style="margin: 10px 0;">
                    <li><strong>Type:</strong> ${alert.type}</li>
                    <li><strong>Severity:</strong> ${alert.severity.toUpperCase()}</li>
                    <li><strong>Transaction ID:</strong> ${transaction.transaction_id || 'N/A'}</li>
                    <li><strong>Amount:</strong> $${(transaction.amount || 0).toFixed(2)}</li>
                    <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                </ul>
            </div>
            
            <p><strong>Description:</strong><br/>${alert.description}</p>
            
            <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px;"><strong>Recommended Action:</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">${riskAlert.recommended_action}</p>
            </div>
            
            <p style="margin-top: 20px;">
                <strong>What should you do?</strong>
            </p>
            <ol>
                <li>Review the transaction details in your merchant portal</li>
                <li>Verify the transaction with your customer if possible</li>
                <li>Contact our support team if you need assistance</li>
                <li>Take any recommended actions to secure your account</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Review in Portal</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            
            <p style="font-size: 12px; color: #6b7280;">
                <strong>Reference:</strong> ${riskAlert.alert_id}<br/>
                This is an automated security notification. If you have questions, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>
            `.trim();
            
            await base44.integrations.Core.SendEmail({
                to: merchant.contact_email,
                subject: `🚨 Security Alert: ${alert.title}`,
                body: emailBody
            });
            
        } catch (error) {
            console.error('Error sending merchant notification:', error);
            throw error;
        }
    }
    
    /**
     * Manual scan of merchant transactions
     */
    static async scanMerchantTransactions(merchantId) {
        try {
            const merchant = await base44.entities.Merchant.filter({ id: merchantId });
            if (!merchant || merchant.length === 0) {
                throw new Error('Merchant not found');
            }
            
            // Get recent transactions (last 24 hours)
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const transactions = await base44.entities.Transaction.filter({
                merchant_id: merchantId,
                created_date: { $gte: oneDayAgo }
            });
            
            const results = {
                scanned: transactions.length,
                alerts: [],
                timestamp: new Date().toISOString()
            };
            
            // Analyze each transaction
            for (const transaction of transactions) {
                const { alerts } = await this.monitorTransaction(transaction, merchant[0]);
                if (alerts.length > 0) {
                    results.alerts.push(...alerts);
                }
            }
            
            return results;
            
        } catch (error) {
            console.error('Error scanning merchant transactions:', error);
            throw error;
        }
    }
}

export default TransactionMonitoringService;