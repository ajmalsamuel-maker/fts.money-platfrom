import pg from 'npm:pg@8.11.3';
import bcrypt from 'npm:bcrypt@5.1.1';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { action, email, full_name, role, psp_code, password, user_id, status } = await req.json();

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
                await client.query(`SET search_path TO ${schemaName}`);
                
                // Ensure app_users table exists in PSP schema
                await client.query(`
                    CREATE TABLE IF NOT EXISTS app_users (
                        id SERIAL PRIMARY KEY,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        full_name VARCHAR(255),
                        role VARCHAR(50) DEFAULT 'user',
                        password_hash TEXT,
                        status VARCHAR(50) DEFAULT 'active',
                        last_login TIMESTAMP,
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP DEFAULT NOW()
                    )
                `);

                // Hash the password
                const password_hash = await bcrypt.hash(password || 'Welcome123!', 10);

                // Insert user into PSP schema
                const result = await client.query(`
                    INSERT INTO app_users (email, full_name, role, password_hash, status)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id, email, full_name, role, status, created_at
                `, [email, full_name, role || 'user', password_hash, status || 'active']);

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
            if (!psp_code) {
                // List all users from all PSP schemas
                const pspResult = await pool.query('SELECT psp_code FROM psp_settings ORDER BY psp_code');
                const allUsers = [];
                
                for (const psp of pspResult.rows) {
                    const client = await pool.connect();
                    try {
                        const schemaName = `psp_${psp.psp_code.toLowerCase()}`;
                        await client.query(`SET search_path TO ${schemaName}`);
                        
                        const result = await client.query('SELECT id, email, full_name, role, status, last_login, created_at FROM app_users ORDER BY id DESC');
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
                    await client.query(`SET search_path TO ${schemaName}`);
                    
                    const result = await client.query('SELECT id, email, full_name, role, status, last_login, created_at FROM app_users ORDER BY id DESC');
                    
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
                await client.query(`SET search_path TO ${schemaName}`);
                
                const result = await client.query(`
                    UPDATE app_users 
                    SET full_name = COALESCE($1, full_name),
                        role = COALESCE($2, role),
                        status = COALESCE($3, status),
                        updated_at = NOW()
                    WHERE id = $4
                    RETURNING id, email, full_name, role, status, created_at
                `, [full_name, role, status, user_id]);

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
                await client.query(`SET search_path TO ${schemaName}`);
                
                await client.query('DELETE FROM app_users WHERE id = $1', [user_id]);
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