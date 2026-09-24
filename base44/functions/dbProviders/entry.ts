import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
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

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, data } = await req.json();

        switch (action) {
            case 'list': {
                const result = await pool.query(
                    'SELECT * FROM payment_providers ORDER BY name ASC'
                );
                return Response.json({ success: true, data: result.rows });
            }

            case 'get': {
                const result = await pool.query(
                    'SELECT * FROM payment_providers WHERE id = $1',
                    [data.id]
                );
                return Response.json({ success: true, data: result.rows[0] });
            }

            case 'create': {
                const result = await pool.query(
                    `INSERT INTO payment_providers 
                     (name, type, supported_currencies, supported_regions, status, logo_url, notes)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING *`,
                    [
                        data.name,
                        data.type,
                        data.supported_currencies || [],
                        data.supported_regions || [],
                        data.status || 'active',
                        data.logo_url,
                        data.notes
                    ]
                );
                return Response.json({ success: true, data: result.rows[0] });
            }

            case 'update': {
                const result = await pool.query(
                    `UPDATE payment_providers SET
                     name = $1,
                     type = $2,
                     supported_currencies = $3,
                     supported_regions = $4,
                     status = $5,
                     logo_url = $6,
                     notes = $7,
                     updated_at = NOW()
                     WHERE id = $8
                     RETURNING *`,
                    [
                        data.name,
                        data.type,
                        data.supported_currencies,
                        data.supported_regions,
                        data.status,
                        data.logo_url,
                        data.notes,
                        data.id
                    ]
                );
                return Response.json({ success: true, data: result.rows[0] });
            }

            case 'delete': {
                await pool.query('DELETE FROM payment_providers WHERE id = $1', [data.id]);
                return Response.json({ success: true });
            }

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});