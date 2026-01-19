import { queryAuthUser, createAuthUser, hashPassword, verifyPassword, getClientIP, createAuditLog } from './db/authUtils.js';
import postgres from 'npm:postgres@3.4.4';

Deno.serve(async (req) => {
    try {
        const sql = postgres(Deno.env.get('DATABASE_URL'), { ssl: 'require' });
        const { action, email, password, role, full_name } = await req.json();
        const ipAddress = getClientIP(req);

        switch (action) {
            case 'register': {
                if (!email || !password || !role) {
                    return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
                }

                const existing = await queryAuthUser(email, 'platform_admin');
                if (existing) {
                    return Response.json({ success: false, error: 'User already exists' }, { status: 400 });
                }

                const hashedPassword = await hashPassword(password);

                const result = await sql`
                    INSERT INTO auth_users (email, full_name, password_hash, account_type, platform_role, status, created_date)
                    VALUES (${email}, ${full_name || email.split('@')[0]}, ${hashedPassword}, 'platform_admin', ${role}, 'active', CURRENT_TIMESTAMP)
                    RETURNING id, email, full_name, platform_role
                `;

                await createAuditLog({
                    event_type: 'user_created',
                    category: 'user_management',
                    severity: 'info',
                    user_email: email,
                    user_role: role,
                    action: 'register',
                    description: `Platform user ${email} registered with role ${role}`,
                    status: 'success'
                });

                await sql.end();
                return Response.json({ success: true, user: result[0] });
            }

            case 'login': {
                if (!email || !password) {
                    return Response.json({ success: false, error: 'Email and password required' }, { status: 400 });
                }

                const user = await queryAuthUser(email, 'platform_admin');
                
                if (!user) {
                    await createAuditLog({
                        event_type: 'user_login_failed',
                        category: 'authentication',
                        severity: 'warning',
                        user_email: email,
                        action: 'login',
                        description: `Failed platform login for ${email}`,
                        ip_address: ipAddress,
                        status: 'failure',
                        error_message: 'User not found'
                    });

                    await sql.end();
                    return Response.json({ success: false, error: 'User not found' }, { status: 401 });
                }

                const isValid = await verifyPassword(password, user.password_hash);
                
                if (!isValid) {
                    await createAuditLog({
                        event_type: 'user_login_failed',
                        category: 'authentication',
                        severity: 'warning',
                        user_id: user.id,
                        user_email: email,
                        user_role: user.platform_role,
                        action: 'login',
                        description: `Failed platform login for ${email}`,
                        ip_address: ipAddress,
                        status: 'failure',
                        error_message: 'Invalid password'
                    });

                    await sql.end();
                    return Response.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
                }

                await createAuditLog({
                    event_type: 'user_login',
                    category: 'authentication',
                    severity: 'info',
                    user_id: user.id,
                    user_email: user.email,
                    user_role: user.platform_role,
                    action: 'login',
                    description: `Platform user ${user.email} logged in`,
                    ip_address: ipAddress,
                    user_agent: req.headers.get('user-agent'),
                    status: 'success'
                });

                await sql.end();
                return Response.json({ 
                    success: true, 
                    user: { 
                        email: user.email, 
                        full_name: user.full_name,
                        role: user.platform_role,
                        login_time: new Date().toISOString()
                    } 
                });
            }

            default:
                await sql.end();
                return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Platform auth error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});