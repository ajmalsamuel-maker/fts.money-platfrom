import { query, listTables, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const databaseUrl = Deno.env.get('DATABASE_URL');
        
        if (!databaseUrl) {
            return Response.json({ 
                success: false, 
                error: 'DATABASE_URL environment variable not set' 
            });
        }

        // Test basic connection
        const versionResult = await query('SELECT version()');
        const version = versionResult[0]?.version || 'Unknown';
        
        // Get database info
        const dbInfoResult = await query('SELECT current_database(), current_user');
        const dbInfo = dbInfoResult[0] || {};
        
        // Check if tables exist
        const tables = await listTables();
        
        await closeConnection();

        // Parse database URL to get host info (remove credentials)
        const urlParts = databaseUrl.split('@');
        const hostPart = urlParts[1]?.split('/')[0] || 'unknown';

        return Response.json({ 
            success: true,
            message: 'PostgreSQL database connection successful',
            version: version.split(' ')[0] + ' ' + version.split(' ')[1],
            host: hostPart,
            database: dbInfo.current_database || 'unknown',
            tables_count: tables.length,
            tables: tables
        });

    } catch (error) {
        await closeConnection();
        return Response.json({ 
            success: false, 
            error: `PostgreSQL connection failed: ${error.message}`
        });
    }
});