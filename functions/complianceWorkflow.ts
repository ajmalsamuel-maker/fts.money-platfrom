import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, merchant_id, psp_code, verification_type, data } = await req.json();

        if (action === 'initializeChecks') {
            const checkId = `COMP-${Date.now()}`;
            
            await execute(
                `INSERT INTO compliance_check (check_id, merchant_id, psp_code, kyb_status, aml_status, lei_status)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [checkId, merchant_id, psp_code, 'pending', 'pending', 'pending']
            );

            await closeConnection();
            return Response.json({ success: true, check_id: checkId });
        }

        if (action === 'completeKYB') {
            const { company_name, registration_number } = data;
            
            await execute(
                `UPDATE compliance_check SET kyb_status = 'in_progress' WHERE merchant_id = $1`,
                [merchant_id]
            );

            await execute(
                `INSERT INTO kyb_verification (merchant_id, psp_code, company_name, status)
                 VALUES ($1, $2, $3, $4)`,
                [merchant_id, psp_code, company_name, 'submitted']
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'completeAML') {
            await execute(
                `UPDATE compliance_check SET aml_status = 'completed' WHERE merchant_id = $1`,
                [merchant_id]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'completeLEI') {
            const { lei_code } = data;

            await execute(
                `UPDATE compliance_check SET lei_status = 'completed' WHERE merchant_id = $1`,
                [merchant_id]
            );

            await execute(
                `UPDATE merchant SET lei = $1, lei_status = 'verified' WHERE id = $2`,
                [lei_code, merchant_id]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'getStatus') {
            const status = await queryOne(
                `SELECT * FROM compliance_check WHERE merchant_id = $1 AND psp_code = $2`,
                [merchant_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, status });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Compliance workflow error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});