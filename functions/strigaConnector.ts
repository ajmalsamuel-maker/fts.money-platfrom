/**
 * Striga API Connector
 * Handles all Striga API operations for crypto banking infrastructure
 * Documentation: https://docs.striga.com/
 */

const STRIGA_API_URL = 'https://api.striga.com';

/**
 * Get Striga API credentials from environment
 */
function getStrigaCredentials() {
    return {
        applicationId: Deno.env.get('STRIGA_APPLICATION_ID'),
        apiKey: Deno.env.get('STRIGA_API_KEY'),
        apiSecret: Deno.env.get('STRIGA_API_SECRET'),
        uiSecret: Deno.env.get('STRIGA_UI_SECRET')
    };
}

/**
 * Make authenticated request to Striga API
 */
async function strigaRequest(endpoint, method = 'GET', body = null) {
    const { apiKey } = getStrigaCredentials();
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };
    
    const options = {
        method,
        headers
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${STRIGA_API_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`Striga API Error: ${data.message || response.statusText}`);
    }
    
    return data;
}

/**
 * Create a new user in Striga
 * @param {Object} userData - User information
 * @returns {Promise<Object>} Created user data
 */
async function createUser(userData) {
    return await strigaRequest('/v1/users', 'POST', {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        mobile: {
            countryCode: userData.countryCode || '+1',
            number: userData.phoneNumber
        },
        dateOfBirth: {
            year: userData.birthYear,
            month: userData.birthMonth,
            day: userData.birthDay
        },
        address: {
            addressLine1: userData.address,
            city: userData.city,
            postalCode: userData.postalCode,
            country: userData.country
        }
    });
}

/**
 * Start KYC verification for a user
 * @param {string} userId - Striga user ID
 * @returns {Promise<Object>} KYC verification data
 */
async function startKYC(userId) {
    return await strigaRequest(`/v1/users/${userId}/kyc`, 'POST');
}

/**
 * Get user KYC status
 * @param {string} userId - Striga user ID
 * @returns {Promise<Object>} KYC status
 */
async function getKYCStatus(userId) {
    return await strigaRequest(`/v1/users/${userId}/kyc`, 'GET');
}

/**
 * Create crypto wallet for user
 * @param {string} userId - Striga user ID
 * @param {string} currency - Crypto currency (BTC, ETH, USDC, etc.)
 * @returns {Promise<Object>} Wallet data with address
 */
async function createWallet(userId, currency) {
    return await strigaRequest('/v1/wallets', 'POST', {
        userId,
        currency: currency.toUpperCase(),
        label: `${currency} Wallet`
    });
}

/**
 * Get all wallets for a user
 * @param {string} userId - Striga user ID
 * @returns {Promise<Array>} List of wallets
 */
async function getWallets(userId) {
    return await strigaRequest(`/v1/users/${userId}/wallets`, 'GET');
}

/**
 * Create virtual IBAN for user
 * @param {string} userId - Striga user ID
 * @returns {Promise<Object>} IBAN details
 */
async function createIBAN(userId) {
    return await strigaRequest('/v1/accounts', 'POST', {
        userId,
        accountType: 'SEPA',
        currency: 'EUR'
    });
}

/**
 * Get account balances
 * @param {string} accountId - Striga account ID
 * @returns {Promise<Object>} Balance information
 */
async function getBalance(accountId) {
    return await strigaRequest(`/v1/accounts/${accountId}/balance`, 'GET');
}

/**
 * Create virtual card for user
 * @param {string} userId - Striga user ID
 * @param {Object} cardDetails - Card configuration
 * @returns {Promise<Object>} Card details
 */
async function createCard(userId, cardDetails = {}) {
    return await strigaRequest('/v1/cards', 'POST', {
        userId,
        cardType: cardDetails.type || 'VIRTUAL',
        currency: cardDetails.currency || 'EUR',
        label: cardDetails.label || 'Virtual Card'
    });
}

/**
 * Initiate crypto withdrawal
 * @param {string} walletId - Source wallet ID
 * @param {Object} withdrawalData - Withdrawal details
 * @returns {Promise<Object>} Withdrawal transaction
 */
