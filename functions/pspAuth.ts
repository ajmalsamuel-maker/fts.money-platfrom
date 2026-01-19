import { queryPSPStaffUser, verifyPassword, updatePSPStaffLastLogin, getClientIP, createAuditLog } from './db/authUtils.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, email, password } = await req.json();

        if (action === 'login') {
            const ipAddress = getClientIP(req);

            if (!psp_code || !email || !password) {
                return Response.json({
                    success: false,
                    error: 'PSP code, email, and password required'
                }, { status: 400 });
            }

            const user = await queryPSPStaffUser(email, psp_code.toUpperCase());
            
            if (!user) {
                await createAuditLog({
                    event_type: 'user_login_failed',
                    category: 'authentication',
                    severity: 'warning',
                    user_email: email,
                    action: 'login',
                    description: `Failed PSP login attempt for ${email} on PSP ${psp_code}`,
                    ip_address: ipAddress,
                    status: 'failure',
                    error_message: 'User not found'
                });

                return Response.json({
                    success: false,
                    error: 'Invalid credentials'
                }, { status: 401 });
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
                    description: `Failed PSP login attempt for ${email} - invalid password`,
                    ip_address: ipAddress,
                    status: 'failure',
                    error_message: 'Invalid password'
                });

                return Response.json({
                    success: false,
                    error: 'Invalid credentials'
                }, { status: 401 });
            }

            await updatePSPStaffLastLogin(user.id, ipAddress);

            await createAuditLog({
                event_type: 'user_login',
                category: 'authentication',
                severity: 'info',
                user_email: email,
                user_id: user.id,
                user_role: user.role,
                action: 'login',
                description: `PSP staff ${email} logged in successfully`,
                ip_address: ipAddress,
                user_agent: req.headers.get('user-agent'),
                status: 'success'
            });

            return Response.json({
                success: true,
                session: {
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    user_id: user.id,
                    psp_code: psp_code.toUpperCase(),
                    timestamp: Date.now(),
                    expires: Date.now() + (24 * 60 * 60 * 1000)
                },
                two_factor_enabled: false
            });
        }

        return Response.json({
            success: false,
            error: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        console.error('PSP auth error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});