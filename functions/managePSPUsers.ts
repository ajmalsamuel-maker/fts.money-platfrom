import pg from 'npm:pg@8.11.3';
import bcrypt from 'npm:bcrypt@5.1.1';

const { Pool } = pg;

// CRITICAL: Uses psp_staff_users table (completely isolated from Base44 entity system)
// This prevents Base44 from auto-creating unique constraints that cause conflicts

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        console.log('[START] managePSPUsers function invoked');
        // FORCE CACHE CLEAR - v3
        const { action, email, full_name, role, psp_code, password, user_id, status, two_factor_enabled } = await req.json();
        console.log('[ACTION]', action, 'PSP:', psp_code);

        if (action === 'create') {
            if (!psp_code) {
                return Response.json({
                    success: false,
                    error: 'PSP code is required'
                }, { status: 400 });
            }

            const client = await pool.connect();
            try {
                const schemaName = `psp_${psp_code.toLowerCase()}`;

                // CRITICAL: Set search_path to ONLY the PSP schema (not public, not app schemas)
                await client.query(`SET search_path TO "${schemaName}"`);
                console.log('[DEBUG] Set search_path to:', schemaName);

                console.log('[DEBUG] Starting user creation for PSP:', psp_code, 'schema:', schemaName);
                console.log('[DEBUG] Email:', email, 'Role:', role);

                // Skip app_users cleanup - not needed for user creation
                console.log('[DEBUG] Skipping app_users cleanup');

                // Verify psp_staff_users table exists
                const tableCheck = await client.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = $1 AND table_name = 'psp_staff_users'
                    )
                `, [schemaName]);

                if (!tableCheck.rows[0].exists) {
                    console.error('[ERROR] psp_staff_users table does not exist in schema:', schemaName);
                    return Response.json({
                        success: false,
                        error: `PSP schema ${schemaName} not provisioned properly. psp_staff_users table is missing. Please run Database provisioning step first.`
                    }, { status: 400 });
                }
                console.log('[DEBUG] psp_staff_users table verified');

                // Hash password
                console.log('[DEBUG] Hashing password...');
                const password_hash = await bcrypt.hash(password || 'Welcome123!', 10);
                console.log('[DEBUG] Password hashed successfully');

                // Check if user exists in THIS PSP schema only
                const existingCheck = await client.query(`
                    SELECT id, email, full_name, role, status, two_factor_enabled, created_date 
                    FROM "${schemaName}".psp_staff_users WHERE email = $1
                `, [email]);

                let result;
                if (existingCheck.rows.length > 0) {
                    // User exists in THIS PSP - update role if different
                    if (existingCheck.rows[0].role !== role) {
                        result = await client.query(`
                            UPDATE "${schemaName}".psp_staff_users 
                            SET role = $1, updated_date = NOW()
                            WHERE email = $2
                            RETURNING id, email, full_name, role, status, two_factor_enabled, created_date
                        `, [role, email]);

                        return Response.json({
                            success: true,
                            user: {
                                ...result.rows[0],
                                psp_code: psp_code
                            },
                            message: `User already exists in PSP ${psp_code} - updated role to ${role}`
                        });
                    }

                    return Response.json({
                        success: true,
                        user: {
                            ...existingCheck.rows[0],
                            psp_code: psp_code
                        },
                        message: `User already exists in PSP ${psp_code}`
                    });
                }

                // User doesn't exist in THIS PSP - create new
                console.log('[DEBUG] Creating new user with hashed password');
                console.log('[DEBUG] Password hash length:', password_hash.length);
                result = await client.query(`
                    INSERT INTO "${schemaName}".psp_staff_users (email, full_name, role, password_hash, status, two_factor_enabled)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING id, email, full_name, role, status, two_factor_enabled, created_date, password_hash
                `, [email, full_name, role || 'user', password_hash, status || 'active', two_factor_enabled || false]);
                console.log('[DEBUG] User created successfully');
                console.log('[DEBUG] Returned password_hash:', result.rows[0].password_hash);

                return Response.json({
                    success: true,
                    user: {
                        ...result.rows[0],
                        psp_code: psp_code
                    }
                });
            } catch (err) {
                console.error('Error creating user:', err);
                return Response.json({
                    success: false,
                    error: `Failed to create user: ${err.message}`
                }, { status: 400 });
            } finally {
                client.release();
            }
        }

        if (action === 'list') {
            if (!psp_code || psp_code === 'undefined') {
                // List all users from all PSP schemas using ProvisionedPSP entity
                const pspResult = await pool.query(`
                    SELECT DISTINCT data->>'psp_code' as psp_code 
                    FROM app_entities_data 
                    WHERE entity_name = 'ProvisionedPSP' 
                    AND data->>'psp_code' IS NOT NULL
                    ORDER BY data->>'psp_code'
                `);
                const allUsers = [];
                
                for (const psp of pspResult.rows) {
                    const client = await pool.connect();
                    try {
                        const schemaName = `psp_${psp.psp_code.toLowerCase()}`;

                        const result = await client.query(`SELECT id, email, full_name, role, status, two_factor_enabled, last_login, created_date FROM "${schemaName}".psp_staff_users ORDER BY id DESC`);
                        allUsers.push(...result.rows.map(u => ({ ...u, psp_code: psp.psp_code })));
                    } catch (err) {
                        // Schema might not exist yet
                    } finally {
                        client.release();
                    }
                }
                
                return Response.json({
                    success: true,
                    users: allUsers
                });
            } else {
                // List users for specific PSP
                const client = await pool.connect();
                try {
                    const schemaName = `psp_${psp_code.toLowerCase()}`;
                    await client.query(`SET search_path TO "${schemaName}"`);

                    const result = await client.query(`SELECT id, email, full_name, role, status, two_factor_enabled, last_login, created_date FROM "${schemaName}".psp_staff_users ORDER BY id DESC`);
                    
                    return Response.json({
                        success: true,
                        users: result.rows.map(u => ({ ...u, psp_code: psp_code }))
                    });
                } catch (err) {
                    return Response.json({
                        success: true,
                        users: []
                    });
                } finally {
                    client.release();
                }
            }
        }

        if (action === 'update') {
            if (!psp_code) {
                return Response.json({
                    success: false,
                    error: 'PSP code is required'
                }, { status: 400 });
            }

            const client = await pool.connect();
                try {
                    const schemaName = `psp_${psp_code.toLowerCase()}`;
                    await client.query(`SET search_path TO "${schemaName}"`);

                    // Build dynamic update query
                    const updates = [];
                    const values = [];
                    let paramCount = 1;

                    if (full_name !== undefined) {
                        updates.push(`full_name = $${paramCount++}`);
                        values.push(full_name);
                    }
                    if (role !== undefined) {
                        updates.push(`role = $${paramCount++}`);
                        values.push(role);
                    }
                    if (status !== undefined) {
                        updates.push(`status = $${paramCount++}`);
                        values.push(status);
                    }
                    if (two_factor_enabled !== undefined) {
                        updates.push(`two_factor_enabled = $${paramCount++}`);
                        values.push(two_factor_enabled);
                    }
                    if (password) {
                        const password_hash = await bcrypt.hash(password, 10);
                        updates.push(`password_hash = $${paramCount++}`);
                        values.push(password_hash);
                    }

                    updates.push(`updated_at = NOW()`);
                    values.push(user_id);

                    const result = await client.query(`
                        UPDATE "${schemaName}".psp_staff_users 
                        SET ${updates.join(', ')}
                        WHERE id = $${paramCount}
                        RETURNING id, email, full_name, role, status, two_factor_enabled, created_date
                    `, values);

                return Response.json({
                    success: true,
                    user: {
                        ...result.rows[0],
                        psp_code: psp_code
                    }
                });
            } finally {
                client.release();
            }
        }

        if (action === 'delete') {
            if (!psp_code) {
                return Response.json({
                    success: false,
                    error: 'PSP code is required'
                }, { status: 400 });
            }

            const client = await pool.connect();
            try {
                const schemaName = `psp_${psp_code.toLowerCase()}`;
                await client.query(`SET search_path TO "${schemaName}"`);

                await client.query(`DELETE FROM "${schemaName}".psp_staff_users WHERE id = $1`, [user_id]);
                return Response.json({ success: true });
            } finally {
                client.release();
            }
        }

        if (action === 'listPSPs') {
            // Use Base44 entities instead of global table - TRUE multi-tenant isolation
            const client = await pool.connect();
            try {
                const result = await client.query(`
                    SELECT DISTINCT data->>'psp_code' as psp_code, data->>'psp_name' as psp_name
                    FROM app_entities_data 
                    WHERE entity_name = 'ProvisionedPSP' 
                    AND data->>'psp_code' IS NOT NULL
                    ORDER BY data->>'psp_name'
                `);
                return Response.json({
                    success: true,
                    psps: result.rows
                });
            } finally {
                client.release();
            }
        }

        return Response.json({
            success: false,
            error: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        console.error('managePSPUsers error:', error);
        console.error('Error stack:', error.stack);
        return Response.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});