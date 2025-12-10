import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import postgres from 'npm:postgres';

const sql = postgres(Deno.env.get("DATABASE_URL"));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'super_admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Add new columns to transactions table
        const migrationSQL = `
            ALTER TABLE transactions 
            ADD COLUMN IF NOT EXISTS transaction_id TEXT,
            ADD COLUMN IF NOT EXISTS merchant_transaction_id TEXT,
            ADD COLUMN IF NOT EXISTS order_id TEXT,
            ADD COLUMN IF NOT EXISTS mid TEXT,
            ADD COLUMN IF NOT EXISTS action TEXT,
            ADD COLUMN IF NOT EXISTS original_amount NUMERIC,
            ADD COLUMN IF NOT EXISTS vat_amount NUMERIC DEFAULT 0,
            ADD COLUMN IF NOT EXISTS actual_amount NUMERIC,
            ADD COLUMN IF NOT EXISTS card_number TEXT,
            ADD COLUMN IF NOT EXISTS card_prefix TEXT,
            ADD COLUMN IF NOT EXISTS issuer_bank TEXT,
            ADD COLUMN IF NOT EXISTS customer_phone TEXT,
            ADD COLUMN IF NOT EXISTS bill_to_account_name TEXT,
            ADD COLUMN IF NOT EXISTS user_id TEXT,
            ADD COLUMN IF NOT EXISTS remarks TEXT,
            ADD COLUMN IF NOT EXISTS approval_code TEXT,
            ADD COLUMN IF NOT EXISTS connector_response_code TEXT,
            ADD COLUMN IF NOT EXISTS connector_txn_no TEXT,
            ADD COLUMN IF NOT EXISTS trial_id TEXT,
            ADD COLUMN IF NOT EXISTS channel_txn_id TEXT,
            ADD COLUMN IF NOT EXISTS rrn TEXT,
            ADD COLUMN IF NOT EXISTS eci TEXT,
            ADD COLUMN IF NOT EXISTS arn TEXT,
            ADD COLUMN IF NOT EXISTS fraud_control_status TEXT,
            ADD COLUMN IF NOT EXISTS complete_time TIMESTAMP,
            ADD COLUMN IF NOT EXISTS accepted_time TIMESTAMP,
            ADD COLUMN IF NOT EXISTS operator TEXT,
            ADD COLUMN IF NOT EXISTS notification_status TEXT,
            ADD COLUMN IF NOT EXISTS last_sent_time TIMESTAMP,
            ADD COLUMN IF NOT EXISTS beneficiary_name TEXT,
            ADD COLUMN IF NOT EXISTS account_no TEXT,
            ADD COLUMN IF NOT EXISTS bank_code TEXT,
            ADD COLUMN IF NOT EXISTS bank_name TEXT,
            ADD COLUMN IF NOT EXISTS branch_number TEXT,
            ADD COLUMN IF NOT EXISTS transaction_log JSONB,
            ADD COLUMN IF NOT EXISTS history JSONB,
            ADD COLUMN IF NOT EXISTS metadata JSONB,
            ADD COLUMN IF NOT EXISTS payment_code TEXT;
            
            CREATE INDEX IF NOT EXISTS idx_transactions_transaction_id ON transactions(transaction_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_merchant_txn_id ON transactions(merchant_transaction_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_mid ON transactions(mid);
            CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
        `;

        await sql.unsafe(migrationSQL);

        return Response.json({ 
            success: true, 
            message: 'Transaction table migration completed successfully'
        });
    } catch (error) {
        console.error('Migration error:', error);
        return Response.json({ 
            error: error.message,
            details: error.toString()
        }, { status: 500 });
    }
});