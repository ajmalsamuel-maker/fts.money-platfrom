import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, psp_code, email, password } = await req.json();

        if (action === 'verifyPSP') {
            // Check against ProvisionedPSP entity
            const psps = await base44.asServiceRole.entities.ProvisionedPSP.list();
            const psp = psps.find(p => p.psp_code?.toUpperCase() === psp_code?.toUpperCase());
            
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
            // Check against User entity with staff roles
            const users = await base44.asServiceRole.entities.User.list();
            const user = users.find(u => u.email === email && u.role === 'admin');
            
            if (!user) {
                return Response.json({
                    success: false,
                    error: 'No account found with this email'
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
        }

        if (action === 'login') {
            // Simple password check (in production use proper auth)
            const users = await base44.asServiceRole.entities.User.list();
            const user = users.find(u => u.email === email);

            if (!user) {
                return Response.json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }

            // For demo: accept any password (in production, verify properly)
            return Response.json({
                success: true,
                session: {
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    user_id: user.id,
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
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});