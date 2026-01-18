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

        // Create ProvisionedPSP table
        await client.queryObject(`
            CREATE TABLE IF NOT EXISTS "ProvisionedPSP" (
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

        // Create Merchant table
        await client.queryObject(`
            CREATE TABLE IF NOT EXISTS "Merchant" (
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

        // Create Transaction table
        await client.queryObject(`
            CREATE TABLE IF NOT EXISTS "Transaction" (
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

        // Create ProcessorConnectorConfig table
        await client.queryObject(`
            CREATE TABLE IF NOT EXISTS "ProcessorConnectorConfig" (
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

        // Create MerchantMID table
        await client.queryObject(`
            CREATE TABLE IF NOT EXISTS "MerchantMID" (
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
        await client.queryObject(`CREATE INDEX IF NOT EXISTS idx_merchant_psp_code ON "Merchant"(psp_code)`);
        await client.queryObject(`CREATE INDEX IF NOT EXISTS idx_transaction_psp_code ON "Transaction"(psp_code)`);
        await client.queryObject(`CREATE INDEX IF NOT EXISTS idx_transaction_merchant ON "Transaction"(merchant_id)`);

        await client.end();

        return Response.json({ 
            success: true, 
            message: 'PostgreSQL schema created successfully',
            tables: ['ProvisionedPSP', 'Merchant', 'Transaction', 'ProcessorConnectorConfig', 'MerchantMID']
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