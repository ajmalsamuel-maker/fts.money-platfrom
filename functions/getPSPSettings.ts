import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    const client = await pool.connect();
    try {
        const { psp_code, action, settings } = await req.json();

        console.log('🔍 getPSPSettings called with psp_code:', psp_code);

        if (!psp_code) {
            return Response.json({
                success: false,
                error: 'PSP code is required'
            }, { status: 400 });
        }

        // CRITICAL: Set search path to PSP-isolated schema ONLY (PCI/GDPR compliance)
        const schemaName = `psp_${psp_code.toLowerCase()}`;
        console.log('📂 Setting schema to:', schemaName);
        await client.query(`SET search_path TO ${schemaName}`);

        // Handle update action
        if (action === 'update') {
            console.log('📝 Updating PSP settings...', settings);
            
            // Extract branding separately if it exists
            const branding = settings.branding || {};
            delete settings.branding;
            
            const updateResult = await client.query(
                `UPDATE psp_settings 
                SET psp_name = $1, 
                    branding = $2,
                    settings = $3,
                    updated_date = CURRENT_TIMESTAMP
                WHERE UPPER(psp_code) = UPPER($4)
                RETURNING *`,
                [
                    settings.company_name || psp_code,
                    JSON.stringify(branding),
                    JSON.stringify(settings),
                    psp_code
                ]
            );

            console.log('✅ Settings updated, rows affected:', updateResult.rowCount);
            
            if (updateResult.rowCount === 0) {
                return Response.json({
                    success: false,
                    error: 'PSP settings not found or not updated'
                }, { status: 404 });
            }
            
            return Response.json({
                success: true,
                message: 'Settings updated successfully',
                settings: updateResult.rows[0]
            });
        }

        // Default: Get settings
        const result = await client.query(
            'SELECT * FROM psp_settings WHERE UPPER(psp_code) = UPPER($1) LIMIT 1',
            [psp_code]
        );

        console.log('📊 Query result rows:', result.rows.length);

        const settingsRow = result.rows[0];

        if (!settingsRow) {
            return Response.json({
                success: false,
                error: 'PSP settings not found'
            }, { status: 404 });
        }

        // Merge JSONB fields with row data
        const mergedSettings = {
            ...settingsRow,
            ...(settingsRow.settings || {}),
            branding: settingsRow.branding || {}
        };

        console.log('📊 Merged settings:', mergedSettings);

        return Response.json({
            success: true,
            settings: mergedSettings
        });

    } catch (error) {
        console.error('❌ Error in getPSPSettings:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    } finally {
        client.release();
    }
});