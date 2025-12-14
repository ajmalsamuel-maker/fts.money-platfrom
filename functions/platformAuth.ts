import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, email, password, role, full_name } = await req.json();

        // Simple hash function (for demo - use proper bcrypt in production)
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
                // Register a new platform admin
                if (!email || !password || !role) {
                    return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
                }

                // Check if user already exists
                const existingUsers = await base44.asServiceRole.entities.AuthUser.filter({ email });
                if (existingUsers.length > 0) {
                    return Response.json({ success: false, error: 'User already exists' }, { status: 400 });
                }

                // Hash password
                const hashedPassword = await hashPassword(password);

                // Create platform admin user
                const user = await base44.asServiceRole.entities.AuthUser.create({
                    email,
                    full_name: full_name || email.split('@')[0],
                    password_hash: hashedPassword,
                    platform_role: role,
                    account_type: 'platform_admin'
                });

                return Response.json({ 
                    success: true, 
                    user: { 
                        email: user.email, 
                        full_name: user.full_name,
                        platform_role: user.platform_role 
                    } 
                });
            }

            case 'login': {
                // Login platform admin
                if (!email || !password) {
                    return Response.json({ success: false, error: 'Email and password required' }, { status: 400 });
                }

                // Find user
                const users = await base44.asServiceRole.entities.AuthUser.filter({ 
                    email,
                    account_type: 'platform_admin'
                });

                if (users.length === 0) {
                    return Response.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
                }

                const user = users[0];

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
                        role: user.platform_role,
                        login_time: new Date().toISOString()
                    } 
                });
            }

            default:
                return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Platform auth error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});