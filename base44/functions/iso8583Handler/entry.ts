import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * ISO 8583 Message Handler for TMS
 * Receives ISO 8583 messages from terminals/ATMs and translates to ISO 20022 for PSP Platform
 * This handler sits at the edge (TMS) and acts as protocol adapter
 */

// ISO 8583 Field Definitions (partial - common fields)
const ISO8583_FIELDS = {
    0: 'Message Type Indicator',
    2: 'Primary Account Number (PAN)',
    3: 'Processing Code',
    4: 'Transaction Amount',
    7: 'Transmission Date & Time',
    11: 'System Trace Audit Number (STAN)',
    12: 'Local Transaction Time',
    13: 'Local Transaction Date',
    22: 'Point of Service Entry Mode',
    25: 'Point of Service Condition Code',
    32: 'Acquiring Institution ID',
    37: 'Retrieval Reference Number',
    38: 'Authorization Code',
    39: 'Response Code',
    41: 'Card Acceptor Terminal ID',
    42: 'Card Acceptor ID',
    43: 'Card Acceptor Name/Location',
    49: 'Currency Code',
    54: 'Additional Amounts',
    55: 'ICC Data (EMV)',
    102: 'Account ID 1',
    103: 'Account ID 2'
};

// ISO 8583 Message Type Codes
const MESSAGE_TYPES = {
    '0100': 'Authorization Request',
    '0110': 'Authorization Response',
    '0200': 'Financial Transaction Request',
    '0210': 'Financial Transaction Response',
    '0400': 'Reversal Request',
    '0410': 'Reversal Response',
    '0800': 'Network Management Request',
    '0810': 'Network Management Response'
};

// ISO 8583 to Transaction Type mapping
const PROCESSING_CODE_MAP = {
    '00': 'sale',           // Purchase
    '01': 'withdrawal',     // Cash Withdrawal
    '20': 'refund',         // Refund
    '30': 'auth',           // Balance Inquiry (mapped to auth)
    '90': 'void'            // Void/Reversal
};

// ISO 8583 Response Codes
const RESPONSE_CODES = {
    '00': { status: 'approved', message: 'Approved' },
    '01': { status: 'declined', message: 'Refer to card issuer' },
    '03': { status: 'declined', message: 'Invalid merchant' },
    '05': { status: 'declined', message: 'Do not honor' },
    '12': { status: 'failed', message: 'Invalid transaction' },
    '13': { status: 'declined', message: 'Invalid amount' },
    '14': { status: 'declined', message: 'Invalid card number' },
    '30': { status: 'failed', message: 'Format error' },
    '51': { status: 'declined', message: 'Insufficient funds' },
    '54': { status: 'declined', message: 'Expired card' },
    '55': { status: 'declined', message: 'Incorrect PIN' },
    '91': { status: 'failed', message: 'Issuer unavailable' },
    '96': { status: 'failed', message: 'System malfunction' }
};

/**
 * Parse ISO 8583 message (simplified - assumes bitmap and field parsing)
 * In production, use a proper ISO 8583 library
 */
function parseISO8583(isoMessage) {
    // This is a simplified parser - in production use iso8583-js or similar
    // For now, assuming a structured object is passed
    return isoMessage;
}

/**
 * Translate ISO 8583 to ISO 20022 transaction format
 */
