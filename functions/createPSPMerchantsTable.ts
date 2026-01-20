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
        
        console.log(`Creating merchants table in schema: ${schemaName}`);

        // Create merchants table
        await client.queryObject`
            CREATE TABLE IF NOT EXISTS "${schemaName}".merchants (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                merchant_id VARCHAR(100) UNIQUE NOT NULL,
                psp_code VARCHAR(50) NOT NULL,
                merchant_code VARCHAR(100) NOT NULL,
                business_name VARCHAR(255) NOT NULL,
                trading_name VARCHAR(255),
                contact_email VARCHAR(255),
                contact_name VARCHAR(255),
                contact_phone VARCHAR(50),
                country VARCHAR(10),
                category VARCHAR(100),
                mcc_code VARCHAR(10),
                address TEXT,
                website VARCHAR(255),
                currency VARCHAR(10) DEFAULT 'USD',
                timezone VARCHAR(100) DEFAULT 'UTC',
                status VARCHAR(50) DEFAULT 'pending',
                risk_level VARCHAR(50) DEFAULT 'medium',
                settlement_period VARCHAR(10) DEFAULT 'T+1',
                processing_volume DECIMAL(20, 2),
                fee_rate DECIMAL(5, 2),
                lei VARCHAR(20),
                vlei VARCHAR(255),
                lei_status VARCHAR(50),
                kyb_status VARCHAR(50),
                kyb_provider VARCHAR(100),
                kyb_reference_id VARCHAR(255),
                aml_status VARCHAR(50),
                aml_provider VARCHAR(100),
                aml_last_check TIMESTAMP,
                aml_risk_score INTEGER,
                total_transactions INTEGER DEFAULT 0,
                total_volume DECIMAL(20, 2) DEFAULT 0,
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Create indexes
        await client.queryObject`CREATE INDEX IF NOT EXISTS idx_merchants_psp_code ON "${schemaName}".merchants(psp_code)`;
        await client.queryObject`CREATE INDEX IF NOT EXISTS idx_merchants_merchant_code ON "${schemaName}".merchants(merchant_code)`;
        await client.queryObject`CREATE INDEX IF NOT EXISTS idx_merchants_status ON "${schemaName}".merchants(status)`;

        console.log('✅ Merchants table created successfully');

        return Response.json({
            success: true,
            message: `Merchants table created in ${schemaName}`
        });

    } catch (error) {
        console.error('Error creating merchants table:', error);
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