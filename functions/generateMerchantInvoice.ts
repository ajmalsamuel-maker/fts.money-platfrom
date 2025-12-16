import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, merchant_id, psp_code, billing_period_start, billing_period_end, invoice_id } = await req.json();

        // Generate Invoice
        if (action === 'generate') {
            // Fetch merchant
            const merchants = await base44.asServiceRole.entities.Merchant.filter({ 
                id: merchant_id, 
                psp_code 
            });
            
            if (!merchants.length) {
                return Response.json({ error: 'Merchant not found' }, { status: 404 });
            }
            
            const merchant = merchants[0];

            // Fetch usage meters for billing period
            const meters = await base44.asServiceRole.entities.MerchantUsageMeter.filter({
                merchant_id,
                psp_code
            });

            // Fetch pricing rules for merchant
            const pricingRules = await base44.asServiceRole.entities.MerchantPricingRule.filter({
                psp_code,
                status: 'active'
            });

            // Calculate line items
            const lineItems = [];
            let subtotal = 0;

            for (const meter of meters) {
                if (meter.current_count === 0 && meter.current_volume === 0) continue;

                // Find applicable pricing rule
                const rule = pricingRules.find(r => {
                    if (r.applies_to === 'all_merchants') return true;
                    if (r.applies_to === 'specific_merchants' && r.merchant_ids?.includes(merchant_id)) return true;
                    if (r.applies_to === 'merchant_tier' && r.merchant_tier === merchant.merchant_tier) return true;
                    return false;
                });

                let amount = 0;
                let description = `${meter.metric_type} usage`;

                if (rule) {
                    // Calculate based on pricing type
                    if (rule.pricing_type === 'percentage') {
                        amount = (meter.current_volume * (rule.base_percentage / 100)) + (meter.current_count * (rule.base_fixed || 0));
                        description += ` (${rule.base_percentage}% + $${rule.base_fixed || 0} per transaction)`;
                    } else if (rule.pricing_type === 'fixed') {
                        amount = meter.current_count * (rule.base_fixed || 0);
                        description += ` (${meter.current_count} × $${rule.base_fixed})`;
                    } else if (rule.pricing_type === 'tiered' && rule.tiers?.length) {
                        // Calculate tiered pricing
                        for (const tier of rule.tiers) {
                            if (meter.current_volume >= tier.volume_min && 
                                (!tier.volume_max || meter.current_volume <= tier.volume_max)) {
                                amount = (meter.current_volume * (tier.percentage / 100)) + (meter.current_count * (tier.fixed || 0));
                                description += ` (Tier: ${tier.tier_name})`;
                                break;
                            }
                        }
                    }
                } else {
                    // Default pricing if no rule found
                    amount = meter.current_volume * 0.029; // 2.9% default
                    description += ' (default rate)';
                }

                if (amount > 0) {
                    lineItems.push({
                        description,
                        quantity: meter.current_count,
                        unit_price: amount / meter.current_count,
                        amount,
                        meter_id: meter.meter_id,
                        metric_type: meter.metric_type
                    });
                    subtotal += amount;
                }
            }

            // Add fixed monthly fees if applicable
            const merchantPricing = await base44.asServiceRole.entities.MerchantPricing.filter({
                merchant_id,
                psp_code
            });

            for (const pricing of merchantPricing) {
                if (pricing.monthly_fee && pricing.monthly_fee > 0) {
                    lineItems.push({
                        description: 'Monthly subscription fee',
                        quantity: 1,
                        unit_price: pricing.monthly_fee,
                        amount: pricing.monthly_fee
                    });
                    subtotal += pricing.monthly_fee;
                }
            }

            if (lineItems.length === 0) {
                return Response.json({ 
                    error: 'No billable usage found for this period' 
                }, { status: 400 });
            }

            // Calculate tax (placeholder - should use merchant's tax jurisdiction)
            const tax_rate = 0; // Configure based on merchant location
            const tax_amount = subtotal * tax_rate;
            const total = subtotal + tax_amount;

            // Create invoice
            const invoice = await base44.asServiceRole.entities.Invoice.create({
                invoice_number: `INV-${Date.now()}-${merchant_id.substring(0, 8)}`,
                psp_code,
                merchant_id,
                merchant_name: merchant.business_name || merchant.merchant_name,
                billing_period_start,
                billing_period_end,
                issue_date: new Date().toISOString(),
                due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
                subtotal,
                tax_amount,
                total_amount: total,
                currency: 'USD',
                status: 'draft',
                payment_status: 'unpaid'
            });

            // Create line items
            for (const item of lineItems) {
                await base44.asServiceRole.entities.InvoiceLineItem.create({
                    invoice_id: invoice.id,
                    psp_code,
                    ...item
                });
            }

            // Reset meters for next billing period
            for (const meter of meters) {
                if (meter.current_count > 0 || meter.current_volume > 0) {
                    await base44.asServiceRole.entities.MerchantUsageMeter.update(meter.id, {
                        current_count: 0,
                        current_volume: 0,
                        billing_period_start: billing_period_end,
                        billing_period_end: new Date(new Date(billing_period_end).getTime() + 30*24*60*60*1000).toISOString(),
                        historical_data: [
                            ...(meter.historical_data || []),
                            {
                                period_start: billing_period_start,
                                period_end: billing_period_end,
                                count: meter.current_count,
                                volume: meter.current_volume
                            }
                        ]
                    });
                }
            }

            return Response.json({
                success: true,
                invoice,
                line_items: lineItems
            });
        }

        // Get pending invoices
        if (action === 'getPending') {
            const merchants = await base44.asServiceRole.entities.Merchant.filter({
                psp_code,
                status: 'active'
            });

            const pending = [];
            const now = new Date();

            for (const merchant of merchants) {
                const meters = await base44.asServiceRole.entities.MerchantUsageMeter.filter({
                    merchant_id: merchant.id,
                    psp_code,
                    status: 'active'
                });

                // Check if billing period ended
                for (const meter of meters) {
                    if (meter.billing_period_end && new Date(meter.billing_period_end) <= now) {
                        if (meter.current_count > 0 || meter.current_volume > 0) {
                            const existing = pending.find(p => p.merchant_id === merchant.id);
                            if (!existing) {
                                pending.push({
                                    merchant_id: merchant.id,
                                    merchant_name: merchant.business_name || merchant.merchant_name,
                                    billing_period_end: meter.billing_period_end,
                                    total_usage_count: meter.current_count,
                                    total_usage_volume: meter.current_volume
                                });
                            } else {
                                existing.total_usage_count += meter.current_count;
                                existing.total_usage_volume += meter.current_volume;
                            }
                        }
                    }
                }
            }

            return Response.json({
                success: true,
                pending
            });
        }

        // Finalize invoice (mark as issued)
        if (action === 'finalize') {
            const invoice = await base44.asServiceRole.entities.Invoice.update(invoice_id, {
                status: 'issued',
                issued_date: new Date().toISOString()
            });

            return Response.json({
                success: true,
                invoice
            });
        }

        // Preview invoice (without creating)
        if (action === 'preview') {
            const merchants = await base44.asServiceRole.entities.Merchant.filter({ 
                id: merchant_id, 
                psp_code 
            });
            
            if (!merchants.length) {
                return Response.json({ error: 'Merchant not found' }, { status: 404 });
            }
            
            const merchant = merchants[0];
            const meters = await base44.asServiceRole.entities.MerchantUsageMeter.filter({
                merchant_id,
                psp_code
            });

            const pricingRules = await base44.asServiceRole.entities.MerchantPricingRule.filter({
                psp_code,
                status: 'active'
            });

            const lineItems = [];
            let subtotal = 0;

            for (const meter of meters) {
                if (meter.current_count === 0 && meter.current_volume === 0) continue;

                const rule = pricingRules.find(r => {
                    if (r.applies_to === 'all_merchants') return true;
                    if (r.applies_to === 'specific_merchants' && r.merchant_ids?.includes(merchant_id)) return true;
                    if (r.applies_to === 'merchant_tier' && r.merchant_tier === merchant.merchant_tier) return true;
                    return false;
                });

                let amount = 0;
                if (rule) {
                    if (rule.pricing_type === 'percentage') {
                        amount = (meter.current_volume * (rule.base_percentage / 100)) + (meter.current_count * (rule.base_fixed || 0));
                    } else if (rule.pricing_type === 'fixed') {
                        amount = meter.current_count * (rule.base_fixed || 0);
                    }
                }

                if (amount > 0) {
                    lineItems.push({
                        description: meter.metric_type,
                        quantity: meter.current_count,
                        unit_price: amount / meter.current_count,
                        amount
                    });
                    subtotal += amount;
                }
            }

            return Response.json({
                success: true,
                preview: {
                    merchant,
                    line_items: lineItems,
                    subtotal,
                    total: subtotal
                }
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Invoice generation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});