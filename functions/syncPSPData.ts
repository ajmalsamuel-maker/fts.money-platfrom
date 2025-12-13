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
        
        // Fetch all PSPs from Base44
        const psps = await base44.asServiceRole.entities.ProvisionedPSP.list();
        
        let synced = 0;
        let errors = [];
        
        for (const psp of psps) {
            try {
                // Check if already exists
                const existing = await pool.query('SELECT id FROM psp_settings WHERE psp_code = $1', [psp.psp_code]);
                
                if (existing.rows.length > 0) {
                    // Update
                    await pool.query(`
                        UPDATE psp_settings 
                        SET psp_name = $1, branding = $2, status = $3, updated_at = NOW()
                        WHERE psp_code = $4
                    `, [psp.psp_name, JSON.stringify(psp.branding || {}), psp.status, psp.psp_code]);
                } else {
                    // Insert
                    await pool.query(`
                        INSERT INTO psp_settings (psp_code, psp_name, branding, status, created_at, updated_at)
                        VALUES ($1, $2, $3, $4, NOW(), NOW())
                    `, [psp.psp_code, psp.psp_name, JSON.stringify(psp.branding || {}), psp.status]);
                }
                synced++;
            } catch (err) {
                errors.push({ psp_code: psp.psp_code, error: err.message });
            }
        }
        
        return Response.json({
            success: true,
            synced,
            total: psps.length,
            errors
        });
        
    } catch (error) {
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});