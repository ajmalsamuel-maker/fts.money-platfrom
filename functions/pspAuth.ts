import pg from 'npm:pg@8.11.3';

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
                // CRITICAL: Query from isolated PSP schema for PCI/GDPR compliance
                const schemaName = `psp_${psp_code.toLowerCase()}`;
                await client.query(`SET search_path TO ${schemaName}`);
                
                const result = await client.query('SELECT * FROM psp_settings WHERE UPPER(psp_code) = UPPER($1) LIMIT 1', [psp_code]);
                const psp = result.rows[0];
                
                return Response.json({
                    success: !!psp,
                    psp: psp ? {
                        id: psp.id,
                        psp_code: psp.psp_code,
                        psp_name: psp.psp_name,
                        branding: psp.branding
                    } : null,
                    error: !psp ? 'Invalid PSP code' : null
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