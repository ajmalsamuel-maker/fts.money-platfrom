import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { ConnectorFactory } from './connectors/index.js';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { lei, company_name, merchant_id, action = 'verify' } = await req.json();

        if (!lei && !company_name) {
            return Response.json({ 
                error: 'Either LEI or company_name is required' 
            }, { status: 400 });
        }

        // Get LEI connector (GLEIF API is public, no auth needed)
        const leiConnector = ConnectorFactory.getLEIConnector();

        if (action === 'search' && company_name) {
            // Search for LEI by company name
            const searchResult = await leiConnector.searchLEI(company_name);
            
            return Response.json({
                success: true,
                results: searchResult.data || [],
                total: searchResult.data?.length || 0
            });
        }

        if (action === 'verify' && lei) {
            // Verify specific LEI
            const verificationResult = await leiConnector.verifyLEI(lei);
            
            // Update merchant record if merchant_id provided
            if (merchant_id) {
                await base44.asServiceRole.entities.Merchant.update(merchant_id, {
                    lei: verificationResult.lei,
                    lei_status: verificationResult.verified ? 'verified' : 'expired',
                    lei_verified_date: verificationResult.verified ? new Date().toISOString() : null
                });
            }
            
            return Response.json({
                success: verificationResult.verified,
                verification: verificationResult
            });
        }

        // Get LEI details
        if (lei) {
            const details = await leiConnector.getLEI(lei);
            
            return Response.json({
                success: true,
                details: details.data
            });
        }

        return Response.json({ 
            error: 'Invalid action or missing parameters' 
        }, { status: 400 });

    } catch (error) {
        console.error('LEI Verification Error:', error);
        return Response.json({ 
            error: 'Internal server error',
            details: error.message 
        }, { status: 500 });
    }
});