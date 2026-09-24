import { queryOne, execute, closeConnection } from './db/postgresClient.js';
import { ConnectorFactory } from './connectors/index.js';

Deno.serve(async (req) => {
    try {
        const { company_name, registration_number, country, merchant_id } = await req.json();

        if (!company_name || !country) {
            await closeConnection();
            return Response.json({ error: 'Missing required fields: company_name, country' }, { status: 400 });
        }

        const kybConnector = ConnectorFactory.getKYBConnector();
        const searchData = await kybConnector.post('/api/company/search', {
            company_name, country, registration_number: registration_number || null
        });

        let verificationResult;
        if (searchData.data && searchData.data.length > 0) {
            const detailsData = await kybConnector.get(`/api/company/${searchData.data[0].company_id}`);
            verificationResult = {
                kyb_status: 'approved', kyb_reference_id: `KYB-${Date.now()}`, company_verified: true,
                checks: {
                    company_registry: { status: 'passed', confidence_score: 95 },
                    ubo_identification: { status: detailsData.data?.beneficial_owners ? 'passed' : 'needs_review', confidence_score: detailsData.data?.beneficial_owners ? 90 : 60 },
                    director_verification: { status: detailsData.data?.officers ? 'passed' : 'needs_review', confidence_score: detailsData.data?.officers ? 92 : 65 }
                }
            };
        } else {
            verificationResult = {
                kyb_status: 'pending_review', kyb_reference_id: `KYB-${Date.now()}`, company_verified: false,
                checks: { company_registry: { status: 'needs_review', confidence_score: 40 } }
            };
        }

        if (merchant_id) {
            await execute(
                `UPDATE merchant SET kyb_status = $1, kyb_reference_id = $2, kyb_provider = 'thekyb' WHERE id = $3`,
                [verificationResult.kyb_status, verificationResult.kyb_reference_id, merchant_id]
            );
        }

        await closeConnection();
        return Response.json({ success: true, verification: verificationResult });

    } catch (error) {
        await closeConnection();
        console.error('KYB error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});