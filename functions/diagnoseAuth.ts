import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // List all AuthUser records
        const allUsers = await base44.asServiceRole.entities.AuthUser.list();
        console.log('Total AuthUser records:', allUsers.length);
        
        // Group by account_type
        const byType = {};
        allUsers.forEach(u => {
            const type = u.account_type || 'undefined';
            byType[type] = (byType[type] || 0) + 1;
        });
        
        // Find platform admins
        const platformAdmins = allUsers.filter(u => u.account_type === 'platform_admin');
        
        // Check for the specific user
        const ajmalUser = allUsers.filter(u => u.email === 'ajmal.samuel@fts.money');
        
        return Response.json({
            success: true,
            total_users: allUsers.length,
            by_account_type: byType,
            platform_admins_count: platformAdmins.length,
            platform_admins: platformAdmins.map(u => ({
                email: u.email,
                full_name: u.full_name,
                platform_role: u.platform_role,
                has_password: !!u.password_hash,
                created_date: u.created_date
            })),
            ajmal_user_count: ajmalUser.length,
            ajmal_user: ajmalUser.map(u => ({
                email: u.email,
                account_type: u.account_type,
                platform_role: u.platform_role,
                has_password: !!u.password_hash,
                created_date: u.created_date
            }))
        });
        
    } catch (error) {
        console.error('Diagnosis error:', error);
        return Response.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});