/**
 * PostgreSQL Client for Deno
 * Uses postgres.js (postgres) which is fully compatible with Deno Deploy
 * No Node.js API dependencies
 */

import postgres from 'npm:postgres@3.4.4';

// Create singleton connection pool
let sqlPool = null;

function getPool() {
    if (!sqlPool) {
        const dbUrl = Deno.env.get('DATABASE_URL');
        if (!dbUrl) {
            throw new Error('DATABASE_URL environment variable not set');
        }
        
        // postgres.js automatically creates a connection pool
        sqlPool = postgres(dbUrl, {
            max: 10, // max connections in pool
            timeout: 30, // connection timeout in seconds
            idle_timeout: 60, // close idle connections after 60s
            max_lifetime: 60 * 60, // max connection lifetime
            ssl: 'require', // use SSL for secure connections
            transform: postgres.camel // convert snake_case to camelCase
        });
    }
    return sqlPool;
}

/**
 * Execute a SELECT query and return all rows
 */
export async function queryRows(sql, params = []) {
    const sql_func = getPool();
    try {
        return await sql_func(sql, params);
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

/**
 * Execute a SELECT query and return single row
 */
export async function queryRow(sql, params = []) {
    const rows = await queryRows(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute INSERT/UPDATE/DELETE and return number of affected rows
 */
export async function query(sql, params = []) {
    const sql_func = getPool();
    try {
        const result = await sql_func(sql, params);
        return result.count || 0;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

/**
 * Execute bulk INSERT
 */
export async function insertRows(table, rows) {
    const sql_func = getPool();
    try {
        if (!rows || rows.length === 0) return 0;
        
        const columns = Object.keys(rows[0]);
        const values = rows.map(row => columns.map(col => row[col]));
        
        const result = await sql_func(
            sql`INSERT INTO ${sql(table)} (${sql(columns)}) VALUES ${sql(values)}`
        );
        return result.count || 0;
    } catch (error) {
        console.error('Insert error:', error);
        throw error;
    }
}

/**
 * List tables in database
 */
export async function listTables() {
    const sql_func = getPool();
    try {
        const result = await sql_func`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        return result.map(row => row.table_name);
    } catch (error) {
        console.error('List tables error:', error);
        throw error;
    }
}

/**
 * Check if table exists
 */
export async function tableExists(tableName) {
    const sql_func = getPool();
    try {
        const result = await sql_func`
            SELECT EXISTS(
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = ${tableName}
            ) as exists
        `;
        return result[0]?.exists || false;
    } catch (error) {
        console.error('Table exists check error:', error);
        throw error;
    }
}

/**
 * Get column info for a table
 */
export async function getTableColumns(tableName) {
    const sql_func = getPool();
    try {
        return await sql_func`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = ${tableName}
            ORDER BY ordinal_position
        `;
    } catch (error) {
        console.error('Get columns error:', error);
        throw error;
    }
}

/**
 * Execute raw SQL transaction
 */
export async function transaction(callback) {
    const sql_func = getPool();
    try {
        return await sql_func.begin(async (sql) => {
            return await callback(sql);
        });
    } catch (error) {
        console.error('Transaction error:', error);
        throw error;
    }
}

/**
 * Close all connections (call before exit)
 */
export async function closePool() {
    if (sqlPool) {
        await sqlPool.end();
        sqlPool = null;
    }
}

export { postgres };