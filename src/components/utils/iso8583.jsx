// ISO 8583 Implementation for Card Network Connectivity
// Based on industry standards for financial transaction card messages

// ISO 8583 Message Type Identifiers (MTI)
export const MTI = {
    AUTHORIZATION_REQUEST: '0100',
    AUTHORIZATION_RESPONSE: '0110',
    FINANCIAL_REQUEST: '0200',
    FINANCIAL_RESPONSE: '0210',
    REVERSAL_REQUEST: '0400',
    REVERSAL_RESPONSE: '0410',
    NETWORK_MANAGEMENT: '0800',
    NETWORK_MANAGEMENT_RESPONSE: '0810',
};

// ISO 8583 Field Definitions (common subset)
export const FIELD_DEFINITIONS = {
    0: { name: 'Message Type Indicator', type: 'n', length: 4 },
    1: { name: 'Bitmap', type: 'b', length: 64 },
    2: { name: 'Primary Account Number (PAN)', type: 'n', length: 19, format: 'LLVAR' },
    3: { name: 'Processing Code', type: 'n', length: 6 },
    4: { name: 'Amount, Transaction', type: 'n', length: 12 },
    5: { name: 'Amount, Settlement', type: 'n', length: 12 },
    6: { name: 'Amount, Cardholder Billing', type: 'n', length: 12 },
    7: { name: 'Transmission Date & Time', type: 'n', length: 10 },
    11: { name: 'System Trace Audit Number (STAN)', type: 'n', length: 6 },
    12: { name: 'Local Transaction Time', type: 'n', length: 6 },
    13: { name: 'Local Transaction Date', type: 'n', length: 4 },
    14: { name: 'Expiration Date', type: 'n', length: 4 },
    15: { name: 'Settlement Date', type: 'n', length: 4 },
    18: { name: 'Merchant Type', type: 'n', length: 4 },
    22: { name: 'POS Entry Mode', type: 'n', length: 3 },
    23: { name: 'Card Sequence Number', type: 'n', length: 3 },
    25: { name: 'POS Condition Code', type: 'n', length: 2 },
    32: { name: 'Acquiring Institution ID', type: 'n', length: 11, format: 'LLVAR' },
    37: { name: 'Retrieval Reference Number', type: 'an', length: 12 },
    38: { name: 'Authorization ID Response', type: 'an', length: 6 },
    39: { name: 'Response Code', type: 'an', length: 2 },
    41: { name: 'Card Acceptor Terminal ID', type: 'ans', length: 8 },
    42: { name: 'Card Acceptor ID Code', type: 'ans', length: 15 },
    43: { name: 'Card Acceptor Name/Location', type: 'ans', length: 40 },
    49: { name: 'Currency Code, Transaction', type: 'a/n', length: 3 },
    52: { name: 'PIN Data', type: 'b', length: 64 },
    54: { name: 'Additional Amounts', type: 'an', length: 120, format: 'LLLVAR' },
    55: { name: 'ICC Data', type: 'b', length: 255, format: 'LLLVAR' },
    90: { name: 'Original Data Elements', type: 'n', length: 42 },
    95: { name: 'Replacement Amounts', type: 'an', length: 42 },
};

// Response Codes
export const RESPONSE_CODES = {
    '00': 'Approved',
    '01': 'Refer to card issuer',
    '02': 'Refer to card issuer, special condition',
    '03': 'Invalid merchant',
    '04': 'Capture card',
    '05': 'Do not honor',
    '06': 'Error',
    '07': 'Capture card, special condition',
    '12': 'Invalid transaction',
    '13': 'Invalid amount',
    '14': 'Invalid card number',
    '15': 'Invalid issuer',
    '30': 'Format error',
    '41': 'Lost card, pick up',
    '43': 'Stolen card, pick up',
    '51': 'Insufficient funds',
    '54': 'Expired card',
    '55': 'Incorrect PIN',
    '57': 'Transaction not permitted to cardholder',
    '58': 'Transaction not permitted to terminal',
    '61': 'Exceeds withdrawal amount limit',
    '62': 'Restricted card',
    '63': 'Security violation',
    '65': 'Exceeds withdrawal frequency limit',
    '75': 'PIN tries exceeded',
    '91': 'Issuer or switch inoperative',
    '92': 'Financial institution cannot be found',
    '94': 'Duplicate transmission',
    '96': 'System malfunction',
};

