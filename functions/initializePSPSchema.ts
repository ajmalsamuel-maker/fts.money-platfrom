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

        // Admin-only operation
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

            // Create schema
            await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
            await client.query(`SET search_path TO "${schemaName}"`);

            // Merchants table
            await client.query(`
                CREATE TABLE IF NOT EXISTS merchants (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    psp_code VARCHAR(20) NOT NULL,
                    merchant_code VARCHAR(50) NOT NULL UNIQUE,
                    merchant_id VARCHAR(100),
                    business_name VARCHAR(255) NOT NULL,
                    trading_name VARCHAR(255),
                    status VARCHAR(20) DEFAULT 'pending',
                    category VARCHAR(50),
                    mcc_code VARCHAR(10),
                    country VARCHAR(2),
                    currency VARCHAR(3) DEFAULT 'USD',
                    timezone VARCHAR(50) DEFAULT 'UTC',
                    contact_name VARCHAR(255),
                    contact_email VARCHAR(255),
                    contact_phone VARCHAR(20),
                    address TEXT,
                    website VARCHAR(500),
                    processing_volume DECIMAL(15,2),
                    fee_rate DECIMAL(5,3),
                    settlement_period VARCHAR(10) DEFAULT 'T+1',
                    risk_level VARCHAR(20) DEFAULT 'medium',
                    total_transactions INTEGER DEFAULT 0,
                    total_volume DECIMAL(15,2) DEFAULT 0,
                    kyb_status VARCHAR(50) DEFAULT 'not_started',
                    aml_status VARCHAR(50) DEFAULT 'clear',
                    created_date TIMESTAMP DEFAULT NOW(),
                    updated_date TIMESTAMP DEFAULT NOW(),
                    created_by VARCHAR(255),
                    CONSTRAINT psp_code_check CHECK (psp_code = $1)
                )
            `, [psp_code]);

            // Transactions table
            await client.query(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    psp_code VARCHAR(20) NOT NULL,
                    transaction_id VARCHAR(100) UNIQUE NOT NULL,
                    merchant_id UUID REFERENCES merchants(id),
                    merchant_name VARCHAR(255),
                    type VARCHAR(50),
                    action VARCHAR(50),
                    status VARCHAR(50) DEFAULT 'pending',
                    amount DECIMAL(15,2) NOT NULL,
                    currency VARCHAR(3) DEFAULT 'USD',
                    fee DECIMAL(15,2),
                    net_amount DECIMAL(15,2),
                    payment_method VARCHAR(50),
                    card_last_four VARCHAR(4),
                    customer_email VARCHAR(255),
                    customer_name VARCHAR(255),
                    auth_code VARCHAR(100),
                    response_code VARCHAR(50),
                    response_message TEXT,
                    complete_time TIMESTAMP,
                    created_date TIMESTAMP DEFAULT NOW(),
                    CONSTRAINT psp_code_check CHECK (psp_code = $1)
                )
            `, [psp_code]);

            // Settlements table
            await client.query(`
                CREATE TABLE IF NOT EXISTS settlements (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    psp_code VARCHAR(20) NOT NULL,
                    settlement_id VARCHAR(100) UNIQUE NOT NULL,
                    merchant_id UUID REFERENCES merchants(id),
                    merchant_name VARCHAR(255),
                    period_start DATE,
                    period_end DATE,
                    status VARCHAR(50) DEFAULT 'pending',
                    gross_amount DECIMAL(15,2),
                    fees DECIMAL(15,2),
                    refunds DECIMAL(15,2),
                    chargebacks DECIMAL(15,2),
                    net_amount DECIMAL(15,2),
                    currency VARCHAR(3) DEFAULT 'USD',
                    transaction_count INTEGER,
                    payout_date DATE,
                    created_date TIMESTAMP DEFAULT NOW(),
                    CONSTRAINT psp_code_check CHECK (psp_code = $1)
                )
            `, [psp_code]);

            // Chargebacks table
            await client.query(`
                CREATE TABLE IF NOT EXISTS chargebacks (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    psp_code VARCHAR(20) NOT NULL,
                    chargeback_id VARCHAR(100) UNIQUE NOT NULL,
                    transaction_id UUID REFERENCES transactions(id),
                    merchant_id UUID REFERENCES merchants(id),
                    merchant_name VARCHAR(255),
                    reason_code VARCHAR(10),
                    reason_category VARCHAR(50),
                    status VARCHAR(50) DEFAULT 'received',
                    amount DECIMAL(15,2),
                    currency VARCHAR(3) DEFAULT 'USD',
                    chargeback_date DATE,
                    response_due_date DATE,
                    created_date TIMESTAMP DEFAULT NOW(),
                    CONSTRAINT psp_code_check CHECK (psp_code = $1)
                )
            `, [psp_code]);

            // Audit logs table
            await client.query(`
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    psp_code VARCHAR(20) NOT NULL,
                    event_type VARCHAR(100),
                    category VARCHAR(50),
                    severity VARCHAR(20) DEFAULT 'info',
                    user_id VARCHAR(255),
                    user_email VARCHAR(255),
                    target_entity VARCHAR(50),
                    target_id VARCHAR(255),
                    action VARCHAR(100),
                    description TEXT,
                    old_value JSONB,
                    new_value JSONB,
                    ip_address VARCHAR(50),
                    status VARCHAR(20) DEFAULT 'success',
                    created_date TIMESTAMP DEFAULT NOW(),
                    CONSTRAINT psp_code_check CHECK (psp_code = $1)
                )
            `, [psp_code]);

            // Create indexes for performance
            await client.query(`CREATE INDEX IF NOT EXISTS idx_merchants_code ON merchants(merchant_code)`);
            await client.query(`CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status)`);
            await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_id)`);
            await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`);
            await client.query(`CREATE INDEX IF NOT EXISTS idx_settlements_merchant ON settlements(merchant_id)`);
            await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_email)`);

            return Response.json({
                success: true,
                message: `Schema ${schemaName} initialized successfully`,
                schema: schemaName
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Schema initialization error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});