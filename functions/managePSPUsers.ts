import pg from 'npm:pg@8.11.3';
import bcrypt from 'npm:bcrypt@5.1.1';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { action, email, full_name, role, psp_code, password, user_id, status, two_factor_enabled } = await req.json();

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

                // SAFETY: Ensure no unique constraints exist on email (multi-tenant requirement)
                await client.query(`
                    DO $$ 
                    BEGIN
                        -- Drop any lingering unique constraints
                        EXECUTE (
                            SELECT 'ALTER TABLE ${schemaName}.app_users DROP CONSTRAINT IF EXISTS ' || conname || ' CASCADE'
                            FROM pg_constraint 
                            WHERE conrelid = '${schemaName}.app_users'::regclass 
                            AND contype = 'u'
                            AND conname LIKE '%email%'
                        );
                    EXCEPTION WHEN OTHERS THEN NULL;
                    END $$;
                `);

                // Hash password
                const password_hash = await bcrypt.hash(password || 'Welcome123!', 10);

                // ISOLATED INSERT - No cross-PSP checks, user can exist in multiple PSPs
                // Check if user exists in THIS PSP schema only
                const existingCheck = await client.query(`
                    SELECT id, email, full_name, role, status, two_factor_enabled, created_date 
                    FROM ${schemaName}.app_users WHERE email = $1
                `, [email]);

                let result;
                if (existingCheck.rows.length > 0) {
                    // User exists in THIS PSP - update role if different
                    if (existingCheck.rows[0].role !== role) {
                        result = await client.query(`
                            UPDATE ${schemaName}.app_users 
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
                result = await client.query(`
                    INSERT INTO ${schemaName}.app_users (email, full_name, role, password_hash, status, two_factor_enabled)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING id, email, full_name, role, status, two_factor_enabled, created_date
                `, [email, full_name, role || 'user', password_hash, status || 'active', two_factor_enabled || false]);

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

                        const result = await client.query(`SELECT id, email, full_name, role, status, two_factor_enabled, last_login, created_at FROM ${schemaName}.app_users ORDER BY id DESC`);
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

                    const result = await client.query(`SELECT id, email, full_name, role, status, two_factor_enabled, last_login, created_at FROM ${schemaName}.app_users ORDER BY id DESC`);
                    
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
                        UPDATE ${schemaName}.app_users 
                        SET ${updates.join(', ')}
                        WHERE id = $${paramCount}
                        RETURNING id, email, full_name, role, status, two_factor_enabled, created_at
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
                
                await client.query(`DELETE FROM ${schemaName}.app_users WHERE id = $1`, [user_id]);
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
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});