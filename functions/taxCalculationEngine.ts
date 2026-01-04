import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Tax Calculation Engine
 * Calculates VAT/GST/Sales Tax for transactions across all services
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
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
        const taxConfig = await base44.asServiceRole.entities.TaxConfiguration.filter({
            service_type,
            psp_code,
            status: 'active',
            vat_enabled: true
        });

        if (!taxConfig || taxConfig.length === 0) {
            return Response.json({
                success: true,
                vat_enabled: false,
                net_amount: amount,
                tax_amount: 0,
                gross_amount: amount,
                message: 'VAT not enabled for this service'
            });
        }

        const config = taxConfig[0];

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
        const jurisdiction = await base44.asServiceRole.entities.TaxJurisdiction.filter({
            jurisdiction_code: finalJurisdiction,
            status: 'active'
        });

        if (!jurisdiction || jurisdiction.length === 0) {
            // No tax configuration for this jurisdiction
            await logCalculation(base44, {
                amount,
                tax_amount: 0,
                gross_amount: amount,
                final_jurisdiction: finalJurisdiction,
                exemption_reason: 'Jurisdiction not configured',
                psp_code,
                merchant_id,
                customer_id
            });

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

        const jurisdictionData = jurisdiction[0];

        // 4. Check B2B reverse charge (EU)
        if (is_b2b && jurisdictionData.reverse_charge_b2b && buyer_tax_id) {
            // Validate VAT ID
            const validVatId = await validateVATID(buyer_tax_id, finalJurisdiction);
            
            if (validVatId) {
                await logCalculation(base44, {
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
        const categoryData = await base44.asServiceRole.entities.TaxCategory.filter({
            category_code: tax_category,
            status: 'active'
        });

        let rateType = 'standard';
        let taxRate = jurisdictionData.standard_rate;

        if (categoryData && categoryData.length > 0) {
            const category = categoryData[0];
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
        const logId = await logCalculation(base44, {
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
        console.error('Tax calculation error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});

async function logCalculation(base44, data) {
    const log = await base44.asServiceRole.entities.TaxCalculationLog.create({
        ...data,
        calculation_timestamp: new Date().toISOString(),
        calculation_method: 'automatic'
    });
    return log.id;
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