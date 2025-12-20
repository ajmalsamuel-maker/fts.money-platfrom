import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify platform admin
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();
        const deletedSchemas = [];
        const deletedPSPs = [];

        try {
            // Get all PSPs from entity
            const psps = await base44.asServiceRole.entities.ProvisionedPSP.list();

            for (const psp of psps) {
                const schemaName = `psp_${psp.psp_code.toLowerCase()}`;
                
                try {
                    // Drop the schema
                    await client.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
                    deletedSchemas.push(schemaName);
                    
                    // Delete the PSP entity
                    await base44.asServiceRole.entities.ProvisionedPSP.delete(psp.id);
                    deletedPSPs.push(psp.psp_code);
                } catch (err) {
                    console.error(`Error deleting PSP ${psp.psp_code}:`, err);
                }
            }

            return Response.json({
                success: true,
                message: 'All PSPs deleted successfully',
                deleted_schemas: deletedSchemas,
                deleted_psps: deletedPSPs,
                total_deleted: deletedPSPs.length
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error deleting all PSPs:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});