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

                // Find user - list all and filter manually since Base44 filter may not work on nested fields
                const allUsers = await base44.asServiceRole.entities.AuthUser.list();
                const users = allUsers.filter(u => u.email === email);
                console.log('Found users:', users.length, users.map(u => ({ email: u.email, account_type: u.account_type })));
                
                const platformUsers = users.filter(u => u.account_type === 'platform_admin');

                if (platformUsers.length === 0) {
                    return Response.json({ success: false, error: 'User not found' }, { status: 401 });
                }

                // Sort by created_date descending and take the most recent one
                const user = platformUsers.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

                // Verify password
                const isValid = await verifyPassword(password, user.password_hash);
                console.log('Password verification:', { isValid, providedPassword: password, storedHash: user.password_hash });
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