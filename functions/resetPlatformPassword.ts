import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { email, new_password } = await req.json();

        if (!email || !new_password) {
            return Response.json({ success: false, error: 'Email and new_password required' }, { status: 400 });
        }

        // Hash password
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
        const platformUsers = allUsers.filter(u => u.email === email && u.account_type === 'platform_admin');

        console.log(`Found ${platformUsers.length} platform admin users with email ${email}`);

        if (platformUsers.length === 0) {
            return Response.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Update all matching users
        const updates = [];
        for (const user of platformUsers) {
            const updated = await base44.asServiceRole.entities.AuthUser.update(user.id, {
                password_hash: hashedPassword
            });
            updates.push(updated);
        }

        return Response.json({
            success: true,
            message: `Updated ${updates.length} user(s)`,
            new_hash: hashedPassword
        });

    } catch (error) {
        console.error('Password reset error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});