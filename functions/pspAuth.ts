import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, psp_code, email, password } = await req.json();

        if (action === 'login') {
            const user = await base44.auth.me();
            if (!user) {
                return Response.json({
                    success: false,
                    error: 'Unauthorized'
                }, { status: 401 });
            }

            const pspUsers = await base44.asServiceRole.entities.PSPStaffUsers.filter({
                psp_code: psp_code.toUpperCase(),
                email: email,
                status: 'active'
            });

            if (pspUsers.length === 0) {
                return Response.json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }

            const dbUser = pspUsers[0];

            // Password verification using SHA-256
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            if (passwordHash !== dbUser.password_hash) {
                return Response.json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }

            return Response.json({
                success: true,
                session: {
                    email: dbUser.email,
                    full_name: dbUser.full_name,
                    role: dbUser.role,
                    user_id: dbUser.id,
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
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});