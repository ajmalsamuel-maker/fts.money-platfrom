import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    const client = await pool.connect();
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify admin
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { psp_code } = await req.json();

        if (!psp_code) {
            return Response.json({ error: 'PSP code required' }, { status: 400 });
        }

        const schemaName = `psp_${psp_code.toLowerCase()}`;

        // Create psp_settings table in the schema
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schemaName}.psp_settings (
                id SERIAL PRIMARY KEY,
                psp_code VARCHAR(50) UNIQUE NOT NULL,
                psp_name VARCHAR(255) NOT NULL,
                branding JSONB,
                settings JSONB,
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Fetch PSP data from ProvisionedPSP entity
        const pspData = await base44.asServiceRole.entities.ProvisionedPSP.filter({ psp_code });
        
        if (pspData && pspData.length > 0) {
            const psp = pspData[0];
            
            // Insert or update PSP settings
            await client.query(`
                INSERT INTO ${schemaName}.psp_settings (psp_code, psp_name, branding, settings)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (psp_code) DO UPDATE
                SET psp_name = $2, branding = $3, settings = $4, updated_date = CURRENT_TIMESTAMP
            `, [
                psp.psp_code,
                psp.psp_name,
                JSON.stringify(psp.branding || {}),
                JSON.stringify({
                    tier: psp.tier,
                    status: psp.status,
                    domain: psp.domain,
                    subdomain: psp.subdomain,
                    timezone: psp.timezone,
                    currency: psp.currency
                })
            ]);

            return Response.json({
                success: true,
                message: `PSP settings migrated for ${psp_code}`,
                schema_name: schemaName,
                psp_name: psp.psp_name,
                branding: psp.branding
            });
        } else {
            return Response.json({
                success: false,
                error: 'PSP not found in ProvisionedPSP entity'
            }, { status: 404 });
        }

    } catch (error) {
        console.error('Migration error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    } finally {
        client.release();
    }
});