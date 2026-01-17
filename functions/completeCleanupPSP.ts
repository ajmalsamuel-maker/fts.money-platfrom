import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { psp_code } = await req.json();

        if (!psp_code) {
            return Response.json({ error: 'PSP code required' }, { status: 400 });
        }

        const client = await pool.connect();

        try {
            const schemaName = `psp_${psp_code.toLowerCase().replace(/-/g, '_')}`;
            await client.query(`SET search_path TO "${schemaName}"`);

            // Delete in order to respect foreign keys
            const deletedData = {
                merchant_mids: 0,
                merchants: 0,
                transactions: 0,
                settlements: 0,
                chargebacks: 0,
                audit_logs: 0
            };

            // Delete merchant_mids first
            const midsResult = await client.query('DELETE FROM merchant_mids');
            deletedData.merchant_mids = midsResult.rowCount;

            // Delete merchants
            const merchantsResult = await client.query('DELETE FROM merchants');
            deletedData.merchants = merchantsResult.rowCount;

            // Delete transactions
            const transactionsResult = await client.query('DELETE FROM transactions');
            deletedData.transactions = transactionsResult.rowCount;

            // Delete settlements
            const settlementsResult = await client.query('DELETE FROM settlements');
            deletedData.settlements = settlementsResult.rowCount;

            // Delete chargebacks
            const chargebacksResult = await client.query('DELETE FROM chargebacks');
            deletedData.chargebacks = chargebacksResult.rowCount;

            // Delete audit logs
            const auditResult = await client.query('DELETE FROM audit_logs');
            deletedData.audit_logs = auditResult.rowCount;

            return Response.json({
                success: true,
                message: 'Complete database cleanup successful',
                deleted: deletedData
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Complete cleanup error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});