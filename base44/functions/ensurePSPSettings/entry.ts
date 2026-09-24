import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { psp_code } = await req.json();

        if (!psp_code) {
            return Response.json({ error: 'PSP code required' }, { status: 400 });
        }

        // Check if PSP settings exist
        const existing = await pool.query(
            'SELECT * FROM psp_settings WHERE UPPER(psp_code) = UPPER($1)',
            [psp_code]
        );

        if (existing.rows.length > 0) {
            return Response.json({
                success: true,
                message: 'PSP settings already exist',
                settings: existing.rows[0]
            });
        }

        // Get PSP data from ProvisionedPSP
        const pspData = await pool.query(
            'SELECT * FROM "ProvisionedPSP" WHERE UPPER(psp_code) = UPPER($1) LIMIT 1',
            [psp_code]
        );

        if (pspData.rows.length === 0) {
            return Response.json({
                success: false,
                error: 'PSP not found in ProvisionedPSP table'
            }, { status: 404 });
        }

        const psp = pspData.rows[0];

        // Insert PSP settings
        await pool.query(`
            INSERT INTO psp_settings (psp_code, psp_name, branding)
            VALUES ($1, $2, $3)
        `, [
            psp.psp_code,
            psp.psp_name,
            psp.branding || { primary_color: '#3b82f6', secondary_color: '#8b5cf6' }
        ]);

        return Response.json({
            success: true,
            message: 'PSP settings created',
            psp_code: psp.psp_code,
            psp_name: psp.psp_name
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});