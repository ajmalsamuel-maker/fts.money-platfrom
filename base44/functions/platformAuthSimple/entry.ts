import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        console.log('🔍 Request received, action:', req.method);
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        console.log('📦 Body parsed:', body);
        const { action, email, password, full_name, role, account_type } = body;
        console.log('🎯 Action:', action, 'Account Type:', account_type);

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

        if (action === 'listUsers') {
            const allUsers = await base44.asServiceRole.entities.AuthUser.list();
            
            console.log('Total AuthUsers:', allUsers.length);
            console.log('Sample user structure:', JSON.stringify(allUsers[0], null, 2));
            
            const filtered = allUsers.filter(u => {
                // Check all possible locations for account_type
                const userAccountType = u.account_type || u.data?.account_type;
                const matches = userAccountType === account_type;
                
                if (matches) {
                    console.log('Found matching user:', u.email || u.data?.email, 'Type:', userAccountType);
                }
                
                return matches;
            });

            console.log(`Filtered ${filtered.length} users with account_type=${account_type}`);

            const mapped = filtered.map(u => {
                // Try to get data from both root and nested data object
                const userData = {
                    id: u.id,
                    email: u.email || u.data?.email || u.data?.data?.email,
                    full_name: u.full_name || u.data?.full_name || u.data?.data?.full_name,
                    platform_role: u.platform_role || u.data?.platform_role || u.data?.data?.platform_role,
                    community_role: u.community_role || u.data?.community_role || u.data?.data?.community_role,
                    account_type: u.account_type || u.data?.account_type || u.data?.data?.account_type,
                    last_login: u.last_login || u.data?.last_login || u.data?.data?.last_login,
                    created_date: u.created_date,
                    allowed_services: u.allowed_services || u.data?.allowed_services || u.data?.data?.allowed_services
                };
                console.log('Mapped user:', userData);
                return userData;
            });

            return Response.json({ success: true, users: mapped, total: allUsers.length, filtered: filtered.length });
        }

        if (action === 'updateUser') {
            const { userId, updates } = body;
            await base44.asServiceRole.entities.AuthUser.update(userId, updates);
            return Response.json({ success: true });
        }

        if (action === 'updateRole') {
            const { userId, role } = body;
            await base44.asServiceRole.entities.AuthUser.update(userId, {
                platform_role: role
            });
            return Response.json({ success: true });
        }

        if (action === 'deleteUser') {
            const { userId } = body;
            await base44.asServiceRole.entities.AuthUser.delete(userId);
            return Response.json({ success: true });
        }

        if (action === 'resetPassword') {
            const { email, newPassword } = body;
            const authUsers = await base44.asServiceRole.entities.AuthUser.filter({ email });
            if (!authUsers || authUsers.length === 0) {
                return Response.json({ success: false, message: 'User not found' });
            }
            const user = authUsers[0];
            await base44.asServiceRole.entities.AuthUser.update(user.id, {
                password_hash: newPassword
            });
            return Response.json({ success: true });
        }

        return Response.json({ success: false, error: 'Invalid action' });
    } catch (error) {
        console.error('❌ Auth error:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        return Response.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
    }
});