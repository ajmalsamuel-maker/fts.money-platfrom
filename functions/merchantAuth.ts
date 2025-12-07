import { createClient } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        // Use service role client for unauthenticated merchant login
        const base44 = createClient({
            appId: Deno.env.get('BASE44_APP_ID'),
            serviceRoleKey: Deno.env.get('BASE44_SERVICE_ROLE_KEY')
        });
        
        const body = await req.json();
        const { action, email, password, user_id, new_password } = body;

        if (action === 'login') {
            console.log('Login attempt for:', email);
            
            // Query PostgreSQL for merchant user
            const response = await base44.functions.invoke('dbCore', {
                action: 'query',
                sql: `
                    SELECT id, merchant_id, merchant_name, email, full_name, role, status, 
                           temp_password, must_change_password, two_factor_enabled, last_login,
                           permissions, allowed_terminals, phone
                    FROM merchant_users 
                    WHERE email = $1 AND status = 'active'
                `,
                params: [email]
            });

            console.log('DB Response:', response);

            if (!response.data || !response.data.data || !response.data.data.rows || response.data.data.rows.length === 0) {
                console.log('User not found in database');
                return Response.json({ 
                    success: false, 
                    error: 'Invalid credentials',
                    debug: 'User not found or not active'
                }, { status: 401 });
            }

            const user = response.data.data.rows[0];
            console.log('User found:', user.email, 'Status:', user.status);

            // Check password (temp_password for now, in production use proper hashing)
            if (user.temp_password !== password) {
                console.log('Password mismatch');
                return Response.json({ 
                    success: false, 
                    error: 'Invalid credentials',
                    debug: 'Password incorrect'
                }, { status: 401 });
            }

            // Update last login
            await base44.functions.invoke('dbCore', {
                action: 'execute',
                sql: `UPDATE merchant_users SET last_login = NOW() WHERE id = $1`,
                params: [user.id]
            });

            // Create session token
            const session = {
                user_id: user.id,
                merchant_id: user.merchant_id,
                merchant_name: user.merchant_name,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                permissions: user.permissions,
                must_change_password: user.must_change_password,
                two_factor_enabled: user.two_factor_enabled,
                timestamp: Date.now()
            };

            return Response.json({
                success: true,
                session,
                must_change_password: user.must_change_password
            });
        }

        if (action === 'validate') {
            // Validate session by checking if user still exists and is active
            const { data: result } = await base44.functions.invoke('dbCore', {
                action: 'query',
                sql: `
                    SELECT id, merchant_id, merchant_name, email, full_name, role, status,
                           permissions, must_change_password
                    FROM merchant_users 
                    WHERE id = $1 AND status = 'active'
                `,
                params: [user_id]
            });

            if (!result.rows || result.rows.length === 0) {
                return Response.json({ 
                    success: false, 
                    error: 'Session expired' 
                }, { status: 401 });
            }

            return Response.json({
                success: true,
                user: result.rows[0]
            });
        }

        if (action === 'change_password') {
            // Update password and clear must_change_password flag
            await base44.functions.invoke('dbCore', {
                action: 'execute',
                sql: `
                    UPDATE merchant_users 
                    SET temp_password = $1, must_change_password = false 
                    WHERE id = $2
                `,
                params: [new_password, user_id]
            });

            return Response.json({ success: true });
        }

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