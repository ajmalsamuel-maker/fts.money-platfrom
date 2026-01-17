import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { psp_code } = await req.json();

        if (!psp_code) {
            return Response.json({ error: 'PSP code required' }, { status: 400 });
        }

        const client = await pool.connect();

        try {
            const schemaName = `psp_${psp_code.toLowerCase().replace(/-/g, '_')}`;
            await client.query(`SET search_path TO "${schemaName}"`);

            // Drop merchants table
            await client.query(`DROP TABLE IF EXISTS merchants CASCADE`);

            return Response.json({
                success: true,
                message: `Dropped merchants table from ${schemaName}`
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Drop table error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});