import { Client } from 'https://deno.land/x/postgres@v0.17.0/mod.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    let client = null;
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { psp_code } = await req.json();
        
        if (!psp_code) {
            return Response.json({ error: 'PSP code required' }, { status: 400 });
        }

        const dbUrl = Deno.env.get('DATABASE_URL');
        if (!dbUrl) {
            return Response.json({ error: 'DATABASE_URL not set' }, { status: 500 });
        }

        client = new Client(dbUrl);
        await client.connect();

        const schemaName = `psp_${psp_code.toLowerCase().replace(/-/g, '_')}`;
        
        console.log(`Recreating merchant_mids table in schema: ${schemaName}`);

        // Drop existing table
        await client.queryObject(`DROP TABLE IF EXISTS "${schemaName}".merchant_mids CASCADE`);
        console.log('✅ Dropped old merchant_mids table');

        // Create merchant_mids table with all required columns
        await client.queryObject(
            `CREATE TABLE "${schemaName}".merchant_mids (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                mid VARCHAR(100) UNIQUE NOT NULL,
                psp_code VARCHAR(50) NOT NULL,
                merchant_id VARCHAR(100),
                merchant_code VARCHAR(100),
                merchant_name VARCHAR(255),
                mid_type VARCHAR(50),
                processor VARCHAR(100),
                status VARCHAR(50) DEFAULT 'active',
                currency VARCHAR(10) DEFAULT 'USD',
                country VARCHAR(10),
                card_networks TEXT[],
                daily_limit DECIMAL(20, 2),
                monthly_limit DECIMAL(20, 2),
                transaction_limit DECIMAL(20, 2),
                current_daily_volume DECIMAL(20, 2) DEFAULT 0,
                current_monthly_volume DECIMAL(20, 2) DEFAULT 0,
                priority INTEGER DEFAULT 100,
                success_rate DECIMAL(5, 2),
                avg_response_time INTEGER,
                notes TEXT,
                metadata JSONB,
                created_by VARCHAR(255),
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        );

        // Create indexes
        await client.queryObject(`CREATE INDEX idx_merchant_mids_psp_code ON "${schemaName}".merchant_mids(psp_code)`);
        await client.queryObject(`CREATE INDEX idx_merchant_mids_merchant_id ON "${schemaName}".merchant_mids(merchant_id)`);
        await client.queryObject(`CREATE INDEX idx_merchant_mids_status ON "${schemaName}".merchant_mids(status)`);

        console.log('✅ Merchant MIDs table recreated successfully');

        return Response.json({
            success: true,
            message: `Merchant MIDs table recreated in ${schemaName}`
        });

    } catch (error) {
        console.error('Error recreating merchant_mids table:', error);
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