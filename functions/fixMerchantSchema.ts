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
        const body = await req.json();
        const { psp_code } = body;

        if (!psp_code) {
            return Response.json({ error: 'PSP code required' }, { status: 400 });
        }

        const client = await pool.connect();

        try {
            const schemaName = `psp_${psp_code.toLowerCase().replace(/-/g, '_')}`;
            
            // Verify schema exists
            const schemaCheck = await client.query(`
                SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1
            `, [schemaName]);
            
            if (schemaCheck.rows.length === 0) {
                throw new Error(`Schema ${schemaName} does not exist`);
            }
            
            await client.query(`SET search_path TO "${schemaName}"`);

            // Get current columns in merchants table
            const columnsResult = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = $1 AND table_name = 'merchants'
            `, [schemaName]);

            const existingColumns = new Set(columnsResult.rows.map(r => r.column_name));
            const columnsAdded = [];
            const columnsSkipped = [];

            // Define all columns that should exist based on Merchant entity
            const requiredColumns = [
                { name: 'merchant_id', type: 'TEXT' },
                { name: 'psp_code', type: 'TEXT NOT NULL' },
                { name: 'merchant_code', type: 'TEXT UNIQUE NOT NULL' },
                { name: 'business_name', type: 'TEXT NOT NULL' },
                { name: 'trading_name', type: 'TEXT' },
                { name: 'status', type: "TEXT DEFAULT 'pending'" },
                { name: 'category', type: 'TEXT' },
                { name: 'mcc_code', type: 'TEXT' },
                { name: 'country', type: 'TEXT' },
                { name: 'currency', type: "TEXT DEFAULT 'USD'" },
                { name: 'timezone', type: "TEXT DEFAULT 'UTC'" },
                { name: 'contact_name', type: 'TEXT' },
                { name: 'contact_email', type: 'TEXT NOT NULL' },
                { name: 'contact_phone', type: 'TEXT' },
                { name: 'address', type: 'TEXT' },
                { name: 'website', type: 'TEXT' },
                { name: 'processing_volume', type: 'NUMERIC' },
                { name: 'fee_rate', type: 'NUMERIC' },
                { name: 'settlement_period', type: "TEXT DEFAULT 'T+1'" },
                { name: 'risk_level', type: "TEXT DEFAULT 'medium'" },
                { name: 'total_transactions', type: 'INTEGER DEFAULT 0' },
                { name: 'total_volume', type: 'NUMERIC DEFAULT 0' },
                { name: 'logo_url', type: 'TEXT' },
                { name: 'lei', type: 'TEXT' },
                { name: 'vlei', type: 'TEXT' },
                { name: 'lei_status', type: "TEXT DEFAULT 'pending'" },
                { name: 'lei_verified_date', type: 'DATE' },
                { name: 'onboarding_token', type: 'TEXT' },
                { name: 'onboarding_url_expires', type: 'TIMESTAMP' },
                { name: 'kyb_status', type: "TEXT DEFAULT 'not_started'" },
                { name: 'kyb_provider', type: "TEXT DEFAULT 'thekyb'" },
                { name: 'kyb_reference_id', type: 'TEXT' },
                { name: 'aml_status', type: "TEXT DEFAULT 'clear'" },
                { name: 'aml_provider', type: "TEXT DEFAULT 'amlwatcher'" },
                { name: 'aml_last_check', type: 'TIMESTAMP' },
                { name: 'aml_risk_score', type: 'NUMERIC' },
                { name: 'documents', type: 'JSONB DEFAULT \'[]\'::jsonb' }
            ];

            // Add missing columns
            for (const column of requiredColumns) {
                if (!existingColumns.has(column.name)) {
                    try {
                        await client.query(`
                            ALTER TABLE merchants 
                            ADD COLUMN ${column.name} ${column.type}
                        `);
                        columnsAdded.push(column.name);
                    } catch (err) {
                        console.error(`Failed to add column ${column.name}:`, err.message);
                    }
                } else {
                    columnsSkipped.push(column.name);
                }
            }

            // Create indexes for better performance
            const indexes = [
                { name: 'idx_merchants_psp_code', column: 'psp_code' },
                { name: 'idx_merchants_merchant_code', column: 'merchant_code' },
                { name: 'idx_merchants_status', column: 'status' },
                { name: 'idx_merchants_contact_email', column: 'contact_email' }
            ];

            const indexesCreated = [];
            for (const index of indexes) {
                try {
                    await client.query(`
                        CREATE INDEX IF NOT EXISTS ${index.name} 
                        ON merchants(${index.column})
                    `);
                    indexesCreated.push(index.name);
                } catch (err) {
                    console.log(`Index ${index.name} already exists or failed:`, err.message);
                }
            }

            return Response.json({
                success: true,
                schema: schemaName,
                columnsAdded,
                columnsSkipped,
                indexesCreated,
                summary: {
                    totalColumnsAdded: columnsAdded.length,
                    totalColumnsSkipped: columnsSkipped.length,
                    totalIndexesCreated: indexesCreated.length
                }
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Schema fix error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});