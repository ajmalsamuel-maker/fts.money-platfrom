import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { email, new_password } = await req.json();
        
        if (!email || !new_password) {
            return Response.json({ 
                success: false, 
                error: 'Email and new_password required' 
            }, { status: 400 });
        }
        
        // Hash password with same algorithm as platformAuth
        const hashPassword = async (password) => {
            const encoder = new TextEncoder();
            const data = encoder.encode(password + 'fts_salt_2025');
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        };
        
        const hashedPassword = await hashPassword(new_password);
        
        // Find all users with this email
        const allUsers = await base44.asServiceRole.entities.AuthUser.list();
        const users = allUsers.filter(u => u.email === email);
        
        if (users.length === 0) {
            return Response.json({ 
                success: false, 
                error: 'User not found' 
            }, { status: 404 });
        }
        
        // Update all matching users (in case of duplicates)
        let updated = 0;
        for (const user of users) {
            await base44.asServiceRole.entities.AuthUser.update(user.id, {
                password_hash: hashedPassword
            });
            updated++;
        }
        
        return Response.json({
            success: true,
            message: `Password updated for ${updated} user record(s)`,
            email: email,
            users_updated: updated
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        return Response.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});