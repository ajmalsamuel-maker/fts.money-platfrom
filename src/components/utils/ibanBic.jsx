// ISO 13616 (IBAN) and ISO 9362 (BIC) Validation
// Using ibantools library

import { 
    isValidIBAN, 
    isValidBIC, 
    electronicFormatIBAN, 
    friendlyFormatIBAN,
    getCountrySpecifications,
    extractIBAN
} from 'ibantools';

// Validate IBAN (ISO 13616)
export const validateIBAN = (iban) => {
    const validation = isValidIBAN(iban);
    return {
        valid: validation,
        formatted: validation ? friendlyFormatIBAN(iban) : null,
        electronic: validation ? electronicFormatIBAN(iban) : null,
        country: validation ? iban.substring(0, 2) : null,
        checkDigits: validation ? iban.substring(2, 4) : null
    };
};

// Validate BIC/SWIFT Code (ISO 9362)
export const validateBIC = (bic) => {
    const validation = isValidBIC(bic);
    return {
        valid: validation,
        bankCode: validation ? bic.substring(0, 4) : null,
        countryCode: validation ? bic.substring(4, 6) : null,
        locationCode: validation ? bic.substring(6, 8) : null,
        branchCode: validation && bic.length === 11 ? bic.substring(8, 11) : null,
        isPrimaryOffice: !bic || bic.length === 8 || bic.substring(8, 11) === 'XXX'
    };
};

// Format IBAN for display
export const formatIBAN = (iban, friendly = true) => {
    if (!iban) return '';
    const electronic = electronicFormatIBAN(iban);
    return friendly ? friendlyFormatIBAN(electronic) : electronic;
};

// Extract IBAN from text
export const extractIBANFromText = (text) => {
    const result = extractIBAN(text);
    return result.iban || null;
};

// Get IBAN country specifications
export const getIBANCountrySpec = (countryCode) => {
    const specs = getCountrySpecifications();
    return specs[countryCode] || null;
};

// Generate IBAN Check Digits (for testing/generation)
export const calculateIBANCheckDigits = (countryCode, bban) => {
    const rearranged = bban + countryCode + '00';
    const numericString = rearranged.replace(/[A-Z]/g, char => 
        (char.charCodeAt(0) - 55).toString()
    );
    
    let remainder = numericString.match(/.{1,9}/g).reduce((acc, chunk) => {
        return (parseInt(acc + chunk) % 97).toString();
    }, '');
    
    const checkDigits = (98 - parseInt(remainder)).toString().padStart(2, '0');
    return checkDigits;
};

// Common BIC/SWIFT patterns by country
export const COMMON_BIC_PATTERNS = {
    US: /^[A-Z]{4}US[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    GB: /^[A-Z]{4}GB[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    DE: /^[A-Z]{4}DE[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    FR: /^[A-Z]{4}FR[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    CH: /^[A-Z]{4}CH[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    AU: /^[A-Z]{4}AU[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    JP: /^[A-Z]{4}JP[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    CN: /^[A-Z]{4}CN[A-Z0-9]{2}([A-Z0-9]{3})?$/,
};

// Parse BIC details
export const parseBIC = (bic) => {
    if (!isValidBIC(bic)) {
        return { valid: false };
    }

    return {
        valid: true,
        bankCode: bic.substring(0, 4),
        countryCode: bic.substring(4, 6),
        locationCode: bic.substring(6, 8),
        branchCode: bic.length === 11 ? bic.substring(8, 11) : 'XXX',
        isPrimaryOffice: bic.length === 8 || bic.substring(8, 11) === 'XXX',
        formatted: bic.length === 8 ? `${bic}XXX` : bic,
        description: `${bic.substring(0, 4)} - ${getCountryName(bic.substring(4, 6))}`
    };
};

// Get country name from code
const getCountryName = (code) => {
    const countries = {
        US: 'United States',
        GB: 'United Kingdom',
        DE: 'Germany',
        FR: 'France',
        CH: 'Switzerland',
        AU: 'Australia',
        JP: 'Japan',
        CN: 'China',
        SG: 'Singapore',
        HK: 'Hong Kong'
    };
    return countries[code] || code;
};

// Validate Bank Account (IBAN or local format)
export const validateBankAccount = (accountNumber, country) => {
    // Try IBAN first
    const ibanValidation = validateIBAN(accountNumber);
    if (ibanValidation.valid) {
        return {
            valid: true,
            type: 'IBAN',
            formatted: ibanValidation.formatted,
            country: ibanValidation.country
        };
    }

    // Country-specific validation
    switch (country) {
        case 'US':
            return validateUSAccount(accountNumber);
        case 'GB':
            return validateUKAccount(accountNumber);
        default:
            return { valid: false, type: 'Unknown' };
    }
};

// US Account Number validation (routing + account)
const validateUSAccount = (accountNumber) => {
    const parts = accountNumber.split('-');
    if (parts.length === 2) {
        const routing = parts[0];
        const account = parts[1];
        if (routing.length === 9 && /^\d+$/.test(routing) && account.length <= 17) {
            return {
                valid: true,
                type: 'US_ACCOUNT',
                routing,
                account,
                formatted: `${routing}-${account}`
            };
        }
    }
    return { valid: false, type: 'US_ACCOUNT' };
};

// UK Sort Code + Account Number validation
const validateUKAccount = (accountNumber) => {
    const parts = accountNumber.split('-');
    if (parts.length === 2) {
        const sortCode = parts[0].replace(/\s/g, '');
        const account = parts[1];
        if (sortCode.length === 6 && /^\d+$/.test(sortCode) && account.length === 8) {
            return {
                valid: true,
                type: 'UK_ACCOUNT',
                sortCode: sortCode.match(/.{2}/g).join('-'),
                account,
                formatted: `${sortCode.match(/.{2}/g).join('-')}-${account}`
            };
        }
    }
    return { valid: false, type: 'UK_ACCOUNT' };
};