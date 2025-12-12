import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { action, psp_code, email, password } = await req.json();

        if (action === 'getSettings') {
            // Fetch PSP and theme settings without authentication
            const pspResult = await pool.query('SELECT * FROM psp_settings LIMIT 1');
            const themeResult = await pool.query('SELECT * FROM theme_settings LIMIT 1');
            
            return Response.json({
                success: true,
                pspSettings: pspResult.rows[0] || null,
                themeSettings: themeResult.rows[0] || null
            });
        }

        if (action === 'verifyPSP') {
            const result = await pool.query('SELECT psp_code FROM psp_settings LIMIT 1');
            const pspCodeValue = result.rows[0]?.psp_code || 'PSP001';
            
            return Response.json({
                success: psp_code?.toUpperCase() === pspCodeValue,
                error: psp_code?.toUpperCase() !== pspCodeValue ? 'Invalid PSP code' : null
            });
        }

        if (action === 'verifyEmail') {
            const staffRoles = ['admin', 'finance', 'operations', 'compliance', 'technical', 'editor', 'viewer'];
            const result = await pool.query(`
                SELECT id, email, full_name, role, status, department, two_factor_enabled, two_factor_method, password_hash
                FROM app_users 
                WHERE email = $1 AND role = ANY($2::text[])
            `, [email, staffRoles]);
            
            if (!result.rows || result.rows.length === 0) {
                return Response.json({
                    success: false,
                    error: 'No staff account found with this email'
                });
            }

            const user = result.rows[0];

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
                    role: user.role,
                    department: user.department,
                    two_factor_enabled: user.two_factor_enabled,
                    two_factor_method: user.two_factor_method,
                    password_hash: user.password_hash
                }
            });
        }

        if (action === 'login') {
            const staffRoles = ['admin', 'finance', 'operations', 'compliance', 'technical', 'editor', 'viewer'];
            const result = await pool.query(`
                SELECT id, email, full_name, role, status, department, password_hash, two_factor_enabled, two_factor_method
                FROM app_users 
                WHERE email = $1 AND role = ANY($2::text[])
            `, [email, staffRoles]);

            if (!result.rows || result.rows.length === 0) {
                return Response.json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }

            const user = result.rows[0];

            if (user.password_hash !== password) {
                return Response.json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }

            // Get client IP
            const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                       req.headers.get('x-real-ip') || 
                       'unknown';

            // Update last login
            await pool.query(
                'UPDATE app_users SET last_login = NOW(), last_login_ip = $1 WHERE id = $2',
                [ip, user.id]
            );

            return Response.json({
                success: true,
                session: {
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    department: user.department,
                    user_id: user.id,
                    timestamp: Date.now(),
                    expires: Date.now() + (24 * 60 * 60 * 1000)
                },
                two_factor_enabled: user.two_factor_enabled,
                two_factor_method: user.two_factor_method
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