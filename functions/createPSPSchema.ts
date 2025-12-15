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

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { psp_code, template_psp_code } = await req.json();

        if (!psp_code) {
            return Response.json({ error: 'PSP code required' }, { status: 400 });
        }

        const schemaName = `psp_${psp_code.toLowerCase()}`;

        // Create isolated schema for PSP
        await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);

        // Create all necessary tables in the PSP schema
        await pool.query(`
            -- Merchants Table
            CREATE TABLE IF NOT EXISTS ${schemaName}.merchants (
                id SERIAL PRIMARY KEY,
                merchant_code VARCHAR(50) UNIQUE NOT NULL,
                business_name VARCHAR(255) NOT NULL,
                legal_name VARCHAR(255),
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                status VARCHAR(50) DEFAULT 'pending',
                onboarding_status VARCHAR(50) DEFAULT 'pending',
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(255)
            );

            -- Transactions Table
            CREATE TABLE IF NOT EXISTS ${schemaName}.transactions (
                id SERIAL PRIMARY KEY,
                transaction_id VARCHAR(100) UNIQUE NOT NULL,
                merchant_id INTEGER REFERENCES ${schemaName}.merchants(id),
                amount DECIMAL(15, 2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'USD',
                status VARCHAR(50) DEFAULT 'pending',
                payment_method VARCHAR(100),
                crypto_asset VARCHAR(50),
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(255)
            );

            -- App Users Table (PSP staff)
            CREATE TABLE IF NOT EXISTS ${schemaName}.app_users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                full_name VARCHAR(255),
                role VARCHAR(50) DEFAULT 'user',
                status VARCHAR(50) DEFAULT 'active',
                password_hash TEXT,
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(255)
            );

            -- Payment Providers Table
            CREATE TABLE IF NOT EXISTS ${schemaName}.payment_providers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(50),
                status VARCHAR(50) DEFAULT 'active',
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(255)
            );

            -- Audit Logs Table (PCI Requirement)
            CREATE TABLE IF NOT EXISTS ${schemaName}.audit_logs (
                id SERIAL PRIMARY KEY,
                action VARCHAR(255) NOT NULL,
                user_email VARCHAR(255),
                ip_address VARCHAR(50),
                details JSONB,
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // If template_psp_code provided, copy configuration data (not customer data)
        if (template_psp_code) {
            const templateSchema = `psp_${template_psp_code.toLowerCase()}`;
            
            // Copy payment providers configuration only
            await pool.query(`
                INSERT INTO ${schemaName}.payment_providers (name, type, status, created_by)
                SELECT name, type, status, 'system_template'
                FROM ${templateSchema}.payment_providers
                WHERE status = 'active'
                ON CONFLICT DO NOTHING
            `);
        }

        // Create indexes for performance
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_${schemaName}_merchants_email ON ${schemaName}.merchants(email);
            CREATE INDEX IF NOT EXISTS idx_${schemaName}_merchants_status ON ${schemaName}.merchants(status);
            CREATE INDEX IF NOT EXISTS idx_${schemaName}_transactions_merchant ON ${schemaName}.transactions(merchant_id);
            CREATE INDEX IF NOT EXISTS idx_${schemaName}_transactions_status ON ${schemaName}.transactions(status);
            CREATE INDEX IF NOT EXISTS idx_${schemaName}_transactions_date ON ${schemaName}.transactions(created_date DESC);
            CREATE INDEX IF NOT EXISTS idx_${schemaName}_audit_date ON ${schemaName}.audit_logs(created_date DESC);
        `);

        return Response.json({
            success: true,
            message: `Isolated schema created for PSP: ${psp_code}`,
            schema_name: schemaName
        });

    } catch (error) {
        console.error('Schema creation error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});