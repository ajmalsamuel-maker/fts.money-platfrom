-- FTS.Money PostgreSQL Schema
-- Core tables for all 20+ migrated functions

-- Multi-Tenancy & Core
CREATE TABLE IF NOT EXISTS tenant (
    id SERIAL PRIMARY KEY,
    psp_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);

-- 3D Secure
CREATE TABLE IF NOT EXISTS three_ds_challenge (
    id SERIAL PRIMARY KEY,
    challenge_id VARCHAR(100) UNIQUE NOT NULL,
    transaction_id VARCHAR(100),
    psp_code VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'initiated',
    authenticated_at TIMESTAMP,
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

CREATE TABLE IF NOT EXISTS otp (
    id SERIAL PRIMARY KEY,
    otp_code VARCHAR(10) NOT NULL,
    merchant_id VARCHAR(100),
    psp_code VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    expires_at TIMESTAMP,
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Tokenization
CREATE TABLE IF NOT EXISTS tokenized_card (
    id SERIAL PRIMARY KEY,
    token_id VARCHAR(100) UNIQUE NOT NULL,
    merchant_id VARCHAR(100),
    psp_code VARCHAR(50) NOT NULL,
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    revoked_at TIMESTAMP,
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

CREATE TABLE IF NOT EXISTS network_token (
    id SERIAL PRIMARY KEY,
    network_token VARCHAR(100) UNIQUE NOT NULL,
    tokenized_card_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    network VARCHAR(20),
    created_date TIMESTAMP DEFAULT NOW()
);

-- Rate Limiting & Velocity
CREATE TABLE IF NOT EXISTS velocity_limit (
    id SERIAL PRIMARY KEY,
    merchant_id VARCHAR(100),
    psp_code VARCHAR(50) NOT NULL,
    hourly_limit INT DEFAULT 100,
    daily_limit INT DEFAULT 1000,
    created_date TIMESTAMP DEFAULT NOW(),
    UNIQUE(merchant_id, psp_code),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Recurring Billing
CREATE TABLE IF NOT EXISTS subscription (
    id SERIAL PRIMARY KEY,
    subscription_id VARCHAR(100) UNIQUE NOT NULL,
    merchant_id VARCHAR(100),
    psp_code VARCHAR(50) NOT NULL,
    amount NUMERIC(15,2),
    frequency VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    next_billing_date TIMESTAMP,
    cancelled_date TIMESTAMP,
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

CREATE TABLE IF NOT EXISTS subscription_invoice (
    id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(100) UNIQUE NOT NULL,
    subscription_id VARCHAR(100),
    amount NUMERIC(15,2),
    status VARCHAR(20) DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    created_date TIMESTAMP DEFAULT NOW()
);

-- Webhooks
CREATE TABLE IF NOT EXISTS webhook_endpoint (
    id SERIAL PRIMARY KEY,
    endpoint_id VARCHAR(100) UNIQUE NOT NULL,
    merchant_id VARCHAR(100),
    psp_code VARCHAR(50) NOT NULL,
    url VARCHAR(255),
    event_types JSONB,
    secret VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

CREATE TABLE IF NOT EXISTS webhook_delivery (
    id SERIAL PRIMARY KEY,
    delivery_id VARCHAR(100) UNIQUE NOT NULL,
    event_id VARCHAR(100),
    endpoint_id VARCHAR(100),
    psp_code VARCHAR(50) NOT NULL,
    payload JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    next_retry TIMESTAMP,
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- API Keys
CREATE TABLE IF NOT EXISTS api_key (
    id SERIAL PRIMARY KEY,
    key_id VARCHAR(100) UNIQUE NOT NULL,
    merchant_id VARCHAR(100),
    psp_code VARCHAR(50) NOT NULL,
    key_hash VARCHAR(255),
    secret_hash VARCHAR(255),
    scopes JSONB,
    status VARCHAR(20) DEFAULT 'active',
    revoked_at TIMESTAMP,
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Audit Trail
CREATE TABLE IF NOT EXISTS audit_trail (
    id SERIAL PRIMARY KEY,
    audit_id VARCHAR(100) UNIQUE NOT NULL,
    psp_code VARCHAR(50) NOT NULL,
    user_id VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    action_type VARCHAR(50),
    changes JSONB,
    ip_address VARCHAR(45),
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Caching
CREATE TABLE IF NOT EXISTS cache_store (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    psp_code VARCHAR(50) NOT NULL,
    value JSONB,
    expires_at TIMESTAMP,
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Message Queue
CREATE TABLE IF NOT EXISTS message_queue (
    id SERIAL PRIMARY KEY,
    queue_id VARCHAR(100) UNIQUE NOT NULL,
    psp_code VARCHAR(50) NOT NULL,
    queue_name VARCHAR(100),
    payload JSONB,
    priority INT DEFAULT 5,
    status VARCHAR(20) DEFAULT 'queued',
    completed_at TIMESTAMP,
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Backup & Recovery
CREATE TABLE IF NOT EXISTS database_snapshot (
    id SERIAL PRIMARY KEY,
    snapshot_id VARCHAR(100) UNIQUE NOT NULL,
    psp_code VARCHAR(50) NOT NULL,
    snapshot_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'in_progress',
    completed_date TIMESTAMP,
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

CREATE TABLE IF NOT EXISTS restore_job (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(100) UNIQUE NOT NULL,
    snapshot_id VARCHAR(100),
    psp_code VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'in_progress',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

CREATE TABLE IF NOT EXISTS replication_config (
    id SERIAL PRIMARY KEY,
    psp_code VARCHAR(50) UNIQUE NOT NULL,
    replica_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flag (
    id SERIAL PRIMARY KEY,
    flag_id VARCHAR(100) UNIQUE NOT NULL,
    psp_code VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    enabled BOOLEAN DEFAULT false,
    rollout_percentage INT DEFAULT 0,
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Data Encryption
CREATE TABLE IF NOT EXISTS encrypted_field (
    id SERIAL PRIMARY KEY,
    encrypted_id VARCHAR(100) UNIQUE NOT NULL,
    psp_code VARCHAR(50) NOT NULL,
    field_name VARCHAR(100),
    encrypted_value TEXT,
    algorithm VARCHAR(50),
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

CREATE TABLE IF NOT EXISTS encryption_key (
    id SERIAL PRIMARY KEY,
    key_id VARCHAR(100) UNIQUE NOT NULL,
    psp_code VARCHAR(50) NOT NULL,
    algorithm VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Service Quota & Rate Limiting
CREATE TABLE IF NOT EXISTS service_quota (
    id SERIAL PRIMARY KEY,
    service_id VARCHAR(100),
    psp_code VARCHAR(50) NOT NULL,
    quota_limit INT DEFAULT 100,
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

CREATE TABLE IF NOT EXISTS service_request (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(100),
    service_id VARCHAR(100),
    psp_code VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'success',
    recorded_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Analytics
CREATE TABLE IF NOT EXISTS analytics_event (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) UNIQUE NOT NULL,
    psp_code VARCHAR(50) NOT NULL,
    event_type VARCHAR(100),
    user_id VARCHAR(100),
    data JSONB,
    recorded_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Compliance
CREATE TABLE IF NOT EXISTS compliance_policy (
    id SERIAL PRIMARY KEY,
    policy_id VARCHAR(100) UNIQUE NOT NULL,
    psp_code VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    enabled BOOLEAN DEFAULT true,
    created_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

CREATE TABLE IF NOT EXISTS compliance_check (
    id SERIAL PRIMARY KEY,
    check_id VARCHAR(100) UNIQUE NOT NULL,
    psp_code VARCHAR(50) NOT NULL,
    policy_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'executed',
    executed_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

CREATE TABLE IF NOT EXISTS compliance_attestation (
    id SERIAL PRIMARY KEY,
    attestation_id VARCHAR(100) UNIQUE NOT NULL,
    psp_code VARCHAR(50) NOT NULL,
    policy_id VARCHAR(100),
    signed_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Cost Tracking
CREATE TABLE IF NOT EXISTS usage_meter (
    id SERIAL PRIMARY KEY,
    usage_id VARCHAR(100) UNIQUE NOT NULL,
    merchant_id VARCHAR(100),
    psp_code VARCHAR(50) NOT NULL,
    usage_type VARCHAR(100),
    quantity NUMERIC(15,2),
    recorded_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

CREATE TABLE IF NOT EXISTS usage_pricing (
    id SERIAL PRIMARY KEY,
    psp_code VARCHAR(50) NOT NULL,
    usage_type VARCHAR(100),
    price_per_unit NUMERIC(10,4),
    created_date TIMESTAMP DEFAULT NOW(),
    UNIQUE(psp_code, usage_type),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Service Discovery
CREATE TABLE IF NOT EXISTS service_instance (
    id SERIAL PRIMARY KEY,
    instance_id VARCHAR(100) UNIQUE NOT NULL,
    psp_code VARCHAR(50) NOT NULL,
    service_name VARCHAR(100),
    health_check_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'healthy',
    registered_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Disaster Recovery
CREATE TABLE IF NOT EXISTS failover_config (
    id SERIAL PRIMARY KEY,
    failover_id VARCHAR(100) UNIQUE NOT NULL,
    psp_code VARCHAR(50) NOT NULL,
    primary_region VARCHAR(50),
    standby_region VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    rto_minutes INT DEFAULT 15,
    rpo_minutes INT DEFAULT 5,
    failover_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Observability
CREATE TABLE IF NOT EXISTS observability_metric (
    id SERIAL PRIMARY KEY,
    metric_id VARCHAR(100) UNIQUE NOT NULL,
    psp_code VARCHAR(50) NOT NULL,
    service VARCHAR(100),
    metric_name VARCHAR(100),
    value NUMERIC(15,4),
    recorded_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

CREATE TABLE IF NOT EXISTS structured_log (
    id SERIAL PRIMARY KEY,
    log_id VARCHAR(100) UNIQUE NOT NULL,
    psp_code VARCHAR(50) NOT NULL,
    level VARCHAR(20),
    message TEXT,
    context JSONB,
    recorded_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (psp_code) REFERENCES tenant(psp_code)
);

-- Create Indexes for Performance
CREATE INDEX idx_transaction_psp ON transaction(psp_code);
CREATE INDEX idx_transaction_merchant ON transaction(merchant_id);
CREATE INDEX idx_transaction_status ON transaction(status);
CREATE INDEX idx_transaction_created ON transaction(created_date DESC);
CREATE INDEX idx_merchant_psp ON merchant(psp_code);
CREATE INDEX idx_audit_psp_user ON audit_trail(psp_code, user_id);
CREATE INDEX idx_analytics_psp_type ON analytics_event(psp_code, event_type);
CREATE INDEX idx_webhook_psp_status ON webhook_delivery(psp_code, status);
CREATE INDEX idx_cache_key ON cache_store(cache_key);
CREATE INDEX idx_queue_psp_status ON message_queue(psp_code, status);
CREATE INDEX idx_three_ds_challenge ON three_ds_challenge(psp_code, status);
CREATE INDEX idx_tokenized_card_merchant ON tokenized_card(merchant_id, psp_code);
CREATE INDEX idx_velocity_merchant ON velocity_limit(merchant_id, psp_code);
CREATE INDEX idx_subscription_merchant ON subscription(merchant_id, psp_code);
CREATE INDEX idx_api_key_merchant ON api_key(merchant_id, psp_code);
CREATE INDEX idx_feature_flag_psp ON feature_flag(psp_code, name);
CREATE INDEX idx_service_instance_service ON service_instance(psp_code, service_name);
CREATE INDEX idx_failover_psp ON failover_config(psp_code);