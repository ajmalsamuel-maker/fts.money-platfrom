import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify platform admin authentication
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all community users
        const communityUsers = await base44.asServiceRole.entities.AuthUser.filter({ 
            account_type: 'community' 
        }, '-created_date');

        return Response.json({ 
            success: true, 
            users: communityUsers 
        });
    } catch (error) {
        console.error('Get community users error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});