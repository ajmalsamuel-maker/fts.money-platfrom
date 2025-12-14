import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import * as bcrypt from 'npm:bcrypt@5.1.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, email, password, role, full_name } = await req.json();

        switch (action) {
            case 'register': {
                // Register a new platform admin
                if (!email || !password || !role) {
                    return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
                }

                // Check if user already exists
                const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
                if (existingUsers.length > 0) {
                    return Response.json({ success: false, error: 'User already exists' }, { status: 400 });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create platform admin user
                const user = await base44.asServiceRole.entities.User.create({
                    email,
                    full_name: full_name || email.split('@')[0],
                    role: 'admin',
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
                const users = await base44.asServiceRole.entities.User.filter({ 
                    email,
                    account_type: 'platform_admin'
                });

                if (users.length === 0) {
                    return Response.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
                }

                const user = users[0];

                // Verify password
                const isValid = await bcrypt.compare(password, user.password_hash);
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