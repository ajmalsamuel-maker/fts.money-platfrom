import { queryMerchantUser, verifyPassword, updateMerchantUserLastLogin, getClientIP, createAuditLog, hashPassword } from './db/authUtils.js';
import postgres from 'npm:postgres@3.4.4';

// Public endpoint - no authentication required
Deno.serve(async (req) => {
    // Set CORS headers for public access
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    }

    try {
        const sql = postgres(Deno.env.get('DATABASE_URL'), { ssl: 'require' });
        const body = await req.json();
        const { action, email, password, user_id, new_password, merchant_code } = body;
        const ipAddress = getClientIP(req);

        if (action === 'login') {
            if (!email || !password || !merchant_code) {
                return Response.json({ 
                    success: false, 
                    error: 'Email, password, and merchant code required'
                }, { status: 400 });
            }

            const user = await queryMerchantUser(email, merchant_code);

            if (!user) {
                await createAuditLog({
                    event_type: 'user_login_failed',
                    category: 'authentication',
                    severity: 'warning',
                    user_email: email,
                    action: 'login',
                    description: `Failed merchant login for ${email} on merchant ${merchant_code}`,
                    ip_address: ipAddress,
                    status: 'failure',
                    error_message: 'User not found'
                });

                return Response.json({ 
                    success: false, 
                    error: 'Invalid credentials'
                }, { status: 401 });
            }

            // Verify password
            const isValid = await verifyPassword(password, user.password_hash);
            
            if (!isValid) {
                await createAuditLog({
                    event_type: 'user_login_failed',
                    category: 'authentication',
                    severity: 'warning',
                    user_email: email,
                    user_id: user.id,
                    action: 'login',
                    description: `Failed merchant login for ${email} - invalid password`,
                    ip_address: ipAddress,
                    status: 'failure',
                    error_message: 'Invalid password'
                });

                return Response.json({ 
                    success: false, 
                    error: 'Invalid credentials'
                }, { status: 401 });
            }

            // Get PSP code from merchant
            const merchantQuery = await sql`
                SELECT psp_code FROM merchants 
                WHERE merchant_code = ${merchant_code}
                LIMIT 1
            `;

            const pspCode = merchantQuery[0]?.psp_code || merchant_code.split(/[-_]/)[0];

            // Update last login
            await updateMerchantUserLastLogin(user.id, ipAddress);

            // Audit log
            await createAuditLog({
                event_type: 'user_login',
                category: 'authentication',
                severity: 'info',
                user_email: email,
                user_id: user.id,
                user_role: user.role,
                action: 'login',
                description: `Merchant user ${email} logged in successfully`,
                ip_address: ipAddress,
                user_agent: req.headers.get('user-agent'),
                status: 'success'
            });

            return Response.json({
                success: true,
                session: {
                    user_id: user.id,
                    merchant_id: user.merchant_id,
                    merchant_code: merchant_code,
                    merchant_name: user.merchant_name,
                    psp_code: pspCode,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    permissions: user.permissions,
                    must_change_password: user.must_change_password,
                    timestamp: Date.now()
                },
                must_change_password: user.must_change_password
            });
        }

        if (action === 'change_password') {
            if (!user_id || !new_password) {
                return Response.json({ 
                    success: false, 
                    error: 'User ID and new password required'
                }, { status: 400 });
            }

            const hashedPassword = await hashPassword(new_password);
            
            await sql`
                UPDATE merchant_users 
                SET password_hash = ${hashedPassword}, must_change_password = false
                WHERE id = ${user_id}
            `;

            await createAuditLog({
                event_type: 'user_password_changed',
                category: 'security',
                severity: 'info',
                user_id: user_id,
                action: 'change_password',
                description: `Merchant user changed their password`,
                status: 'success'
            });

            return Response.json({ success: true });
        }

        await sql.end();

        return Response.json({ 
            success: false, 
            error: 'Invalid action' 
        }, { status: 400 });

    } catch (error) {
        console.error('Merchant auth error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});