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
                // CRITICAL: Set schema to PSP-isolated schema (PCI/GDPR compliance)
                const schemaName = `psp_${psp_code.toLowerCase()}`;
                
                // Create schema if it doesn't exist
                await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);

                // Create app_users table in PSP schema WITHOUT any unique constraints
                // Multi-tenant: same email can exist across different PSPs
                await client.query(`
                    CREATE TABLE IF NOT EXISTS ${schemaName}.app_users (
                        id SERIAL PRIMARY KEY,
                        email VARCHAR(255) NOT NULL,
                        full_name VARCHAR(255),
                        role VARCHAR(50) DEFAULT 'user',
                        password_hash TEXT,
                        status VARCHAR(50) DEFAULT 'active',
                        two_factor_enabled BOOLEAN DEFAULT FALSE,
                        last_login TIMESTAMP,
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP DEFAULT NOW()
                    )
                `);

                // Drop ANY existing unique constraints/indexes on email (multi-tenant fix)
                await client.query(`
                    DO $$ 
                    DECLARE
                        constraint_name TEXT;
                        index_name TEXT;
                    BEGIN
                        -- Drop all unique constraints on email
                        FOR constraint_name IN 
                            SELECT conname 
                            FROM pg_constraint 
                            WHERE conrelid = '${schemaName}.app_users'::regclass 
                            AND contype = 'u'
                        LOOP
                            EXECUTE format('ALTER TABLE ${schemaName}.app_users DROP CONSTRAINT IF EXISTS %I', constraint_name);
                        END LOOP;
                        
                        -- Drop all unique indexes on email
                        FOR index_name IN
                            SELECT indexname
                            FROM pg_indexes
                            WHERE schemaname = '${schemaName}' 
                            AND tablename = 'app_users'
                            AND indexdef LIKE '%UNIQUE%'
                        LOOP
                            EXECUTE format('DROP INDEX IF EXISTS ${schemaName}.%I', index_name);
                        END LOOP;
                    EXCEPTION
                        WHEN undefined_table THEN NULL;
                        WHEN others THEN NULL;
                    END $$;
                `);

                // Check if user already exists IN THIS PSP SCHEMA (programmatic check, no DB constraint)
                const existingUser = await client.query(`
                    SELECT id, email, full_name, role, status, two_factor_enabled, created_at 
                    FROM ${schemaName}.app_users WHERE email = $1
                `, [email]);

                if (existingUser.rows.length > 0) {
                    // User exists in THIS PSP - update role if needed
                    if (existingUser.rows[0].role !== role) {
                        await client.query(`
                            UPDATE ${schemaName}.app_users 
                            SET role = $1, updated_at = NOW()
                            WHERE email = $2
                        `, [role, email]);

                        return Response.json({
                            success: true,
                            user: {
                                ...existingUser.rows[0],
                                role: role,
                                psp_code: psp_code
                            },
                            message: `User already exists in this PSP - updated role to ${role}`
                        });
                    }

                    return Response.json({
                        success: true,
                        user: {
                            ...existingUser.rows[0],
                            psp_code: psp_code
                        },
                        message: 'User already exists in this PSP'
                    });
                }

                // Hash the password
                const password_hash = await bcrypt.hash(password || 'Welcome123!', 10);

                // Insert user - since we checked above, this should be safe
                const result = await client.query(`
                    INSERT INTO ${schemaName}.app_users (email, full_name, role, password_hash, status, two_factor_enabled)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING id, email, full_name, role, status, two_factor_enabled, created_at
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
                let errorMessage = err.message;
                if (err.code === '23505') {
                    errorMessage = `A user with this email already exists in PSP ${psp_code}`;
                }
                return Response.json({
                    success: false,
                    error: errorMessage
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
            const result = await pool.query('SELECT psp_code, psp_name FROM psp_settings ORDER BY psp_name');
            return Response.json({
                success: true,
                psps: result.rows
            });
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