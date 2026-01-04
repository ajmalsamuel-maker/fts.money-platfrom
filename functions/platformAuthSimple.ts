import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, email, password, full_name, role } = await req.json();

        if (action === 'login') {
            // Query users
            const authUsers = await base44.asServiceRole.entities.AuthUser.filter({ email });
            
            if (!authUsers || authUsers.length === 0) {
                return Response.json({ success: false, error: 'Invalid credentials' });
            }

            const user = authUsers[0];
            
            // Check account type
            const accountType = user.account_type || user.data?.account_type;
            if (accountType !== 'platform_admin') {
                return Response.json({ success: false, error: 'Not a platform admin account' });
            }

            return Response.json({
                success: true,
                user: {
                    email: user.email || user.data?.email,
                    full_name: user.full_name || user.data?.full_name,
                    platform_role: user.platform_role || user.data?.platform_role
                }
            });
        }

        if (action === 'register') {
            // Create new platform admin
            const newUser = await base44.asServiceRole.entities.AuthUser.create({
                email,
                full_name,
                password_hash: password,
                platform_role: role,
                account_type: 'platform_admin'
            });

            return Response.json({ success: true, user: newUser });
        }

        return Response.json({ success: false, error: 'Invalid action' });
    } catch (error) {
        console.error('Auth error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});