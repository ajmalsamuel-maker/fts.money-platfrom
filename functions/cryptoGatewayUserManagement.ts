import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'fts_crypto_salt_2025');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, customer_id, email, full_name, role, password } = await req.json();

        if (action === 'invite') {
            const existing = await base44.asServiceRole.entities.CryptoGatewayUser.filter({ customer_id, email });
            if (existing.length > 0) return Response.json({ success: false, error: 'User already exists' });

            const password_hash = await hashPassword(password);
            await base44.asServiceRole.entities.CryptoGatewayUser.create({ customer_id, email, full_name, role, password_hash, status: 'active' });
            return Response.json({ success: true });
        }

        return Response.json({ success: false, error: 'Invalid action' });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});