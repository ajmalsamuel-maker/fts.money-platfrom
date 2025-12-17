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

            if (updateResult.rowCount === 0) {
                return Response.json({ success: false, error: 'PSP settings not found' }, { status: 404 });
            }
            
            return Response.json({ success: true, settings: updateResult.rows[0] });
        }
        
        // List users
        if (action === 'listUsers') {
            const result = await client.query('SELECT * FROM app_users ORDER BY created_date DESC');
            return Response.json({ success: true, users: result.rows });
        }
        
        // Create user
        if (action === 'createUser') {
            const { user_data } = settings;
            const result = await client.query(
                `INSERT INTO app_users (user_id, email, full_name, role, department, password_hash, status, created_date)
                VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
                RETURNING *`,
                [
                    `USR-${Date.now()}`,
                    user_data.email,
                    user_data.full_name,
                    user_data.role,
                    user_data.department || '',
                    user_data.password,
                    'active'
                ]
            );
            return Response.json({ success: true, user: result.rows[0] });
        }
        
        // Update user
        if (action === 'updateUser') {
            const { user_id, updates } = settings;
            const setClauses = [];
            const values = [];
            let paramCounter = 1;
            
            Object.entries(updates).forEach(([key, value]) => {
                setClauses.push(`${key} = $${paramCounter}`);
                values.push(value);
                paramCounter++;
            });
            
            values.push(user_id);
            const result = await client.query(
                `UPDATE app_users SET ${setClauses.join(', ')}, updated_date = CURRENT_TIMESTAMP WHERE user_id = $${paramCounter} RETURNING *`,
                values
            );
            return Response.json({ success: true, user: result.rows[0] });
        }
        
        // Update password
        if (action === 'updatePassword') {
            const { user_id, new_password } = settings;
            await client.query(
                'UPDATE app_users SET password_hash = $1, updated_date = CURRENT_TIMESTAMP WHERE user_id = $2',
                [new_password, user_id]
            );
            return Response.json({ success: true });
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