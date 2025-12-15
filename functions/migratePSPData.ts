import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { psp_code } = await req.json();
        
        if (!psp_code) {
            return Response.json({ error: 'PSP code required' }, { status: 400 });
        }

        const schemaName = `psp_${psp_code.toLowerCase()}`;
        const client = await pool.connect();

        try {
            // Check if schema exists
            const schemaCheck = await client.query(`
                SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1
            `, [schemaName]);

            if (schemaCheck.rows.length === 0) {
                return Response.json({
                    success: false,
                    error: `Schema ${schemaName} does not exist. Run provisionPSPSchema first.`
                }, { status: 400 });
            }

            const results = {
                users_migrated: 0,
                merchants_migrated: 0,
                transactions_migrated: 0
            };

            // Migrate app_users
            const users = await client.query(`
                SELECT * FROM public.app_users 
                WHERE UPPER(COALESCE(psp_code, '')) = UPPER($1)
            `, [psp_code]);

            for (const user of users.rows) {
                await client.query(`
                    INSERT INTO ${schemaName}.app_users 
                    (email, full_name, role, status, password_hash, created_date, updated_date, created_by)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT (email) DO NOTHING
                `, [
                    user.email,
                    user.full_name,
                    user.role,
                    user.status,
                    user.password_hash,
                    user.created_date,
                    user.updated_date,
                    user.created_by
                ]);
                results.users_migrated++;
            }

            // Migrate merchants
            const merchants = await client.query(`
                SELECT * FROM public.merchants 
                WHERE UPPER(COALESCE(psp_code, '')) = UPPER($1)
            `, [psp_code]);

            for (const merchant of merchants.rows) {
                await client.query(`
                    INSERT INTO ${schemaName}.merchants 
                    (merchant_code, business_name, legal_name, email, phone, status, onboarding_status, created_date, updated_date, created_by)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (merchant_code) DO NOTHING
                `, [
                    merchant.merchant_code,
                    merchant.business_name,
                    merchant.legal_name,
                    merchant.email,
                    merchant.phone,
                    merchant.status,
                    merchant.onboarding_status,
                    merchant.created_date,
                    merchant.updated_date,
                    merchant.created_by
                ]);
                results.merchants_migrated++;
            }

            // Migrate transactions
            const transactions = await client.query(`
                SELECT * FROM public.transactions 
                WHERE UPPER(COALESCE(psp_code, '')) = UPPER($1)
                LIMIT 1000
            `, [psp_code]);

            for (const txn of transactions.rows) {
                // Get merchant_id from new schema
                const merchantMap = await client.query(`
                    SELECT id FROM ${schemaName}.merchants WHERE merchant_code = $1
                `, [txn.merchant_code]);

                const newMerchantId = merchantMap.rows[0]?.id;

                await client.query(`
                    INSERT INTO ${schemaName}.transactions 
                    (transaction_id, merchant_id, amount, currency, status, payment_method, created_date, updated_date, created_by)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (transaction_id) DO NOTHING
                `, [
                    txn.transaction_id,
                    newMerchantId,
                    txn.amount,
                    txn.currency,
                    txn.status,
                    txn.payment_method,
                    txn.created_date,
                    txn.updated_date,
                    txn.created_by
                ]);
                results.transactions_migrated++;
            }

            // Log migration in audit log
            await client.query(`
                INSERT INTO ${schemaName}.audit_logs (action, user_email, details)
                VALUES ($1, $2, $3)
            `, ['DATA_MIGRATION', 'system', JSON.stringify({
                psp_code,
                ...results,
                timestamp: new Date().toISOString()
            })]);

            return Response.json({
                success: true,
                message: `Data migrated to ${schemaName}`,
                results
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Migration error:', error);
        return Response.json({ 
            success: false, 
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});