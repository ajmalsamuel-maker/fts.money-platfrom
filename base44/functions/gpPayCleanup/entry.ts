import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { Client } from 'npm:pg@17.1.0';

Deno.serve(async (req) => {
    let pool = null;
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const psp_code = 'GP-PAY';
        const connectionString = Deno.env.get('DATABASE_URL');
        if (!connectionString) {
            throw new Error('DATABASE_URL not set');
        }

        // Delete from Base44
        let base44Count = 0;
        try {
            const merchants = await base44.asServiceRole.entities.Merchant.filter({ psp_code });
            for (const merchant of merchants) {
                await base44.asServiceRole.entities.Merchant.delete(merchant.id);
                base44Count++;
            }
        } catch (e) {
            console.error('Base44:', e.message);
        }

        // Delete from PostgreSQL
        let pgCount = 0;
        pool = new Client(connectionString);
        await pool.connect();
        try {
            const result = await pool.queryObject(`DELETE FROM "${psp_code}".merchant`);
            pgCount = result.rowCount || 0;
        } catch (e) {
            console.error('PostgreSQL:', e.message);
        }
        await pool.end();

        return Response.json({
            success: true,
            deletedFromBase44: base44Count,
            deletedFromPostgres: pgCount
        });

    } catch (error) {
        if (pool) await pool.end().catch(() => {});
        return Response.json({ error: error.message }, { status: 500 });
    }
});