async function withdrawCrypto(walletId, withdrawalData) {
    return await strigaRequest('/v1/withdrawals/crypto', 'POST', {
        walletId,
        destination: withdrawalData.address,
        amount: withdrawalData.amount,
        currency: withdrawalData.currency
    });
}

/**
 * Initiate SEPA transfer
 * @param {string} accountId - Source account ID
 * @param {Object} transferData - Transfer details
 * @returns {Promise<Object>} Transfer transaction
 */
async function sepaTransfer(accountId, transferData) {
    return await strigaRequest('/v1/transfers/sepa', 'POST', {
        accountId,
        beneficiary: {
            name: transferData.beneficiaryName,
            iban: transferData.iban,
            bic: transferData.bic
        },
        amount: transferData.amount,
        currency: 'EUR',
        reference: transferData.reference
    });
}

/**
 * Exchange crypto to fiat or vice versa
 * @param {string} userId - Striga user ID
 * @param {Object} exchangeData - Exchange details
 * @returns {Promise<Object>} Exchange transaction
 */
async function exchange(userId, exchangeData) {
    return await strigaRequest('/v1/exchange', 'POST', {
        userId,
        sourceCurrency: exchangeData.from,
        destinationCurrency: exchangeData.to,
        amount: exchangeData.amount,
        sourceAccountId: exchangeData.sourceAccountId
    });
}

/**
 * Get transaction history
 * @param {string} accountId - Account ID
 * @param {Object} filters - Optional filters (startDate, endDate, limit)
 * @returns {Promise<Array>} List of transactions
 */
async function getTransactions(accountId, filters = {}) {
    const params = new URLSearchParams(filters);
    return await strigaRequest(`/v1/accounts/${accountId}/transactions?${params}`, 'GET');
}

/**
 * Webhook signature verification
 * @param {string} payload - Webhook payload
 * @param {string} signature - Webhook signature header
 * @returns {boolean} Signature is valid
 */
function verifyWebhookSignature(payload, signature) {
    const { apiSecret } = getStrigaCredentials();
    const crypto = Deno.core.ops.op_crypto_get_random_values;
    
    // Implementation depends on Striga's webhook signature method
    // Usually HMAC-SHA256
    return true; // Placeholder - implement based on Striga docs
}

// Main handler for direct function calls
Deno.serve(async (req) => {
    try {
        const { action, ...params } = await req.json();
        
        let result;
        
        switch (action) {
            case 'createUser':
                result = await createUser(params.userData);
                break;
                
            case 'startKYC':
                result = await startKYC(params.userId);
                break;
                
            case 'getKYCStatus':
                result = await getKYCStatus(params.userId);
                break;
                
            case 'createWallet':
                result = await createWallet(params.userId, params.currency);
                break;
                
            case 'getWallets':
                result = await getWallets(params.userId);
                break;
                
            case 'createIBAN':
                result = await createIBAN(params.userId);
                break;
                
            case 'getBalance':
                result = await getBalance(params.accountId);
                break;
                
            case 'createCard':
                result = await createCard(params.userId, params.cardDetails);
                break;
                
            case 'withdrawCrypto':
                result = await withdrawCrypto(params.walletId, params.withdrawalData);
                break;
                
            case 'sepaTransfer':
                result = await sepaTransfer(params.accountId, params.transferData);
                break;
                
            case 'exchange':
                result = await exchange(params.userId, params.exchangeData);
                break;
                
            case 'getTransactions':
                result = await getTransactions(params.accountId, params.filters);
                break;
                
            default:
                return Response.json(
                    { error: `Unknown action: ${action}` },
                    { status: 400 }
                );
        }
        
        return Response.json({ success: true, data: result });
        
    } catch (error) {
        console.error('Striga Connector Error:', error);
        return Response.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
});

// Export functions for use in other backend functions
export {
    createUser,
    startKYC,
    getKYCStatus,
    createWallet,
    getWallets,
    createIBAN,
    getBalance,
    createCard,
    withdrawCrypto,
    sepaTransfer,
    exchange,
    getTransactions,
    verifyWebhookSignature
};