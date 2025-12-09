import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Unified Payment Routing Engine
 * 
 * Flow:
 * 1. Receive transaction parameters
 * 2. Apply orchestration rules to select MerchantMID
 * 3. Apply MID routing rules to select BankMID (with priority-based failover)
 * 4. Return complete routing path and execute transaction
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            merchant_id,
            amount,
            currency,
            card_type,
            country,
            transaction_type = 'sale',
            simulate_only = false
        } = await req.json();

        if (!merchant_id || !amount || !currency) {
            return Response.json({ 
                error: 'Missing required parameters: merchant_id, amount, currency' 
            }, { status: 400 });
        }

        // Step 1: Get merchant details
        const merchant = await base44.entities.Merchant.filter({ merchant_id });
        if (!merchant || merchant.length === 0) {
            return Response.json({ error: 'Merchant not found' }, { status: 404 });
        }

        // Step 2: Select appropriate MerchantMID using orchestration rules
        const merchantMIDs = await base44.entities.MerchantMID.filter({ 
            merchant_id: merchant[0].id,
            status: 'active'
        });

        if (merchantMIDs.length === 0) {
            return Response.json({ 
                error: 'No active Merchant MIDs found',
                path: null
            }, { status: 404 });
        }

        // Apply orchestration logic
        const selectedMerchantMID = await selectMerchantMID(
            base44, 
            merchantMIDs, 
            { amount, currency, card_type, country, transaction_type }
        );

        if (!selectedMerchantMID) {
            return Response.json({ 
                error: 'No suitable Merchant MID found',
                path: null
            }, { status: 404 });
        }

        // Step 3: Get MID routing rules (priority-based)
        const routingRules = await base44.entities.MIDRoutingRule.filter({
            merchant_mid_id: selectedMerchantMID.id,
            status: 'active'
        });

        if (routingRules.length === 0) {
            return Response.json({ 
                error: 'No routing rules configured for this MID',
                path: {
                    merchant: merchant[0],
                    merchantMID: selectedMerchantMID,
                    bankMID: null,
                    processor: null
                }
            }, { status: 404 });
        }

        // Sort by priority
        routingRules.sort((a, b) => a.priority - b.priority);

        // Step 4: Try each routing rule in priority order (failover logic)
        let selectedBankMID = null;
        let selectedProcessor = null;
        let routingPath = [];

        for (const rule of routingRules) {
            const bankMID = await base44.entities.BankMID.filter({ id: rule.bank_mid_id });
            
            if (bankMID && bankMID.length > 0 && bankMID[0].status === 'active') {
                // Check if conditions match
                if (evaluateRoutingConditions(rule.routing_conditions, { amount, currency, card_type, country })) {
                    selectedBankMID = bankMID[0];
                    
                    // Get processor details
                    if (selectedBankMID.acquirer_id) {
                        const processor = await base44.entities.PaymentProvider.filter({ 
                            id: selectedBankMID.acquirer_id 
                        });
                        if (processor && processor.length > 0) {
                            selectedProcessor = processor[0];
                        }
                    }

                    routingPath.push({
                        priority: rule.priority,
                        bankMID: selectedBankMID,
                        processor: selectedProcessor,
                        status: 'selected',
                        failover_enabled: rule.failover_enabled
                    });

                    break; // Found primary route
                }
            }

            // Add to path as potential failover
            if (rule.failover_enabled) {
                routingPath.push({
                    priority: rule.priority,
                    bankMID: bankMID[0],
                    status: 'failover',
                    failover_enabled: true
                });
            }
        }

        if (!selectedBankMID) {
            return Response.json({ 
                error: 'No suitable Bank MID found',
                path: {
                    merchant: merchant[0],
                    merchantMID: selectedMerchantMID,
                    bankMID: null,
                    processor: null,
                    routingPath
                }
            }, { status: 404 });
        }

        // Step 5: Build complete routing path
        const completePath = {
            merchant: {
                id: merchant[0].id,
                merchant_id: merchant[0].merchant_id,
                business_name: merchant[0].business_name,
                country: merchant[0].country,
                currency: merchant[0].currency
            },
            merchantMID: {
                id: selectedMerchantMID.id,
                mid: selectedMerchantMID.mid,
                account_type: selectedMerchantMID.account_type,
                currency: selectedMerchantMID.currency
            },
            bankMID: {
                id: selectedBankMID.id,
                bank_mid_id: selectedBankMID.bank_mid_id,
                bank_mid_name: selectedBankMID.bank_mid_name,
                acquirer_name: selectedBankMID.acquirer_name,
                success_rate: selectedBankMID.success_rate,
                currency: selectedBankMID.currency
            },
            processor: selectedProcessor ? {
                id: selectedProcessor.id,
                name: selectedProcessor.name,
                type: selectedProcessor.type,
                status: selectedProcessor.status
            } : null,
            routingDecision: {
                orchestration: 'Merchant MID selected based on transaction parameters',
                midRouting: `Bank MID selected via priority ${routingPath[0]?.priority}`,
                failoverAvailable: routingPath.length > 1,
                failoverOptions: routingPath.slice(1).map(r => ({
                    priority: r.priority,
                    bank_mid: r.bankMID?.bank_mid_name
                }))
            },
            transaction: {
                amount,
                currency,
                card_type,
                country,
                transaction_type
            },
            timestamp: new Date().toISOString()
        };

        // Step 6: Execute or simulate
        if (simulate_only) {
            return Response.json({ 
                success: true,
                mode: 'simulation',
                path: completePath,
                estimated: {
                    success_rate: selectedBankMID.success_rate || 98,
                    avg_latency_ms: selectedBankMID.avg_response_time_ms || 250,
                    fee_estimate: calculateFee(amount, selectedMerchantMID, selectedBankMID)
                }
            });
        }

        // In production, this would actually process the transaction
        // For now, return the routing decision
        return Response.json({ 
            success: true,
            mode: 'route_determined',
            path: completePath,
            next_step: 'Ready to process transaction via selected processor'
        });

    } catch (error) {
        console.error('Routing engine error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

// Helper: Select best Merchant MID based on orchestration rules
async function selectMerchantMID(base44, merchantMIDs, params) {
    const { amount, currency, transaction_type, country } = params;

    // Get orchestration rules
    const orchestrationRules = await base44.entities.RoutingRule.filter({ status: 'active' });
    orchestrationRules.sort((a, b) => (a.priority || 100) - (b.priority || 100));

    // Apply orchestration rules
    for (const rule of orchestrationRules) {
        for (const mid of merchantMIDs) {
            // Check currency match
            if (mid.currency === currency) {
                // Check amount range
                if (rule.min_amount && amount < rule.min_amount) continue;
                if (rule.max_amount && amount > rule.max_amount) continue;

                // Check transaction type
                if (rule.card_networks && rule.card_networks.length > 0) {
                    // Additional logic for card type matching
                }

                // Check country
                if (rule.countries && rule.countries.length > 0) {
                    if (country && !rule.countries.includes(country)) continue;
                }

                // Found matching MID
                return mid;
            }
        }
    }

    // Default: return first matching by currency
    return merchantMIDs.find(m => m.currency === currency) || merchantMIDs[0];
}

// Helper: Evaluate routing conditions
function evaluateRoutingConditions(conditions, params) {
    if (!conditions) return true;

    const { amount, currency, card_type, country } = params;

    // Check amount range
    if (conditions.min_amount && amount < conditions.min_amount) return false;
    if (conditions.max_amount && amount > conditions.max_amount) return false;

    // Check currency
    if (conditions.currencies && conditions.currencies.length > 0) {
        if (!conditions.currencies.includes(currency)) return false;
    }

    // Check card type
    if (conditions.card_types && conditions.card_types.length > 0) {
        if (card_type && !conditions.card_types.includes(card_type)) return false;
    }

    // Check country
    if (conditions.countries && conditions.countries.length > 0) {
        if (country && !conditions.countries.includes(country)) return false;
    }

    return true;
}

// Helper: Calculate fee
function calculateFee(amount, merchantMID, bankMID) {
    const percentageFee = (merchantMID.fee_percentage || 2.5) / 100;
    const fixedFee = merchantMID.fee_fixed || 0.30;
    return (amount * percentageFee + fixedFee).toFixed(2);
}