import { queryAuthUser, createAuthUser, hashPassword, verifyPassword, getClientIP, createAuditLog } from './db/authUtils.js';
import postgres from 'npm:postgres@3.4.4';

Deno.serve(async (req) => {
    try {
        const sql = postgres(Deno.env.get('DATABASE_URL'), { ssl: 'require' });
        const { action, email, password, full_name, community_role } = await req.json();
        const ipAddress = getClientIP(req);

        switch (action) {
            case 'register': {
                if (!email || !password || !full_name) {
                    return Response.json({ success: false, error: 'Email, password, and full name required' }, { status: 400 });
                }

                // Check if user already exists
                const existing = await queryAuthUser(email, 'community');
                if (existing) {
                    return Response.json({ success: false, error: 'Email already registered' }, { status: 400 });
                }

                const hashedPassword = await hashPassword(password);
                
                // Validate role
                const validRoles = ['psp_owner', 'psp_administrator', 'developer', 'partner', 'reseller', 'operations', 'analyst'];
                const normalizedRole = community_role ? community_role.toLowerCase().replace(/\s+/g, '_') : 'psp_owner';
                const role = validRoles.includes(normalizedRole) ? normalizedRole : 'psp_owner';

                // Create user in PostgreSQL
                const result = await sql`
                    INSERT INTO auth_users (email, full_name, password_hash, account_type, community_role, status, created_date)
                    VALUES (${email}, ${full_name}, ${hashedPassword}, 'community', ${role}, 'active', CURRENT_TIMESTAMP)
                    RETURNING id, email, full_name, community_role
                `;

                await createAuditLog({
                    event_type: 'user_created',
                    category: 'user_management',
                    severity: 'info',
                    user_email: email,
                    user_role: role,
                    action: 'register',
                    description: `Community user ${email} registered`,
                    status: 'success'
                });

                await sql.end();
                return Response.json({ success: true, user: result[0] });
            }

            case 'login': {
                if (!email || !password) {
                    return Response.json({ success: false, error: 'Email and password required' }, { status: 400 });
                }

                const user = await queryAuthUser(email, 'community');
                
                if (!user) {
                    await createAuditLog({
                        event_type: 'user_login_failed',
                        category: 'authentication',
                        severity: 'warning',
                        user_email: email,
                        action: 'login',
                        description: `Failed community login for ${email}`,
                        ip_address: ipAddress,
                        status: 'failure',
                        error_message: 'User not found'
                    });

                    await sql.end();
                    return Response.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
                }

                const isValid = await verifyPassword(password, user.password_hash);
                
                if (!isValid) {
                    await createAuditLog({
                        event_type: 'user_login_failed',
                        category: 'authentication',
                        severity: 'warning',
                        user_email: email,
                        user_id: user.id,
                        action: 'login',
                        description: `Failed community login for ${email}`,
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
                    user_email: email,
                    user_id: user.id,
                    user_role: user.community_role,
                    action: 'login',
                    description: `Community user ${email} logged in`,
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
                        community_role: user.community_role || 'psp_owner',
                        login_time: new Date().toISOString()
                    } 
                });
            }

            case 'reset_password': {
                if (!email || !password) {
                    return Response.json({ success: false, error: 'Email and password required' }, { status: 400 });
                }

                const user = await queryAuthUser(email, 'community');
                if (!user) {
                    return Response.json({ success: false, error: 'User not found' }, { status: 404 });
                }

                const hashedPassword = await hashPassword(password);
                
                await sql`
                    UPDATE auth_users 
                    SET password_hash = ${hashedPassword}
                    WHERE id = ${user.id}
                `;

                await createAuditLog({
                    event_type: 'user_password_reset',
                    category: 'security',
                    severity: 'info',
                    user_id: user.id,
                    user_email: email,
                    action: 'reset_password',
                    description: `Community user ${email} reset their password`,
                    status: 'success'
                });

                await sql.end();
                return Response.json({ success: true, message: 'Password reset successfully' });
            }

            default:
                await sql.end();
                return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Community auth error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});