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

            // Set schema
            await client.query(`SET search_path TO "${schemaName}"`);

            // Fetch merchants from Base44
            const merchants = await base44.asServiceRole.entities.Merchant.filter({ psp_code });

            let migratedCount = 0;

            for (const merchant of merchants) {
                const m = merchant.data;
                
                const result = await client.query(`
                    INSERT INTO merchants (
                        psp_code, merchant_code, business_name, status, 
                        country, currency, timezone, contact_name, contact_email, 
                        contact_phone, address, website, fee_rate, 
                        settlement_period, risk_level, created_by
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                    ON CONFLICT (merchant_code) DO NOTHING
                `, [
                    psp_code,
                    m?.merchant_code || merchant.id,
                    m?.business_name,
                    m?.status || 'pending',
                    m?.country,
                    m?.currency || 'USD',
                    m?.timezone || 'UTC',
                    m?.contact_name,
                    m?.contact_email,
                    m?.contact_phone,
                    m?.address,
                    m?.website,
                    m?.fee_rate,
                    m?.settlement_period || 'T+1',
                    m?.risk_level || 'medium',
                    merchant.created_by
                ]);

                if (result.rowCount > 0) {
                    migratedCount++;
                }
            }

            return Response.json({
                success: true,
                message: `Seeded ${migratedCount} merchants to PostgreSQL`,
                total: merchants.length,
                migratedCount
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Seed error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});