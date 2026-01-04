import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { vaspId, vaspData } = await req.json();

        const STRIGA_API_KEY = Deno.env.get("STRIGA_API_KEY");
        const STRIGA_API_SECRET = Deno.env.get("STRIGA_API_SECRET");

        if (!STRIGA_API_KEY || !STRIGA_API_SECRET) {
            return Response.json({ 
                error: 'Striga credentials not configured',
                status: 'failed' 
            }, { status: 500 });
        }

        // Call Striga API to create sub-account
        const strigaResponse = await fetch('https://api.striga.com/v1/accounts/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STRIGA_API_KEY}`,
                'X-API-Secret': STRIGA_API_SECRET
            },
            body: JSON.stringify({
                name: vaspData.company_name,
                type: 'BUSINESS',
                jurisdiction: vaspData.jurisdiction,
                metadata: {
                    vasp_id: vaspId,
                    license_number: vaspData.license_number
                }
            })
        });

        if (!strigaResponse.ok) {
            const errorData = await strigaResponse.json();
            
            // Update VASP status to failed
            await base44.asServiceRole.entities.CryptoGatewayCustomer.update(vaspId, {
                status: 'failed',
                striga_status: 'provisioning_failed',
                striga_error: errorData.message || 'Unknown error',
                updated_at: new Date().toISOString()
            });

            return Response.json({ 
                error: 'Striga provisioning failed',
                details: errorData,
                status: 'failed'
            }, { status: 400 });
        }

        const strigaData = await strigaResponse.json();

        // Update VASP with Striga account details
        await base44.asServiceRole.entities.CryptoGatewayCustomer.update(vaspId, {
            status: 'active',
            striga_status: 'active',
            striga_account_id: strigaData.accountId,
            striga_user_id: strigaData.userId,
            api_key: strigaData.apiKey,
            provisioned_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        return Response.json({
            success: true,
            status: 'active',
            strigaAccountId: strigaData.accountId,
            message: 'VASP provisioned successfully'
        });

    } catch (error) {
        console.error('Striga provisioning error:', error);
        return Response.json({ 
            error: error.message,
            status: 'failed'
        }, { status: 500 });
    }
});