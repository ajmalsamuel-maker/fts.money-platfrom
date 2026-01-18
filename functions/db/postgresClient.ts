import { Client } from 'npm:pg@17.1.0';

let pool = null;

/**
 * Get or create database connection
 */
async function getConnection() {
    if (!pool) {
        const connectionString = Deno.env.get('DATABASE_URL');
        if (!connectionString) {
            throw new Error('DATABASE_URL environment variable not set');
        }
        pool = new Client(connectionString);
        await pool.connect();
    }
    return pool;
}

/**
 * Execute a query and return results
 */
export async function query(sql, params = []) {
    const client = await getConnection();
    try {
        const result = await client.queryObject(sql, params);
        return result.rows;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

/**
 * Execute a query and return first row
 */
export async function queryOne(sql, params = []) {
    const results = await query(sql, params);
    return results.length > 0 ? results[0] : null;
}

/**
 * Execute a query that returns nothing (INSERT, UPDATE, DELETE)
 */
export async function execute(sql, params = []) {
    const client = await getConnection();
    try {
        await client.queryObject(sql, params);
    } catch (error) {
        console.error('Execute error:', error);
        throw error;
    }
}

/**
 * Bulk insert records
 */
export async function bulkInsert(tableName, records) {
    if (!records || records.length === 0) {
        return;
    }

    const keys = Object.keys(records[0]);
    const columns = keys.join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    for (const record of records) {
        const values = keys.map(key => record[key]);
        const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
        await execute(sql, values);
    }
}

/**
 * Close database connection
 */
export async function closeConnection() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}

/**
 * List all tables in the public schema
 */
export async function listTables() {
    const results = await query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );
    return results.map(r => r.table_name);
}

/**
 * Check if table exists
 */
export async function tableExists(tableName) {
    const result = await queryOne(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`,
        [tableName]
    );
    return result?.exists || false;
}

/**
 * Get table column info
 */
export async function getTableColumns(tableName) {
    const results = await query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
        [tableName]
    );
    return results;
}