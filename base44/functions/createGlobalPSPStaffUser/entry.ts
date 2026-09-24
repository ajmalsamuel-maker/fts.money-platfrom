import { Client } from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

async function hashPassword(password, salt = 'fts_salt_2025') {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

Deno.serve(async (req) => {
    let client = null;
    try {
        const { email, full_name, role, password, psp_code } = await req.json();

        if (!email || !password || !psp_code) {
            return Response.json({
                success: false,
                error: 'Email, password, and PSP code are required'
            }, { status: 400 });
        }

        client = new Client(Deno.env.get('DATABASE_URL'));
        await client.connect();

        const password_hash = await hashPassword(password);

        const result = await client.queryObject(`
            INSERT INTO psp_staff_users (psp_code, email, full_name, role, password_hash, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, psp_code, email, full_name, role, status, created_date
        `, [psp_code.toUpperCase(), email, full_name || 'Admin User', role || 'admin', password_hash, 'active']);

        return Response.json({
            success: true,
            message: 'PSP staff user created successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Create user error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    } finally {
        if (client) {
            await client.end();
        }
    }
});