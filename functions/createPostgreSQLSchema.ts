import { Client } from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

Deno.serve(async (req) => {
    let client;
    try {
        const databaseUrl = Deno.env.get('DATABASE_URL');
        if (!databaseUrl) {
            return Response.json({ success: false, error: 'DATABASE_URL not set' });
        }

        client = new Client(databaseUrl);
        await client.connect();

        // Drop old PascalCase tables if they exist (to avoid conflicts)
        await client.queryObject(`DROP TABLE IF EXISTS "Merchant" CASCADE`);
        await client.queryObject(`DROP TABLE IF EXISTS "Transaction" CASCADE`);
        await client.queryObject(`DROP TABLE IF EXISTS "ProvisionedPSP" CASCADE`);
        await client.queryObject(`DROP TABLE IF EXISTS "ProcessorConnectorConfig" CASCADE`);
        await client.queryObject(`DROP TABLE IF EXISTS "MerchantMID" CASCADE`);

        // Create provisioned_psp table
        await client.queryObject(`
            CREATE TABLE IF NOT EXISTS provisioned_psp (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                created_date TIMESTAMP DEFAULT NOW(),
                updated_date TIMESTAMP DEFAULT NOW(),
                created_by TEXT,
                psp_code TEXT UNIQUE NOT NULL,
                psp_name TEXT NOT NULL,
                status TEXT DEFAULT 'provisioning',
                owner_email TEXT NOT NULL,
                database_status TEXT DEFAULT 'pending',
                domain TEXT,
                deployment_mode TEXT DEFAULT 'shared'
            )
        `);

        // Create merchants table
        await client.queryObject(`
            CREATE TABLE IF NOT EXISTS merchants (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                created_date TIMESTAMP DEFAULT NOW(),
                updated_date TIMESTAMP DEFAULT NOW(),
                created_by TEXT,
                merchant_id TEXT UNIQUE NOT NULL,
                psp_code TEXT NOT NULL,
                merchant_code TEXT NOT NULL,
                business_name TEXT NOT NULL,
                trading_name TEXT,
                status TEXT DEFAULT 'pending',
                contact_email TEXT NOT NULL,
                country TEXT,
                currency TEXT DEFAULT 'USD'
            )
        `);

        // Create transactions table
        await client.queryObject(`
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                created_date TIMESTAMP DEFAULT NOW(),
                updated_date TIMESTAMP DEFAULT NOW(),
                created_by TEXT,
                transaction_id TEXT UNIQUE NOT NULL,
                psp_code TEXT NOT NULL,
                merchant_id TEXT NOT NULL,
                type TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                amount DECIMAL(19,4) NOT NULL,
                currency TEXT DEFAULT 'USD',
                payment_method TEXT,
                customer_email TEXT
            )
        `);

        // Create processor_connector_config table
        await client.queryObject(`
            CREATE TABLE IF NOT EXISTS processor_connector_config (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                created_date TIMESTAMP DEFAULT NOW(),
                updated_date TIMESTAMP DEFAULT NOW(),
                created_by TEXT,
                psp_code TEXT NOT NULL,
                connector_name TEXT NOT NULL,
                api_endpoint TEXT,
                api_key TEXT,
                mode TEXT DEFAULT 'sandbox',
                status TEXT DEFAULT 'active'
            )
        `);

        // Create merchant_mids table
        await client.queryObject(`
            CREATE TABLE IF NOT EXISTS merchant_mids (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                created_date TIMESTAMP DEFAULT NOW(),
                updated_date TIMESTAMP DEFAULT NOW(),
                created_by TEXT,
                psp_code TEXT NOT NULL,
                merchant_id TEXT NOT NULL,
                mid TEXT NOT NULL,
                provider_name TEXT,
                status TEXT DEFAULT 'active',
                is_primary BOOLEAN DEFAULT false
            )
        `);

        // Create indexes for performance
        await client.queryObject(`CREATE INDEX IF NOT EXISTS idx_merchant_psp_code ON merchants(psp_code)`);
        await client.queryObject(`CREATE INDEX IF NOT EXISTS idx_transaction_psp_code ON transactions(psp_code)`);
        await client.queryObject(`CREATE INDEX IF NOT EXISTS idx_transaction_merchant ON transactions(merchant_id)`);

        // Verify tables were created
        const verifyResult = await client.queryObject(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('provisioned_psp', 'merchants', 'transactions', 'processor_connector_config', 'merchant_mids')
        `);

        await client.end();

        return Response.json({ 
            success: true, 
            message: 'PostgreSQL schema created successfully',
            tables: ['provisioned_psp', 'merchants', 'transactions', 'processor_connector_config', 'merchant_mids'],
            verified: verifyResult.rows.map(r => r.table_name),
            database_url: databaseUrl.split('@')[1] // show host only for debugging
        });

    } catch (error) {
        if (client) {
            try { await client.end(); } catch {}
        }
        return Response.json({ 
            success: false, 
            error: error.message 
        });
    }
});