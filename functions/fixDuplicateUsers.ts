import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { email } = await req.json();
        
        if (!email) {
            return Response.json({ success: false, error: 'Email required' }, { status: 400 });
        }
        
        // Find all users with this email
        const allUsers = await base44.asServiceRole.entities.AuthUser.list();
        const duplicates = allUsers.filter(u => u.email === email);
        
        if (duplicates.length <= 1) {
            return Response.json({ 
                success: true, 
                message: 'No duplicates found',
                user_count: duplicates.length 
            });
        }
        
        // Sort by created_date descending (keep newest)
        duplicates.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        const keepUser = duplicates[0];
        const deleteUsers = duplicates.slice(1);
        
        // Delete older duplicates
        for (const user of deleteUsers) {
            await base44.asServiceRole.entities.AuthUser.delete(user.id);
        }
        
        return Response.json({
            success: true,
            message: `Cleaned up ${deleteUsers.length} duplicate(s)`,
            kept_user: {
                email: keepUser.email,
                created_date: keepUser.created_date,
                platform_role: keepUser.platform_role
            },
            deleted_count: deleteUsers.length
        });
        
    } catch (error) {
        console.error('Fix duplicates error:', error);
        return Response.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});