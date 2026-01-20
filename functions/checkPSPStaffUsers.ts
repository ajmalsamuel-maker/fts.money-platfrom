import { Client } from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

Deno.serve(async (req) => {
    let client = null;
    try {
        const { email } = await req.json();

        client = new Client(Deno.env.get('DATABASE_URL'));
        await client.connect();

        const result = await client.queryObject(
            'SELECT id, email, full_name, role, status, psp_code, created_date, password_hash FROM psp_staff_users WHERE email = $1',
            [email || 'admin@gppay.com']
        );

        return Response.json({
            success: true,
            users: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Check users error:', error);
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