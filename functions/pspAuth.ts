import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, psp_code, email, password } = await req.json();

        if (action === 'getSettings') {
            // Fetch PSP and theme settings without authentication
            const pspSettings = await base44.asServiceRole.entities.PSPSettings.list();
            const themeSettings = await base44.asServiceRole.entities.ThemeSettings.list();
            
            return Response.json({
                success: true,
                pspSettings: pspSettings[0] || null,
                themeSettings: themeSettings[0] || null
            });
        }

        if (action === 'verifyPSP') {
            const pspSettings = await base44.asServiceRole.entities.PSPSettings.list();
            const pspCodeValue = pspSettings[0]?.psp_code || 'PSP001';
            
            return Response.json({
                success: psp_code?.toUpperCase() === pspCodeValue,
                error: psp_code?.toUpperCase() !== pspCodeValue ? 'Invalid PSP code' : null
            });
        }

        if (action === 'verifyEmail') {
            const users = await base44.asServiceRole.entities.AppUser.list();
            const staffRoles = ['admin', 'finance', 'operations', 'compliance', 'technical', 'editor', 'viewer'];
            const user = users.find(u => u.email === email && staffRoles.includes(u.role));
            
            if (!user) {
                return Response.json({
                    success: false,
                    error: 'No staff account found with this email'
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
                    role: user.role,
                    department: user.department,
                    two_factor_enabled: user.two_factor_enabled,
                    two_factor_method: user.two_factor_method,
                    password_hash: user.password_hash
                }
            });
        }

        if (action === 'login') {
            const users = await base44.asServiceRole.entities.AppUser.list();
            const staffRoles = ['admin', 'finance', 'operations', 'compliance', 'technical', 'editor', 'viewer'];
            const user = users.find(u => u.email === email && staffRoles.includes(u.role));

            if (!user || user.password_hash !== password) {
                return Response.json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }

            // Update last login
            await base44.asServiceRole.entities.AppUser.update(user.id, {
                last_login: new Date().toISOString(),
                last_login_ip: 'web'
            });

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