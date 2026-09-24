import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, policy_id, merchant_id } = await req.json();

        if (action === 'enforcePolicy') {
            const policy = await queryOne(
                `SELECT * FROM compliance_policy WHERE policy_id = $1 AND psp_code = $2 AND enabled = true`,
                [policy_id, psp_code]
            );

            if (!policy) {
                await closeConnection();
                return Response.json({ success: false, enforced: false });
            }

            // Check merchant against policy
            const merchant = await queryOne(
                `SELECT * FROM merchant WHERE id = $1`,
                [merchant_id]
            );

            const compliant = merchant && merchant.aml_status !== 'blocked' && merchant.kyb_status = 'approved';

            await closeConnection();
            return Response.json({ success: true, compliant });
        }

        if (action === 'runAutomatedCheck') {
            const check_id = `CHECK-${Date.now()}`;
            
            await execute(
                `INSERT INTO compliance_check (check_id, psp_code, policy_id, status, executed_at)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [check_id, psp_code, policy_id, 'executed']
            );

            await closeConnection();
            return Response.json({ success: true, check_id });
        }

        if (action === 'generateAttestation') {
            const attestation_id = `ATT-${Date.now()}`;
            
            await execute(
                `INSERT INTO compliance_attestation (attestation_id, psp_code, policy_id, signed_at)
                 VALUES ($1, $2, $3, NOW())`,
                [attestation_id, psp_code, policy_id]
            );

            await closeConnection();
            return Response.json({ success: true, attestation_id });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Compliance automation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});