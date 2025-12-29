import { Client } from 'npm:pg@8.11.3';

Deno.serve(async (req) => {
    try {
        const databaseUrl = Deno.env.get('DATABASE_URL');
        
        if (!databaseUrl) {
            return Response.json({ 
                success: false, 
                error: 'DATABASE_URL not found in environment variables',
                hint: 'Please set the DATABASE_URL secret in the dashboard'
            }, { status: 500 });
        }

        console.log('Attempting to connect to database...');
        console.log('Database URL prefix:', databaseUrl.substring(0, 20) + '...');

        const client = new Client({
            connectionString: databaseUrl,
            ssl: {
                rejectUnauthorized: false
            }
        });

        await client.connect();
        console.log('Connected successfully!');

        // Test query
        const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
        
        // Check if AuthUser table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'authuser'
            ) as auth_user_exists
        `);

        await client.end();

        return Response.json({
            success: true,
            message: 'Database connection successful',
            server_time: result.rows[0].current_time,
            postgres_version: result.rows[0].postgres_version,
            auth_user_table_exists: tableCheck.rows[0].auth_user_exists,
            database_url_configured: true
        });

    } catch (error) {
        console.error('Database connection error:', error);
        return Response.json({
            success: false,
            error: error.message,
            error_type: error.name,
            stack: error.stack
        }, { status: 500 });
    }
});