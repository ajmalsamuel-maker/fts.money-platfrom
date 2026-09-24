import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Calculate Carbon Footprint using Mastercard Carbon Calculator API
 * Docs: https://developer.mastercard.com/carbon-calculator/documentation
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transactionAmount, merchantCategory, currency = 'USD' } = await req.json();

        // Check if API keys are configured
        const apiKey = Deno.env.get('MASTERCARD_CARBON_API_KEY');
        const clientId = Deno.env.get('MASTERCARD_CARBON_CLIENT_ID');

        if (!apiKey || !clientId) {
            // Return mock data for demo purposes
            const mockCO2 = (transactionAmount * 0.15).toFixed(2); // ~150g CO2 per $1
            return Response.json({
                success: true,
                demo: true,
                carbonFootprint: {
                    co2InGrams: parseFloat(mockCO2),
                    co2InKg: (parseFloat(mockCO2) / 1000).toFixed(3),
                    equivalents: {
                        treeMonths: (parseFloat(mockCO2) / 21000).toFixed(2), // 1 tree absorbs ~21kg/year
                        kmDriven: (parseFloat(mockCO2) / 120).toFixed(2), // ~120g CO2 per km
                        smartphones: (parseFloat(mockCO2) / 8).toFixed(1) // ~8g per charge
                    }
                },
                message: 'Demo mode - set MASTERCARD_CARBON_API_KEY to use real API'
            });
        }

        // Real API integration
        const response = await fetch('https://sandbox.api.mastercard.com/carbon/calculator/transaction-footprints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'X-Client-Id': clientId
            },
            body: JSON.stringify({
                transactionAmount: transactionAmount,
                transactionCurrency: currency,
                merchantCategoryCode: merchantCategory || '5999'
            })
        });

        if (!response.ok) {
            throw new Error(`Mastercard API error: ${response.statusText}`);
        }

        const data = await response.json();

        return Response.json({
            success: true,
            demo: false,
            carbonFootprint: {
                co2InGrams: data.carbonEmissionInGrams || 0,
                co2InKg: ((data.carbonEmissionInGrams || 0) / 1000).toFixed(3),
                equivalents: {
                    treeMonths: ((data.carbonEmissionInGrams || 0) / 21000).toFixed(2),
                    kmDriven: ((data.carbonEmissionInGrams || 0) / 120).toFixed(2),
                    smartphones: ((data.carbonEmissionInGrams || 0) / 8).toFixed(1)
                }
            }
        });

    } catch (error) {
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});