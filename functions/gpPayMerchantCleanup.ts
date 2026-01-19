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

        // 1. Delete from Base44
        console.log('🗑️ Deleting merchants from Base44 for PSP:', psp_code);
        let base44DeleteCount = 0;
        try {
            const merchants = await base44.asServiceRole.entities.Merchant.filter({ psp_code });
            for (const merchant of merchants) {
                await base44.asServiceRole.entities.Merchant.delete(merchant.id);
                base44DeleteCount++;
            }
            console.log(`✅ Deleted ${base44DeleteCount} merchants from Base44`);
        } catch (e) {
            console.error('Base44 error:', e.message);
        }

        // 2. Delete from PostgreSQL
        console.log('🗑️ Deleting merchants from PostgreSQL for PSP:', psp_code);
        let postgresDeleteCount = 0;
        pool = new Client(connectionString);
        await pool.connect();

        try {
            const result = await pool.queryObject(
                `DELETE FROM "${psp_code}".merchant`,
                []
            );
            postgresDeleteCount = result.rowCount || 0;
            console.log(`✅ Deleted ${postgresDeleteCount} merchants from PostgreSQL`);
        } catch (e) {
            console.error('PostgreSQL error:', e.message);
        }

        await pool.end();

        return Response.json({
            success: true,
            message: `Cleanup complete for PSP: ${psp_code}`,
            deletedFromBase44: base44DeleteCount,
            deletedFromPostgres: postgresDeleteCount
        });

    } catch (error) {
        if (pool) await pool.end().catch(() => {});
        console.error('💥 Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});