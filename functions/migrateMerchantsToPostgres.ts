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

            // Fetch merchants from Base44 entities
            const merchants = await base44.asServiceRole.entities.Merchant.filter({ psp_code });

            let migratedCount = 0;

            // Migrate each merchant to PostgreSQL
            for (const merchant of merchants) {
                // First set schema
                await client.query(`SET search_path TO "${schemaName}"`);

                const insertQuery = `
                    INSERT INTO merchants (
                        merchant_code, merchant_id, business_name, 
                        trading_name, status, category, mcc_code, country, 
                        currency, timezone, contact_name, contact_email, 
                        contact_phone, address, website, processing_volume, 
                        fee_rate, settlement_period, risk_level, created_by
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 
                             $13, $14, $15, $16, $17, $18, $19, $20, $21)
                    ON CONFLICT (merchant_code) DO NOTHING
                `;

                await client.query(insertQuery, [
                    merchant.data?.merchant_code || merchant.id,
                    merchant.data?.merchant_id || null,
                    merchant.data?.business_name,
                    merchant.data?.trading_name,
                    merchant.data?.status || 'pending',
                    merchant.data?.category,
                    merchant.data?.mcc_code,
                    merchant.data?.country,
                    merchant.data?.currency || 'USD',
                    merchant.data?.timezone || 'UTC',
                    merchant.data?.contact_name,
                    merchant.data?.contact_email,
                    merchant.data?.contact_phone,
                    merchant.data?.address,
                    merchant.data?.website,
                    merchant.data?.processing_volume || null,
                    merchant.data?.fee_rate || null,
                    merchant.data?.settlement_period || 'T+1',
                    merchant.data?.risk_level || 'medium',
                    merchant.created_by
                ]);

                migratedCount++;
            }

            return Response.json({
                success: true,
                message: `Migrated ${migratedCount} merchants to PostgreSQL`,
                migratedCount
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Migration error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});