export function iso8583ToISO20022(iso8583Message) {
    const parsed = typeof iso8583Message === 'string' ? parseISO8583(iso8583Message) : iso8583Message;
    
    const processingCode = parsed['3']?.substring(0, 2) || '00';
    const transactionType = PROCESSING_CODE_MAP[processingCode] || 'sale';
    
    const amount = parsed['4'] ? parseFloat(parsed['4']) / 100 : 0; // ISO 8583 amounts in cents
    const currency = parsed['49'] || 'USD';
    
    // Generate ISO 20022 identifiers
    const msgId = `MSG${Date.now()}${parsed['11']}`;
    const endToEndId = `E2E${parsed['42']}${parsed['37']}`.substring(0, 35);
    const txnId = parsed['37'] || `TXN${parsed['11']}`;
    
    return {
        // ISO 20022 Core Fields
        iso20022_message_id: msgId,
        iso20022_payment_info_id: `PMT${txnId}`,
        iso20022_end_to_end_id: endToEndId,
        iso20022_transaction_id: txnId,
        iso20022_charge_bearer: 'SLEV',
        
        // Transaction Details
        transaction_id: txnId,
        type: transactionType,
        amount: amount,
        currency: currency,
        
        // Terminal/Card Data
        terminal_id: parsed['41'],
        merchant_id: parsed['42'],
        card_number: parsed['2'] ? `****${parsed['2'].slice(-4)}` : null,
        card_last_four: parsed['2']?.slice(-4),
        card_prefix: parsed['2']?.substring(0, 6),
        
        // Transaction Metadata
        rrn: parsed['37'],
        auth_code: parsed['38'],
        response_code: parsed['39'],
        channel_txn_id: parsed['11'],
        
        // Timestamp
        created_date: new Date().toISOString(),
        
        // Additional ISO 8583 specific data
        metadata: {
            iso8583_mti: parsed['0'],
            iso8583_processing_code: parsed['3'],
            iso8583_stan: parsed['11'],
            iso8583_pos_entry_mode: parsed['22'],
            iso8583_pos_condition: parsed['25'],
            iso8583_acquiring_id: parsed['32'],
            iso8583_emv_data: parsed['55'],
            iso8583_raw_message: parsed
        }
    };
}

/**
 * Translate ISO 20022 response to ISO 8583 format
 */
export function iso20022ToISO8583Response(transaction, originalISO8583) {
    const responseCode = transaction.status === 'approved' ? '00' : 
                        transaction.status === 'declined' ? '05' : '96';
    
    return {
        '0': originalISO8583['0'].substring(0, 2) + '10', // Response MTI (0110, 0210, etc.)
        '2': originalISO8583['2'],
        '3': originalISO8583['3'],
        '4': originalISO8583['4'],
        '7': new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 10),
        '11': originalISO8583['11'],
        '12': originalISO8583['12'],
        '13': originalISO8583['13'],
        '37': transaction.rrn || transaction.transaction_id,
        '38': transaction.auth_code || '',
        '39': responseCode,
        '41': originalISO8583['41'],
        '42': originalISO8583['42']
    };
}

/**
 * Build ISO 8583 response message (simplified)
 */
function buildISO8583Message(fields) {
    // In production, use proper ISO 8583 message builder
    return fields;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, iso8583_message, transaction_id } = await req.json();

        if (action === 'translate_request') {
            // Translate incoming ISO 8583 to ISO 20022
            const iso20022Transaction = iso8583ToISO20022(iso8583_message);
            
            // Store in database with ISO 20022 format
            const transaction = await base44.asServiceRole.entities.Transaction.create(iso20022Transaction);
            
            return Response.json({
                success: true,
                format: 'ISO 20022',
                transaction: transaction,
                iso20022_data: {
                    message_id: iso20022Transaction.iso20022_message_id,
                    end_to_end_id: iso20022Transaction.iso20022_end_to_end_id,
                    transaction_id: iso20022Transaction.iso20022_transaction_id
                }
            });
        }

        if (action === 'translate_response') {
            // Fetch transaction (ISO 20022 format)
            const transactions = await base44.asServiceRole.entities.Transaction.filter({ transaction_id });
            if (transactions.length === 0) {
                return Response.json({ error: 'Transaction not found' }, { status: 404 });
            }
            const transaction = transactions[0];
            
            // Get original ISO 8583 message from metadata
            const originalISO8583 = transaction.metadata?.iso8583_raw_message;
            if (!originalISO8583) {
                return Response.json({ error: 'Original ISO 8583 message not found' }, { status: 400 });
            }
            
            // Translate ISO 20022 response back to ISO 8583
            const iso8583Response = iso20022ToISO8583Response(transaction, originalISO8583);
            const responseMessage = buildISO8583Message(iso8583Response);
            
            return Response.json({
                success: true,
                format: 'ISO 8583',
                iso8583_response: responseMessage,
                transaction_status: transaction.status
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});