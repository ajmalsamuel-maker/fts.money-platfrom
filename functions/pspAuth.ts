import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        // Initialize SDK but don't require auth - login runs in system context
        const base44 = createClientFromRequest(req);
        let user;
        try {
            user = await base44.auth.me();
        } catch (err) {
            console.log('[PSP_AUTH] Running in system context');
        }

        const { action, psp_code, email, password } = await req.json();

        if (action === 'verifyPSP') {
            const client = await pool.connect();
            try {
                // Check if PSP schema exists directly
                const schemaCheck = await client.query(`
                    SELECT schema_name 
                    FROM information_schema.schemata 
                    WHERE schema_name = $1
                `, [`psp_${psp_code.toLowerCase().replace(/-/g, '_')}`]);
                
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
                        psp_name: psp_code.toUpperCase()
                    }
                });
            } finally {
                client.release();
            }
        }

        if (action === 'verifyEmail') {
            const client = await pool.connect();
            
            try {
                const schemaName = `psp_${psp_code.toLowerCase().replace(/-/g, '_')}`;
                await client.query(`SET search_path TO "${schemaName}"`);
                
                const result = await client.query(`
                    SELECT id, email, full_name, role, status
                    FROM psp_staff_users 
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
                const schemaName = `psp_${psp_code.toLowerCase().replace(/-/g, '_')}`;
                await client.query(`SET search_path TO "${schemaName}"`);
                
                const result = await client.query(`
                    SELECT id, email, full_name, role, status, password_hash
                    FROM psp_staff_users 
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

                // Password verification using SHA-256 (matching managePSPUsers)
                const encoder = new TextEncoder();
                const data = encoder.encode(password);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                const isValid = passwordHash === user.password_hash;
                
                if (!isValid) {
                    return Response.json({
                        success: false,
                        error: 'Invalid credentials'
                    });
                }

                await client.query(`
                    UPDATE psp_staff_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1
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