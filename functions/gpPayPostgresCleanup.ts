import { Client } from 'npm:pg@17.1.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    let client = null;
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const psp_code = 'GP-PAY';
        const connectionString = Deno.env.get('DATABASE_URL');

        if (!connectionString) {
            return Response.json({ error: 'DATABASE_URL not configured' }, { status: 400 });
        }

        console.log('🗑️ Connecting to PostgreSQL for PSP:', psp_code);
        client = new Client(connectionString);
        await client.connect();

        let pgDeleteCount = 0;
        try {
            const result = await client.queryObject(
                `DELETE FROM "${psp_code}".merchant`
            );
            pgDeleteCount = result.rowCount || 0;
            console.log(`✅ Deleted ${pgDeleteCount} merchants from PostgreSQL`);
        } catch (queryError) {
            console.warn('PostgreSQL query error:', queryError.message);
            // Table might not exist, continue anyway
            pgDeleteCount = 0;
        }

        await client.end();

        return Response.json({
            success: true,
            message: `PostgreSQL cleanup complete for PSP: ${psp_code}`,
            deletedFromPostgres: pgDeleteCount
        });

    } catch (error) {
        console.error('💥 Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    } finally {
        if (client) {
            try {
                await client.end();
            } catch (e) {
                console.warn('Error closing connection:', e.message);
            }
        }
    }
});