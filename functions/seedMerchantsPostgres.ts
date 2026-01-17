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

            console.log(`Found ${merchants.length} merchants in Base44 for ${psp_code}`);

            let migratedCount = 0;

            for (const merchant of merchants) {
                try {
                    const result = await client.query(`
                        INSERT INTO merchants (
                            psp_code, merchant_code, business_name, status, 
                            trading_name, category, mcc_code, country, currency, timezone, 
                            contact_name, contact_email, contact_phone, address, website, 
                            fee_rate, settlement_period, risk_level, created_by
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                        ON CONFLICT (merchant_code) DO UPDATE SET
                            business_name = EXCLUDED.business_name,
                            status = EXCLUDED.status,
                            trading_name = EXCLUDED.trading_name,
                            category = EXCLUDED.category,
                            mcc_code = EXCLUDED.mcc_code,
                            country = EXCLUDED.country,
                            currency = EXCLUDED.currency,
                            timezone = EXCLUDED.timezone,
                            contact_name = EXCLUDED.contact_name,
                            contact_email = EXCLUDED.contact_email,
                            contact_phone = EXCLUDED.contact_phone,
                            address = EXCLUDED.address,
                            website = EXCLUDED.website,
                            fee_rate = EXCLUDED.fee_rate,
                            settlement_period = EXCLUDED.settlement_period,
                            risk_level = EXCLUDED.risk_level
                    `, [
                        psp_code,
                        merchant.merchant_code || merchant.id,
                        merchant.business_name || merchant.trading_name || `Merchant ${merchant.merchant_code || merchant.id}`,
                        merchant.status || 'pending',
                        merchant.trading_name || null,
                        merchant.category || null,
                        merchant.mcc_code || null,
                        merchant.country || null,
                        merchant.currency || 'USD',
                        merchant.timezone || 'UTC',
                        merchant.contact_name || null,
                        merchant.contact_email || null,
                        merchant.contact_phone || null,
                        merchant.address || null,
                        merchant.website || null,
                        merchant.fee_rate || null,
                        merchant.settlement_period || 'T+1',
                        merchant.risk_level || 'medium',
                        merchant.created_by
                    ]);

                    if (result.rowCount > 0) {
                        migratedCount++;
                    }
                    console.log(`Inserted/Updated merchant: ${merchant.merchant_code || merchant.id}`);
                } catch (insertError) {
                    console.error(`Failed to insert merchant ${merchant.merchant_code}:`, insertError.message);
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