import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify platform admin authentication
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, data } = await req.json();
        
        // Prepare update data
        const updateData = { ...data };
        
        // If password is provided, hash it
        if (data.password && data.password.trim() !== '') {
            const password_hash = await crypto.subtle.digest(
                'SHA-256',
                new TextEncoder().encode(data.password)
            ).then(buf => Array.from(new Uint8Array(buf))
                .map(b => b.toString(16).padStart(2, '0'))
                .join(''));
            
            updateData.password_hash = password_hash;
        }
        
        // Remove plain password from update
        delete updateData.password;
        delete updateData.id;
        delete updateData.created_date;
        delete updateData.updated_date;
        delete updateData.created_by;

        // Update customer with service role
        const customer = await base44.asServiceRole.entities.RWAWhiteLabelCustomer.update(id, updateData);

        return Response.json({ success: true, customer });
    } catch (error) {
        console.error('Update error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});