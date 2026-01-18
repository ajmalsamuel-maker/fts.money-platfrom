import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const payload = await req.json();
        const {
            amount,
            currency = 'USD',
            psp_code,
            merchant_id,
            customer_id,
            service_type,
            seller_country,
            buyer_country,
            buyer_ip,
            billing_address,
            tax_category = 'DIGITAL_SERVICES',
            buyer_tax_id,
            is_b2b = false,
            override_jurisdiction
        } = payload;

        // 1. Check if VAT is enabled for this service/entity
        const taxConfig = await queryOne(
            `SELECT * FROM tax_configuration WHERE service_type = $1 AND psp_code = $2 AND status = 'active' AND vat_enabled = true`,
            [service_type, psp_code]
        );

        if (!taxConfig) {
            await closeConnection();
            return Response.json({
                success: true,
                vat_enabled: false,
                net_amount: amount,
                tax_amount: 0,
                gross_amount: amount,
                message: 'VAT not enabled for this service'
            });
        }

        const config = taxConfig;

        // 2. Determine buyer jurisdiction
        let finalJurisdiction = override_jurisdiction;
        let detectedCountry = buyer_country;

        if (!finalJurisdiction) {
            // Priority: billing address > buyer_country > IP geolocation
            if (billing_address?.country) {
                finalJurisdiction = billing_address.country;
            } else if (buyer_country) {
                finalJurisdiction = buyer_country;
            } else if (buyer_ip) {
                // In production, integrate with IP geolocation service
                detectedCountry = await detectCountryFromIP(buyer_ip);
                finalJurisdiction = detectedCountry;
            }
        }

        if (!finalJurisdiction) {
            throw new Error('Cannot determine buyer jurisdiction for tax calculation');
        }

        // 3. Check if jurisdiction requires tax
        const jurisdiction = await queryOne(
            `SELECT * FROM tax_jurisdiction WHERE jurisdiction_code = $1 AND status = 'active'`,
            [finalJurisdiction]
        );

        if (!jurisdiction) {
            // No tax configuration for this jurisdiction
            await logCalculation({
                amount,
                tax_amount: 0,
                gross_amount: amount,
                final_jurisdiction: finalJurisdiction,
                exemption_reason: 'Jurisdiction not configured',
                psp_code,
                merchant_id,
                customer_id
            });

            await closeConnection();
            return Response.json({
                success: true,
                vat_enabled: true,
                net_amount: amount,
                tax_amount: 0,
                gross_amount: amount,
                jurisdiction: finalJurisdiction,
                exemption_reason: 'Jurisdiction not configured'
            });
        }

        const jurisdictionData = jurisdiction;

        // 4. Check B2B reverse charge (EU)
        if (is_b2b && jurisdictionData.reverse_charge_b2b && buyer_tax_id) {
            // Validate VAT ID
            const validVatId = await validateVATID(buyer_tax_id, finalJurisdiction);
            
            if (validVatId) {
                await logCalculation({
                    amount,
                    tax_amount: 0,
                    gross_amount: amount,
                    final_jurisdiction: finalJurisdiction,
                    reverse_charge_applied: true,
                    buyer_tax_id,
                    buyer_tax_id_validated: true,
                    exemption_reason: 'B2B Reverse Charge',
                    psp_code,
                    merchant_id,
                    customer_id
                });

                await closeConnection();
                return Response.json({
                    success: true,
                    vat_enabled: true,
                    net_amount: amount,
                    tax_amount: 0,
                    gross_amount: amount,
                    jurisdiction: finalJurisdiction,
                    reverse_charge: true,
                    exemption_reason: 'B2B Reverse Charge - Buyer liable'
                });
            }
        }

        // 5. Get tax category and rate
        const categoryData = await queryOne(
            `SELECT * FROM tax_category WHERE category_code = $1 AND status = 'active'`,
            [tax_category]
        );

        let rateType = 'standard';
        let taxRate = jurisdictionData.standard_rate;

        if (categoryData) {
            const category = categoryData;
            rateType = category.default_rate_type || 'standard';

            // Check jurisdiction-specific overrides
            const override = category.jurisdiction_overrides?.find(
                o => o.jurisdiction_code === finalJurisdiction
            );

            if (override) {
                if (override.custom_rate) {
                    taxRate = override.custom_rate;
                } else {
                    rateType = override.rate_type;
                }
            }
        }

        // Apply rate type
        if (!taxRate || rateType !== 'standard') {
            switch (rateType) {
                case 'reduced':
                    taxRate = jurisdictionData.reduced_rate || jurisdictionData.standard_rate;
                    break;
                case 'super_reduced':
                    taxRate = jurisdictionData.super_reduced_rate || jurisdictionData.reduced_rate || jurisdictionData.standard_rate;
                    break;
                case 'zero':
                    taxRate = 0;
                    break;
                case 'exempt':
                    taxRate = 0;
                    break;
            }
        }

        // 6. Calculate tax
        const netAmount = config.inclusive_pricing 
            ? amount / (1 + taxRate / 100) 
            : amount;
        
        const taxAmount = config.inclusive_pricing
            ? amount - netAmount
            : amount * (taxRate / 100);
        
        const grossAmount = config.inclusive_pricing 
            ? amount 
            : amount + taxAmount;

        // 7. Log calculation
        const logId = await logCalculation({
            net_amount: netAmount,
            tax_amount: taxAmount,
            gross_amount: grossAmount,
            final_jurisdiction: finalJurisdiction,
            detected_country: detectedCountry,
            detected_ip: buyer_ip,
            billing_country: billing_address?.country,
            buyer_jurisdiction: finalJurisdiction,
            seller_jurisdiction: seller_country || config.home_jurisdiction,
            tax_category,
            tax_rate_applied: taxRate,
            rate_type: rateType,
            is_b2b,
            buyer_tax_id,
            psp_code,
            merchant_id,
            customer_id,
            currency
        });

        await closeConnection();
        return Response.json({
            success: true,
            vat_enabled: true,
            calculation_log_id: logId,
            net_amount: Math.round(netAmount * 100) / 100,
            tax_amount: Math.round(taxAmount * 100) / 100,
            gross_amount: Math.round(grossAmount * 100) / 100,
            currency,
            jurisdiction: finalJurisdiction,
            tax_rate: taxRate,
            rate_type: rateType,
            tax_category,
            inclusive_pricing: config.inclusive_pricing,
            breakdown: {
                original_amount: amount,
                net: Math.round(netAmount * 100) / 100,
                vat: Math.round(taxAmount * 100) / 100,
                total: Math.round(grossAmount * 100) / 100
            }
        });

    } catch (error) {
        await closeConnection();
        console.error('Tax calculation error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});

async function logCalculation(data) {
    const logId = `TAX-LOG-${Date.now()}`;
    await execute(
        `INSERT INTO tax_calculation_log (log_id, net_amount, tax_amount, gross_amount, calculation_timestamp)
         VALUES ($1, $2, $3, $4, NOW())`,
        [logId, data.net_amount, data.tax_amount, data.gross_amount]
    );
    return logId;
}

async function detectCountryFromIP(ip) {
    // In production, integrate with IP geolocation service
    // Examples: MaxMind, IP2Location, ipapi.co
    // For now, return null to indicate manual override needed
    return null;
}

async function validateVATID(vatId, country) {
    // In production, integrate with VIES (EU) or local tax authority APIs
    // For now, basic format check
    if (!vatId || vatId.length < 8) return false;
    
    // EU VAT ID format: 2-letter country code + 8-12 digits/chars
    const euPattern = /^[A-Z]{2}[0-9A-Z]{8,12}$/;
    return euPattern.test(vatId.replace(/\s/g, ''));
}