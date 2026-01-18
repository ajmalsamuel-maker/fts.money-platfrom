-- PostgreSQL Performance Tuning Queries

-- 1. Analyze all tables for query planner
ANALYZE;

-- 2. Reindex large tables for optimization
REINDEX INDEX CONCURRENTLY idx_transaction_psp;
REINDEX INDEX CONCURRENTLY idx_transaction_merchant;
REINDEX INDEX CONCURRENTLY idx_transaction_status;
REINDEX INDEX CONCURRENTLY idx_transaction_created;

-- 3. Vacuum to remove dead rows and optimize storage
VACUUM ANALYZE transaction;
VACUUM ANALYZE merchant;
VACUUM ANALYZE audit_trail;
VACUUM ANALYZE webhook_delivery;
VACUUM ANALYZE analytics_event;

-- 4. Create covering indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_txn_lookup 
ON transaction(psp_code, merchant_id, status) 
INCLUDE (amount, created_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_search 
ON audit_trail(psp_code, user_id, entity_type) 
INCLUDE (action_type, created_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_delivery_status 
ON webhook_delivery(psp_code, status, created_date);

-- 5. Partitioning strategy for large tables (by psp_code)
-- ALTER TABLE transaction 
-- PARTITION BY LIST (psp_code);

-- 6. Connection pool settings (in postgresql.conf)
-- shared_buffers = 4GB
-- effective_cache_size = 12GB
-- maintenance_work_mem = 1GB
-- checkpoint_completion_target = 0.9
-- wal_buffers = 16MB
-- default_statistics_target = 100
-- random_page_cost = 1.1
-- effective_io_concurrency = 200
-- work_mem = 26214kB
-- min_wal_size = 1GB
-- max_wal_size = 4GB

-- 7. Query statistics for slow query identification
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 20;

-- 8. Check table bloat
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;