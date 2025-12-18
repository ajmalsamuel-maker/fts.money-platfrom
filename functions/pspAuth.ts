import pg from 'npm:pg@8.11.3';
import bcrypt from 'npm:bcrypt@5.1.1';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { action, psp_code, email, password } = await req.json();

        if (action === 'verifyPSP') {
            const client = await pool.connect();
            try {
                // Check if PSP exists in ProvisionedPSP entity
                const pspCheck = await client.query(`
                    SELECT data->>'psp_code' as psp_code, data->>'psp_name' as psp_name
                    FROM app_entities_data
                    WHERE entity_name = 'ProvisionedPSP' 
                    AND LOWER(data->>'psp_code') = LOWER($1)
                    LIMIT 1
                `, [psp_code]);
                
                if (pspCheck.rows.length === 0) {
                    return Response.json({
                        success: false,
                        error: 'Invalid PSP code'
                    });
                }
                
                // Also check if schema exists
                const schemaCheck = await client.query(`
                    SELECT schema_name 
                    FROM information_schema.schemata 
                    WHERE schema_name = $1
                `, [`psp_${psp_code.toLowerCase()}`]);
                
                if (schemaCheck.rows.length === 0) {
                    return Response.json({
                        success: false,
                        error: 'PSP schema not provisioned yet'
                    });
                }
                
                return Response.json({
                    success: true,
                    psp: {
                        psp_code: psp_code.toUpperCase(),
                        psp_name: pspCheck.rows[0].psp_name
                    }
                });
            } finally {
                client.release();
            }
        }

        if (action === 'verifyEmail') {
            const client = await pool.connect();
            
            try {
                // CRITICAL: Set schema to PSP-isolated schema ONLY (PCI/GDPR compliance)
                const schemaName = `psp_${psp_code.toLowerCase()}`;
                await client.query(`SET search_path TO ${schemaName}`);
                
                const result = await client.query(`
                    SELECT id, email, full_name, role, status
                    FROM app_users 
                    WHERE email = $1
                    LIMIT 1
                `, [email]);
                
                const user = result.rows[0];
                
                if (!user) {
                    return Response.json({
                        success: false,
                        error: 'No account found with this email for this PSP'
                    });
                }

                if (user.status !== 'active') {
                    return Response.json({
                        success: false,
                        error: 'Account is not active'
                    });
                }

                return Response.json({
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        full_name: user.full_name,
                        role: user.role
                    }
                });
            } finally {
                client.release();
            }
        }

        if (action === 'login') {
            const client = await pool.connect();
            
            try {
                // CRITICAL: Set schema to PSP-isolated schema ONLY (PCI/GDPR compliance)
                const schemaName = `psp_${psp_code.toLowerCase()}`;
                await client.query(`SET search_path TO ${schemaName}`);
                
                // Query from isolated schema
                const result = await client.query(`
                    SELECT id, email, full_name, role, status, password_hash
                    FROM app_users 
                    WHERE email = $1
                    LIMIT 1
                `, [email]);

                const user = result.rows[0];

                if (!user || user.status !== 'active') {
                    return Response.json({
                        success: false,
                        error: 'Invalid credentials'
                    });
                }

                // Verify password
                const passwordMatch = await bcrypt.compare(password, user.password_hash);
                if (!passwordMatch) {
                    // Log failed attempt
                    await client.query(`
                        INSERT INTO audit_logs (action, user_email, details)
                        VALUES ($1, $2, $3)
                    `, ['LOGIN_FAILED', email, JSON.stringify({ 
                        psp_code, 
                        reason: 'Invalid password',
                        timestamp: new Date().toISOString()
                    })]);
                    
                    return Response.json({
                        success: false,
                        error: 'Invalid credentials'
                    });
                }

                // Log successful login (PCI DSS Requirement 10.2.5)
                await client.query(`
                    INSERT INTO audit_logs (action, user_email, details)
                    VALUES ($1, $2, $3)
                `, ['LOGIN_SUCCESS', email, JSON.stringify({ 
                    psp_code, 
                    schema: schemaName,
                    timestamp: new Date().toISOString()
                })]);

                // Update last login
                await client.query(`
                    UPDATE app_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1
                `, [user.id]);

                return Response.json({
                    success: true,
                    session: {
                        email: user.email,
                        full_name: user.full_name,
                        role: user.role,
                        user_id: user.id,
                        psp_code: psp_code,
                        schema: schemaName,
                        timestamp: Date.now(),
                        expires: Date.now() + (24 * 60 * 60 * 1000)
                    },
                    two_factor_enabled: false
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