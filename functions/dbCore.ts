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

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { action, sql, params, data } = body;

        switch (action) {
            case 'initAllSchemas': {
                // Initialize all database schemas for production
                await pool.query(`
                    -- Merchants table
                    CREATE TABLE IF NOT EXISTS merchants (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        merchant_id VARCHAR(50) UNIQUE,
                        business_name VARCHAR(255) NOT NULL,
                        trading_name VARCHAR(255),
                        status VARCHAR(50) DEFAULT 'pending',
                        category VARCHAR(100),
                        mcc_code VARCHAR(10),
                        country VARCHAR(100),
                        currency VARCHAR(3) DEFAULT 'USD',
                        contact_name VARCHAR(255),
                        contact_email VARCHAR(255),
                        contact_phone VARCHAR(50),
                        address TEXT,
                        website VARCHAR(255),
                        processing_volume DECIMAL(15,2),
                        fee_rate DECIMAL(5,4),
                        settlement_period VARCHAR(10) DEFAULT 'T+1',
                        risk_level VARCHAR(20) DEFAULT 'medium',
                        total_transactions BIGINT DEFAULT 0,
                        total_volume DECIMAL(15,2) DEFAULT 0,
                        lei VARCHAR(20),
                        vlei VARCHAR(100),
                        lei_status VARCHAR(20) DEFAULT 'pending',
                        lei_verified_date DATE,
                        kyb_status VARCHAR(20) DEFAULT 'not_started',
                        kyb_provider VARCHAR(50),
                        kyb_reference_id VARCHAR(100),
                        aml_status VARCHAR(20) DEFAULT 'clear',
                        aml_provider VARCHAR(50),
                        aml_last_check TIMESTAMPTZ,
                        aml_risk_score INTEGER,
                        onboarding_token VARCHAR(100),
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    -- Payment Providers
                    CREATE TABLE IF NOT EXISTS payment_providers (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        name VARCHAR(255) NOT NULL,
                        type VARCHAR(50),
                        supported_currencies TEXT[],
                        supported_regions TEXT[],
                        status VARCHAR(20) DEFAULT 'active',
                        logo_url TEXT,
                        base_fee_percentage DECIMAL(5,4),
                        fixed_fee DECIMAL(10,2),
                        notes TEXT,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    -- Merchant MIDs
                    CREATE TABLE IF NOT EXISTS merchant_mids (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        merchant_id VARCHAR(255),
                        merchant_name VARCHAR(255),
                        mid VARCHAR(100) NOT NULL,
                        provider_id VARCHAR(255),
                        provider_name VARCHAR(255),
                        terminal_type VARCHAR(50),
                        transaction_types TEXT[],
                        currency VARCHAR(3) DEFAULT 'USD',
                        status VARCHAR(20) DEFAULT 'pending',
                        activation_date DATE,
                        notes TEXT,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    -- Transactions
                    CREATE TABLE IF NOT EXISTS transactions (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        transaction_id VARCHAR(50) UNIQUE,
                        merchant_id VARCHAR(255),
                        merchant_name VARCHAR(255),
                        type VARCHAR(20),
                        status VARCHAR(20) DEFAULT 'pending',
                        amount DECIMAL(15,2),
                        currency VARCHAR(3) DEFAULT 'USD',
                        fee DECIMAL(10,2),
                        net_amount DECIMAL(15,2),
                        payment_method VARCHAR(50),
                        card_last_four VARCHAR(4),
                        card_brand VARCHAR(20),
                        customer_email VARCHAR(255),
                        customer_name VARCHAR(255),
                        customer_country VARCHAR(100),
                        ip_address VARCHAR(45),
                        description TEXT,
                        auth_code VARCHAR(20),
                        response_code VARCHAR(10),
                        response_message VARCHAR(255),
                        risk_score INTEGER,
                        is_3ds BOOLEAN DEFAULT FALSE,
                        terminal_id VARCHAR(50),
                        batch_id VARCHAR(50),
                        settlement_date DATE,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    -- Settlements
                    CREATE TABLE IF NOT EXISTS settlements (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        settlement_id VARCHAR(50) UNIQUE,
                        merchant_id VARCHAR(255),
                        merchant_name VARCHAR(255),
                        period_start DATE,
                        period_end DATE,
                        status VARCHAR(20) DEFAULT 'pending',
                        gross_amount DECIMAL(15,2),
                        fees DECIMAL(10,2),
                        chargebacks DECIMAL(10,2),
                        refunds DECIMAL(10,2),
                        net_amount DECIMAL(15,2),
                        currency VARCHAR(3) DEFAULT 'USD',
                        transaction_count INTEGER,
                        bank_reference VARCHAR(100),
                        payout_date DATE,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    -- Chargebacks
                    CREATE TABLE IF NOT EXISTS chargebacks (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        chargeback_id VARCHAR(50) UNIQUE,
                        transaction_id VARCHAR(255),
                        merchant_id VARCHAR(255),
                        merchant_name VARCHAR(255),
                        card_network VARCHAR(20),
                        reason_code VARCHAR(20),
                        reason_category VARCHAR(50),
                        reason_description TEXT,
                        status VARCHAR(30) DEFAULT 'received',
                        lifecycle_stage VARCHAR(30) DEFAULT 'first_chargeback',
                        amount DECIMAL(15,2),
                        currency VARCHAR(3) DEFAULT 'USD',
                        original_transaction_date DATE,
                        chargeback_date DATE,
                        response_due_date DATE,
                        days_remaining INTEGER,
                        cardholder_name VARCHAR(255),
                        card_last_four VARCHAR(4),
                        evidence_submitted BOOLEAN DEFAULT FALSE,
                        representment_amount DECIMAL(15,2),
                        representment_date DATE,
                        resolution_date DATE,
                        outcome VARCHAR(20),
                        arn VARCHAR(50),
                        case_number VARCHAR(50),
                        is_3ds BOOLEAN DEFAULT FALSE,
                        liability_shift BOOLEAN DEFAULT FALSE,
                        fee_amount DECIMAL(10,2),
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    -- Risk Alerts
                    CREATE TABLE IF NOT EXISTS risk_alerts (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        alert_id VARCHAR(50) UNIQUE,
                        merchant_id VARCHAR(255),
                        merchant_name VARCHAR(255),
                        alert_type VARCHAR(50),
                        severity VARCHAR(20) DEFAULT 'medium',
                        status VARCHAR(20) DEFAULT 'open',
                        description TEXT,
                        details TEXT,
                        affected_transactions INTEGER,
                        affected_amount DECIMAL(15,2),
                        threshold_value DECIMAL(15,2),
                        actual_value DECIMAL(15,2),
                        recommended_action TEXT,
                        assigned_to VARCHAR(255),
                        resolution_notes TEXT,
                        resolved_date TIMESTAMPTZ,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    -- Merchant Users
                    CREATE TABLE IF NOT EXISTS merchant_users (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        merchant_id VARCHAR(255) NOT NULL,
                        merchant_name VARCHAR(255),
                        email VARCHAR(255) UNIQUE NOT NULL,
                        full_name VARCHAR(255) NOT NULL,
                        role VARCHAR(20) DEFAULT 'viewer',
                        status VARCHAR(20) DEFAULT 'pending',
                        permissions TEXT[],
                        allowed_terminals TEXT[],
                        phone VARCHAR(50),
                        temp_password VARCHAR(255),
                        must_change_password BOOLEAN DEFAULT TRUE,
                        two_factor_enabled BOOLEAN DEFAULT FALSE,
                        last_login TIMESTAMPTZ,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    -- Audit Logs
                    CREATE TABLE IF NOT EXISTS audit_logs (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        event_type VARCHAR(50),
                        category VARCHAR(50),
                        severity VARCHAR(20) DEFAULT 'info',
                        user_id VARCHAR(255),
                        user_email VARCHAR(255),
                        user_role VARCHAR(50),
                        target_entity VARCHAR(100),
                        target_id VARCHAR(255),
                        action VARCHAR(100),
                        description TEXT,
                        old_value JSONB,
                        new_value JSONB,
                        ip_address VARCHAR(45),
                        user_agent TEXT,
                        session_id VARCHAR(100),
                        request_id VARCHAR(100),
                        status VARCHAR(20) DEFAULT 'success',
                        error_message TEXT,
                        metadata JSONB,
                        pci_relevant BOOLEAN DEFAULT FALSE,
                        retention_period VARCHAR(20) DEFAULT '1_year',
                        created_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    -- Terminals
                    CREATE TABLE IF NOT EXISTS terminals (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        terminal_id VARCHAR(50) UNIQUE,
                        merchant_id VARCHAR(255),
                        merchant_name VARCHAR(255),
                        type VARCHAR(20),
                        status VARCHAR(20) DEFAULT 'active',
                        model VARCHAR(100),
                        serial_number VARCHAR(100),
                        location VARCHAR(255),
                        last_transaction_date TIMESTAMPTZ,
                        firmware_version VARCHAR(50),
                        ip_address VARCHAR(45),
                        transaction_count BIGINT DEFAULT 0,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    -- Payouts
                    CREATE TABLE IF NOT EXISTS payouts (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        payout_id VARCHAR(50) UNIQUE,
                        merchant_id VARCHAR(255),
                        merchant_name VARCHAR(255),
                        settlement_id VARCHAR(255),
                        amount DECIMAL(15,2),
                        currency VARCHAR(3) DEFAULT 'USD',
                        status VARCHAR(20) DEFAULT 'pending',
                        bank_account_last4 VARCHAR(4),
                        bank_name VARCHAR(255),
                        payment_method VARCHAR(50),
                        reference VARCHAR(100),
                        scheduled_date DATE,
                        executed_date TIMESTAMPTZ,
                        notes TEXT,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    -- Buy Rates
                    CREATE TABLE IF NOT EXISTS buy_rates (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        provider_id VARCHAR(255),
                        provider_name VARCHAR(255),
                        transaction_type VARCHAR(50),
                        card_type VARCHAR(20),
                        card_brand VARCHAR(20),
                        region VARCHAR(30),
                        currency VARCHAR(3) DEFAULT 'USD',
                        percentage_rate DECIMAL(5,4),
                        fixed_fee DECIMAL(10,2),
                        monthly_fee DECIMAL(10,2),
                        minimum_fee DECIMAL(10,2),
                        effective_from DATE,
                        effective_to DATE,
                        status VARCHAR(20) DEFAULT 'active',
                        notes TEXT,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    -- Merchant Pricing
                    CREATE TABLE IF NOT EXISTS merchant_pricing (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        merchant_id VARCHAR(255),
                        merchant_name VARCHAR(255),
                        mid_id VARCHAR(255),
                        mid VARCHAR(100),
                        provider_id VARCHAR(255),
                        provider_name VARCHAR(255),
                        buy_rate_id VARCHAR(255),
                        transaction_type VARCHAR(50),
                        card_type VARCHAR(20),
                        card_brand VARCHAR(20),
                        region VARCHAR(30),
                        currency VARCHAR(3) DEFAULT 'USD',
                        buy_percentage_rate DECIMAL(5,4),
                        buy_fixed_fee DECIMAL(10,2),
                        markup_percentage DECIMAL(5,4),
                        markup_fixed_fee DECIMAL(10,2),
                        sell_percentage_rate DECIMAL(5,4),
                        sell_fixed_fee DECIMAL(10,2),
                        monthly_fee DECIMAL(10,2),
                        minimum_fee DECIMAL(10,2),
                        effective_from DATE,
                        effective_to DATE,
                        status VARCHAR(20) DEFAULT 'active',
                        notes TEXT,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    -- Routing Rules
                    CREATE TABLE IF NOT EXISTS routing_rules (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        rule_id VARCHAR(50) UNIQUE,
                        name VARCHAR(255),
                        description TEXT,
                        priority INTEGER DEFAULT 100,
                        status VARCHAR(20) DEFAULT 'inactive',
                        rule_type VARCHAR(30),
                        conditions JSONB,
                        primary_processor VARCHAR(255),
                        fallback_processors TEXT[],
                        split_config JSONB,
                        merchant_ids TEXT[],
                        apply_to_all_merchants BOOLEAN DEFAULT FALSE,
                        card_networks TEXT[],
                        countries TEXT[],
                        currencies TEXT[],
                        min_amount DECIMAL(15,2),
                        max_amount DECIMAL(15,2),
                        mcc_codes TEXT[],
                        time_based BOOLEAN DEFAULT FALSE,
                        active_hours_start TIME,
                        active_hours_end TIME,
                        retry_attempts INTEGER DEFAULT 3,
                        retry_delay_ms INTEGER DEFAULT 1000,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    -- Create indexes
                    CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);
                    CREATE INDEX IF NOT EXISTS idx_merchants_merchant_id ON merchants(merchant_id);
                    CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_id);
                    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
                    CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
                    CREATE INDEX IF NOT EXISTS idx_chargebacks_merchant ON chargebacks(merchant_id);
                    CREATE INDEX IF NOT EXISTS idx_chargebacks_status ON chargebacks(status);
                    CREATE INDEX IF NOT EXISTS idx_risk_alerts_severity ON risk_alerts(severity);
                    CREATE INDEX IF NOT EXISTS idx_risk_alerts_status ON risk_alerts(status);
                    CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category);
                    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_email);
                    CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
                    CREATE INDEX IF NOT EXISTS idx_audit_pci ON audit_logs(pci_relevant);
                    CREATE INDEX IF NOT EXISTS idx_settlements_merchant ON settlements(merchant_id);
                    CREATE INDEX IF NOT EXISTS idx_payouts_merchant ON payouts(merchant_id);
                    CREATE INDEX IF NOT EXISTS idx_mids_merchant ON merchant_mids(merchant_id);
                    CREATE INDEX IF NOT EXISTS idx_mids_status ON merchant_mids(status);
                    CREATE INDEX IF NOT EXISTS idx_merchant_users_email ON merchant_users(email);
                    CREATE INDEX IF NOT EXISTS idx_merchant_users_merchant ON merchant_users(merchant_id);
                `);
                return Response.json({ success: true, message: 'All schemas initialized for production' });
            }

            case 'testConnection': {
                const result = await pool.query('SELECT NOW() as server_time, version() as pg_version');
                return Response.json({ 
                    success: true, 
                    serverTime: result.rows[0].server_time,
                    version: result.rows[0].pg_version
                });
            }

            case 'getStats': {
                const stats = await pool.query(`
                    SELECT 
                        (SELECT COUNT(*) FROM merchants) as merchant_count,
                        (SELECT COUNT(*) FROM transactions) as transaction_count,
                        (SELECT COUNT(*) FROM chargebacks) as chargeback_count,
                        (SELECT COUNT(*) FROM risk_alerts WHERE status = 'open') as open_alerts,
                        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'approved') as total_volume
                `);
                return Response.json({ success: true, data: stats.rows[0] });
            }

            case 'query': {
                const result = await pool.query(sql, params || []);
                return Response.json({ success: true, data: result });
            }

            case 'execute': {
                await pool.query(sql, params || []);
                return Response.json({ success: true });
            }

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});