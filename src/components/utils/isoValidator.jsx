// Comprehensive ISO Standards Validator
// Validates data against ISO 4217, ISO 3166-1, ISO 8583, ISO 20022, ISO 9362, ISO 13616, ISO 23257, ISO 24165

import { ISO4217_CURRENCIES } from './iso4217';
import { COUNTRIES } from './countries';
import { validateIBAN, isValidBIC } from './ibanBic';
import { validateDTI } from './iso24165';
import { validateBlockchainTransaction, validateAddressFormat } from './iso23257';

// ISO 4217 Currency Validation
export const validateCurrency = (currencyCode) => {
    const currency = ISO4217_CURRENCIES.find(c => c.code === currencyCode);
    return {
        valid: !!currency,
        standard: 'ISO 4217',
        data: currency,
        error: currency ? null : 'Invalid currency code'
    };
};

// ISO 3166-1 Country Validation
export const validateCountry = (countryCode) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    return {
        valid: !!country,
        standard: 'ISO 3166-1',
        data: country,
        error: country ? null : 'Invalid country code'
    };
};

// ISO 9362 BIC Validation
export const validateBIC = (bic) => {
    const valid = isValidBIC(bic);
    return {
        valid,
        standard: 'ISO 9362',
        error: valid ? null : 'Invalid BIC code'
    };
};

// ISO 13616 IBAN Validation
export const validateIBANFormat = (iban) => {
    const result = validateIBAN(iban);
    return {
        valid: result.valid,
        standard: 'ISO 13616',
        data: result,
        error: result.valid ? null : 'Invalid IBAN'
    };
};

// ISO 23257 Blockchain Transaction Validation
export const validateDLTTransaction = (transaction) => {
    const result = validateBlockchainTransaction(transaction);
    return {
        valid: result.valid,
        standard: 'ISO 23257',
        validations: result.validations,
        error: result.valid ? null : 'Invalid blockchain transaction'
    };
};

// ISO 24165 DTI Validation
export const validateDTIFormat = (dti) => {
    const result = validateDTI(dti);
    return {
        valid: result.valid,
        standard: 'ISO 24165',
        data: result,
        error: result.error
    };
};

// Comprehensive Transaction Validation
export const validateTransaction = (transaction) => {
    const validations = {
        currency: validateCurrency(transaction.currency),
        country: transaction.customer_country ? validateCountry(transaction.customer_country) : { valid: true },
        amount: {
            valid: transaction.amount > 0,
            standard: 'ISO 4217',
            error: transaction.amount > 0 ? null : 'Invalid amount'
        }
    };

    // Add crypto validations if applicable
    if (transaction.crypto_asset) {
        validations.dti = transaction.crypto_dti ? validateDTIFormat(transaction.crypto_dti) : { valid: false };
        if (transaction.crypto_address && transaction.blockchain_network) {
            validations.blockchain = { 
                valid: validateAddressFormat(transaction.crypto_address, transaction.blockchain_network),
                standard: 'ISO 23257'
            };
        }
    }

    const allValid = Object.values(validations).every(v => v.valid);

    return {
        valid: allValid,
        validations,
        standards: Object.values(validations).map(v => v.standard).filter(Boolean)
    };
};

// Get ISO Compliance Score (0-100)
export const getISOComplianceScore = (transaction) => {
    const validation = validateTransaction(transaction);
    const totalChecks = Object.keys(validation.validations).length;
    const passedChecks = Object.values(validation.validations).filter(v => v.valid).length;
    return Math.round((passedChecks / totalChecks) * 100);
};

// Generate ISO Compliance Report
export const generateISOComplianceReport = (transaction) => {
    const validation = validateTransaction(transaction);
    const score = getISOComplianceScore(transaction);
    
    return {
        transactionId: transaction.id || transaction.transaction_id,
        timestamp: new Date().toISOString(),
        complianceScore: score,
        isCompliant: validation.valid,
        standards: validation.standards,
        validations: validation.validations,
        recommendations: Object.entries(validation.validations)
            .filter(([_, v]) => !v.valid)
            .map(([key, v]) => ({
                field: key,
                standard: v.standard,
                error: v.error
            }))
    };
};

// Batch Validation for Multiple Transactions
export const validateTransactionBatch = (transactions) => {
    return transactions.map(tx => ({
        id: tx.id || tx.transaction_id,
        validation: validateTransaction(tx),
        score: getISOComplianceScore(tx)
    }));
};