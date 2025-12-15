import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

// Helper to get PSP-isolated database connection
const getPSPConnection = async (pspCode) => {
    const pool = new Pool({
        connectionString: Deno.env.get("DATABASE_URL"),
        ssl: { rejectUnauthorized: false }
    });
    
    const client = await pool.connect();
    const schemaName = `psp_${pspCode.toLowerCase()}`;
    
    // Set schema search path for data isolation
    await client.query(`SET search_path TO ${schemaName}, public`);
    
    return { client, pool, schemaName };
};

Deno.serve(async (req) => {
    try {
        const { action, psp_code, email, password } = await req.json();

        if (action === 'verifyPSP') {
            // Check PSP code from public schema (platform-wide table)
            const pool = new Pool({
                connectionString: Deno.env.get("DATABASE_URL"),
                ssl: { rejectUnauthorized: false }
            });
            
            console.log('Verifying PSP code:', psp_code);
            const result = await pool.query('SELECT * FROM public.psp_settings WHERE UPPER(psp_code) = UPPER($1) LIMIT 1', [psp_code]);
            console.log('Query result:', result.rows);
            
            const psp = result.rows[0];
            await pool.end();
            
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
        }

        if (action === 'verifyEmail') {
            // Query app_users table from PSP-specific schema
            const { client, pool } = await getPSPConnection(psp_code);
            
            try {
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
                await pool.end();
            }
        }

        if (action === 'login') {
            // Query app_users from PSP-specific schema
            const { client, pool, schemaName } = await getPSPConnection(psp_code);
            
            try {
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

                // Log login attempt (PCI compliance requirement)
                await client.query(`
                    INSERT INTO audit_logs (action, user_email, details)
                    VALUES ($1, $2, $3)
                `, ['LOGIN', email, JSON.stringify({ success: true, psp_code })]);

                // For demo: accept any password (in production, verify password_hash)
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
                await pool.end();
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