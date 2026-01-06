import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, email, password, full_name, community_role } = await req.json();

        // Simple hash function
        const hashPassword = async (password) => {
            const encoder = new TextEncoder();
            const data = encoder.encode(password + 'fts_salt_2025');
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        };

        const verifyPassword = async (password, hash) => {
            const computed = await hashPassword(password);
            return computed === hash;
        };

        switch (action) {
            case 'register': {
                // Register a new community user
                if (!email || !password || !full_name) {
                    return Response.json({ success: false, error: 'Email, password, and full name are required' }, { status: 400 });
                }

                // Check if user already exists for THIS account type (multi-tenant: same email can exist for different account types)
                const existingUsers = await base44.asServiceRole.entities.AuthUser.filter({ email, account_type: 'community' });
                if (existingUsers.length > 0) {
                    return Response.json({ success: false, error: 'Email already registered as community user' }, { status: 400 });
                }

                // Hash password
                const hashedPassword = await hashPassword(password);

                // Normalize role (accept any case variations)
                const normalizedRole = community_role ? community_role.toLowerCase().replace(/\s+/g, '_') : 'psp_owner';
                const validRoles = ['psp_owner', 'psp_administrator', 'developer', 'partner', 'reseller', 'operations', 'analyst'];
                const role = validRoles.includes(normalizedRole) ? normalizedRole : 'psp_owner';

                // Create community user
                const user = await base44.asServiceRole.entities.AuthUser.create({
                    email,
                    full_name: full_name || email.split('@')[0],
                    password_hash: hashedPassword,
                    community_role: role,
                    account_type: 'community'
                });

                return Response.json({ 
                    success: true, 
                    user: { 
                        email: user.email, 
                        full_name: user.full_name 
                    } 
                });
            }

            case 'login': {
                // Login community user
                if (!email || !password) {
                    return Response.json({ success: false, error: 'Email and password required' }, { status: 400 });
                }

                // Find user - list all and filter manually
                const allUsers = await base44.asServiceRole.entities.AuthUser.list();
                const users = allUsers.filter(u => u.email === email && u.account_type === 'community');

                if (users.length === 0) {
                    return Response.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
                }

                const user = users.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

                // Verify password
                const isValid = await verifyPassword(password, user.password_hash);
                if (!isValid) {
                    return Response.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
                }

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

            default:
                return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Community auth error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});