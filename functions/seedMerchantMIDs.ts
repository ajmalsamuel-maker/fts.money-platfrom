import postgres from 'npm:postgres@3.4.5';

const sql = postgres(Deno.env.get('DATABASE_URL'));

const mockProviders = [
    { name: 'Stripe', prefix: 'acct_' },
    { name: 'Adyen', prefix: 'ADYEN' },
    { name: 'PayPal', prefix: 'PP' },
    { name: 'Skrill', prefix: 'SKRL' },
    { name: 'WeChat', prefix: 'WX' },
    { name: 'AliPay', prefix: 'ALPY' },
    { name: 'Square', prefix: 'SQ' },
    { name: 'Braintree', prefix: 'BT' }
];

const transactionTypes = [
    ['sale', 'refund', 'void'],
    ['sale', 'refund'],
    ['sale', 'auth', 'capture'],
    ['sale', 'void', 'refund', 'chargeback']
];

const accountTypes = ['standard', 'premium', 'enterprise'];
const currencies = ['USD', 'EUR', 'GBP', 'HKD', 'SGD'];
const statuses = ['active', 'pending', 'inactive'];

function generateMID(provider) {
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${provider.prefix}${random}`;
}

Deno.serve(async (req) => {
    try {
        const { psp_code, count = 20 } = await req.json();

        if (!psp_code) {
            return Response.json({ error: 'psp_code is required' }, { status: 400 });
        }

        const schemaName = `psp_${psp_code.toLowerCase().replace(/-/g, '_')}`;

        // Check if schema exists
        const schemaCheck = await sql`
            SELECT schema_name FROM information_schema.schemata 
            WHERE schema_name = ${schemaName}
        `;

        if (schemaCheck.length === 0) {
            return Response.json({ 
                error: `Schema ${schemaName} does not exist` 
            }, { status: 404 });
        }

        // Set search path
        await sql`SET search_path TO ${sql(schemaName)}, public`;

        // Get existing merchants
        const merchants = await sql`
            SELECT id, business_name FROM merchants 
            WHERE psp_code = ${psp_code}
            LIMIT 50
        `;

        if (merchants.length === 0) {
            return Response.json({ 
                error: 'No merchants found. Please create merchants first.' 
            }, { status: 404 });
        }

        const createdMIDs = [];
        
        for (let i = 0; i < count; i++) {
            const merchant = merchants[Math.floor(Math.random() * merchants.length)];
            const provider = mockProviders[Math.floor(Math.random() * mockProviders.length)];
            const mid = generateMID(provider);
            const accountType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
            const txTypes = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
            const currency = currencies[Math.floor(Math.random() * currencies.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            const result = await sql`
                INSERT INTO merchant_mids (
                    psp_code,
                    merchant_id,
                    merchant_name,
                    mid,
                    provider_name,
                    account_type,
                    transaction_types,
                    currency,
                    status,
                    activation_date,
                    notes
                ) VALUES (
                    ${psp_code},
                    ${merchant.id},
                    ${merchant.business_name},
                    ${mid},
                    ${provider.name},
                    ${accountType},
                    ${JSON.stringify(txTypes)},
                    ${currency},
                    ${status},
                    ${new Date().toISOString().split('T')[0]},
                    ${'Auto-generated test MID for ' + provider.name}
                )
                RETURNING *
            `;

            createdMIDs.push(result[0]);
        }

        return Response.json({
            success: true,
            message: `Created ${createdMIDs.length} test MIDs`,
            data: createdMIDs
        });

    } catch (error) {
        console.error('Seed MIDs error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});