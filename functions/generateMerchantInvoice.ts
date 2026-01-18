import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, merchant_id, psp_code, billing_period_start, billing_period_end, invoice_id } = await req.json();

        // Generate Invoice
        if (action === 'generate') {
            // Fetch merchant from PostgreSQL
            const merchant = await queryOne(
                `SELECT * FROM merchant WHERE id = $1 AND psp_code = $2`,
                [merchant_id, psp_code]
            );
            
            if (!merchant) {
                await closeConnection();
                return Response.json({ error: 'Merchant not found' }, { status: 404 });
            }

            // Fetch usage meters and pricing rules
            const [meters, pricingRules] = await Promise.all([
                query(`SELECT * FROM merchant_usage_meter WHERE merchant_id = $1 AND psp_code = $2`, [merchant_id, psp_code]),
                query(`SELECT * FROM merchant_pricing_rule WHERE psp_code = $1 AND status = 'active'`, [psp_code])
            ]);

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

            // Add fixed monthly fees
            const merchantPricing = await query(`SELECT * FROM merchant_pricing WHERE merchant_id = $1 AND psp_code = $2`, [merchant_id, psp_code]);
            for (const pricing of merchantPricing) {
                if (pricing.monthly_fee && pricing.monthly_fee > 0) {
                    lineItems.push({ description: 'Monthly fee', quantity: 1, unit_price: pricing.monthly_fee, amount: pricing.monthly_fee });
                    subtotal += pricing.monthly_fee;
                }
            }

            if (lineItems.length === 0) {
                await closeConnection();
                return Response.json({ error: 'No billable usage found' }, { status: 400 });
            }

            const tax_rate = 0;
            const tax_amount = subtotal * tax_rate;
            const total = subtotal + tax_amount;
            const invoiceId = `INV-${Date.now()}`;

            // Create invoice in PostgreSQL
            await execute(
                `INSERT INTO invoice (invoice_number, psp_code, merchant_id, merchant_name, billing_period_start, billing_period_end, issue_date, due_date, subtotal, tax_amount, total_amount, currency, status, payment_status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [invoiceId, psp_code, merchant_id, merchant.business_name, billing_period_start, billing_period_end, new Date().toISOString(), new Date(Date.now() + 30*24*60*60*1000).toISOString(), subtotal, tax_amount, total, 'USD', 'draft', 'unpaid']
            );

            // Create line items
            for (const item of lineItems) {
                await execute(
                    `INSERT INTO invoice_line_item (invoice_id, psp_code, description, quantity, unit_price, amount, meter_id, metric_type)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [invoiceId, psp_code, item.description, item.quantity, item.unit_price, item.amount, item.meter_id || null, item.metric_type || null]
                );
            }

            // Reset meters
            for (const meter of meters) {
                if (meter.current_count > 0 || meter.current_volume > 0) {
                    await execute(
                        `UPDATE merchant_usage_meter SET current_count = 0, current_volume = 0 WHERE id = $1`,
                        [meter.id]
                    );
                }
            }

            await closeConnection();
            return Response.json({ success: true, invoice_id: invoiceId, line_items: lineItems });
        }

        // Get pending invoices
        if (action === 'getPending') {
            const merchants = await query(`SELECT * FROM merchant WHERE psp_code = $1 AND status = 'active'`, [psp_code]);
            const pending = [];

            for (const merchant of merchants) {
                const meters = await query(`SELECT * FROM merchant_usage_meter WHERE merchant_id = $1 AND psp_code = $2`, [merchant.id, psp_code]);
                for (const meter of meters) {
                    if (meter.current_count > 0 || meter.current_volume > 0) {
                        const existing = pending.find(p => p.merchant_id === merchant.id);
                        if (!existing) {
                            pending.push({ merchant_id: merchant.id, merchant_name: merchant.business_name, total_usage_count: meter.current_count, total_usage_volume: meter.current_volume });
                        }
                    }
                }
            }

            await closeConnection();
            return Response.json({ success: true, pending });
        }

        // Finalize invoice
        if (action === 'finalize') {
            await execute(`UPDATE invoice SET status = 'issued', issued_date = NOW() WHERE invoice_number = $1`, [invoice_id]);
            await closeConnection();
            return Response.json({ success: true, invoice_id });
        }

        // Preview invoice
        if (action === 'preview') {
            const merchant = await queryOne(`SELECT * FROM merchant WHERE id = $1 AND psp_code = $2`, [merchant_id, psp_code]);
            if (!merchant) {
                await closeConnection();
                return Response.json({ error: 'Merchant not found' }, { status: 404 });
            }
            
            const [meters, pricingRules] = await Promise.all([
                query(`SELECT * FROM merchant_usage_meter WHERE merchant_id = $1 AND psp_code = $2`, [merchant_id, psp_code]),
                query(`SELECT * FROM merchant_pricing_rule WHERE psp_code = $1 AND status = 'active'`, [psp_code])
            ]);

            const lineItems = [];
            let subtotal = 0;
            for (const meter of meters) {
                if (meter.current_count === 0 && meter.current_volume === 0) continue;
                const rule = pricingRules.find(r => r.applies_to === 'all_merchants');
                let amount = rule ? (meter.current_volume * (rule.base_percentage / 100)) : 0;
                if (amount > 0) {
                    lineItems.push({ description: meter.metric_type, quantity: meter.current_count, unit_price: amount / meter.current_count, amount });
                    subtotal += amount;
                }
            }

            await closeConnection();
            return Response.json({ success: true, preview: { merchant, line_items: lineItems, subtotal, total: subtotal } });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Invoice error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});