// Build ISO 8583 Message
export const buildISO8583Message = (mti, fields) => {
    const message = {
        mti,
        bitmap: calculateBitmap(fields),
        fields: {}
    };

    Object.keys(fields).forEach(fieldNum => {
        const field = FIELD_DEFINITIONS[fieldNum];
        if (field) {
            message.fields[fieldNum] = {
                name: field.name,
                value: fields[fieldNum],
                type: field.type
            };
        }
    });

    return message;
};

// Calculate Bitmap
const calculateBitmap = (fields) => {
    const bitmap = new Array(128).fill(0);
    Object.keys(fields).forEach(fieldNum => {
        if (fieldNum > 1) {
            bitmap[parseInt(fieldNum) - 1] = 1;
        }
    });
    return bitmap.join('').match(/.{1,8}/g).map(byte => 
        parseInt(byte, 2).toString(16).padStart(2, '0')
    ).join('').toUpperCase();
};

// Parse ISO 8583 Response
export const parseISO8583Response = (responseData) => {
    return {
        mti: responseData.mti,
        responseCode: responseData.fields['39']?.value,
        responseMessage: RESPONSE_CODES[responseData.fields['39']?.value] || 'Unknown',
        authCode: responseData.fields['38']?.value,
        rrn: responseData.fields['37']?.value,
        stan: responseData.fields['11']?.value,
        approved: responseData.fields['39']?.value === '00'
    };
};

// Transaction to ISO 8583 Converter
export const transactionToISO8583 = (transaction) => {
    const now = new Date();
    const fields = {
        2: transaction.card_number?.replace(/\D/g, ''),
        3: '000000', // Purchase
        4: Math.round((transaction.amount || 0) * 100).toString().padStart(12, '0'),
        7: now.toISOString().replace(/[-:TZ.]/g, '').substring(4, 14),
        11: (transaction.transaction_id || '').substring(0, 6) || Math.floor(Math.random() * 999999).toString().padStart(6, '0'),
        12: now.toTimeString().replace(/:/g, '').substring(0, 6),
        13: now.toISOString().substring(5, 10).replace('-', ''),
        14: transaction.card_expiry || '2512',
        18: transaction.mcc_code || '5999',
        22: '012', // Contactless
        25: '00', // Normal
        32: (transaction.merchant_id || '').substring(0, 11),
        37: transaction.rrn || generateRRN(),
        41: (transaction.terminal_id || '').substring(0, 8) || 'TERM0001',
        42: (transaction.merchant_id || '').substring(0, 15),
        49: transaction.currency || 'USD',
    };

    return buildISO8583Message(MTI.FINANCIAL_REQUEST, fields);
};

// Generate Retrieval Reference Number
const generateRRN = () => {
    const now = new Date();
    const julian = Math.ceil((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const time = now.toTimeString().replace(/:/g, '').substring(0, 6);
    return `${julian.toString().padStart(3, '0')}${time}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
};

// POS Entry Mode Codes
export const POS_ENTRY_MODES = {
    '000': 'Unknown',
    '010': 'Manual',
    '011': 'Manual, card holder present',
    '012': 'Manual, mail/phone order',
    '020': 'Magnetic stripe',
    '021': 'Magnetic stripe, card holder present',
    '050': 'Chip',
    '051': 'Chip, card present',
    '071': 'Contactless',
    '072': 'Contactless, mobile',
    '080': 'Fallback to magnetic stripe',
    '090': 'E-commerce',
    '091': 'E-commerce, credential on file',
};

// Processing Codes
export const PROCESSING_CODES = {
    '000000': 'Goods and Services',
    '010000': 'Cash Withdrawal',
    '200000': 'Refund',
    '280000': 'Reversal',
    '300000': 'Balance Inquiry',
};