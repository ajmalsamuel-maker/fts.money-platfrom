import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { query, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const psp_code = 'GP-PAY';

        // 1. Delete from Base44 Merchant entity
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
            console.error('Error deleting from Base44:', e.message);
        }

        // 2. Delete from PostgreSQL
        console.log('🗑️ Deleting merchants from PostgreSQL for PSP:', psp_code);
        let postgresDeleteCount = 0;
        try {
            const result = await execute(
                `DELETE FROM "${psp_code}".merchant`,
                []
            );
            postgresDeleteCount = result.rowCount || 0;
            console.log(`✅ Deleted ${postgresDeleteCount} merchants from PostgreSQL`);
        } catch (e) {
            console.error('Error deleting from PostgreSQL:', e.message);
        }

        await closeConnection();

        return Response.json({
            success: true,
            message: `Cleanup complete for PSP: ${psp_code}`,
            deletedFromBase44: base44DeleteCount,
            deletedFromPostgres: postgresDeleteCount
        });

    } catch (error) {
        await closeConnection();
        console.error('💥 Cleanup error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});