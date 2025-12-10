/**
 * Utility functions for generating and validating merchant codes
 */

/**
 * Generate a unique merchant code based on business name
 * @param {string} businessName - The merchant's business name
 * @param {number} sequence - Optional sequence number for uniqueness
 * @returns {string} - Generated merchant code
 */
export function generateMerchantCode(businessName, sequence = null) {
    if (!businessName) {
        return `MERCH-${String(Date.now()).slice(-6)}`;
    }

    // Extract meaningful parts from business name
    const cleaned = businessName
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .trim();
    
    // Get first 3-4 letters of first two words
    const words = cleaned.split(/\s+/).filter(w => w.length > 0);
    let prefix = '';
    
    if (words.length >= 2) {
        prefix = words[0].slice(0, 3) + words[1].slice(0, 2);
    } else if (words.length === 1) {
        prefix = words[0].slice(0, 5);
    } else {
        prefix = 'MERCH';
    }
    
    // Add sequence or timestamp
    const suffix = sequence ? String(sequence).padStart(3, '0') : String(Date.now()).slice(-3);
    
    return `${prefix}-${suffix}`;
}

/**
 * Validate merchant code format
 * @param {string} code - The merchant code to validate
 * @returns {boolean} - Whether the code is valid
 */
export function validateMerchantCode(code) {
    if (!code || typeof code !== 'string') return false;
    
    // Format: 3-12 characters, alphanumeric with optional hyphens
    const regex = /^[A-Z0-9][A-Z0-9-]{4,11}[A-Z0-9]$/;
    return regex.test(code);
}

/**
 * Check if merchant code is unique
 * @param {string} code - The merchant code to check
 * @param {Array} existingMerchants - List of existing merchants
 * @returns {boolean} - Whether the code is unique
 */
export function isCodeUnique(code, existingMerchants) {
    return !existingMerchants.some(m => m.merchant_code === code);
}

/**
 * Generate a unique merchant code ensuring no duplicates
 * @param {string} businessName - The merchant's business name
 * @param {Array} existingMerchants - List of existing merchants
 * @returns {string} - Unique merchant code
 */
export function generateUniqueMerchantCode(businessName, existingMerchants) {
    let code = generateMerchantCode(businessName);
    let attempts = 0;
    
    while (!isCodeUnique(code, existingMerchants) && attempts < 100) {
        code = generateMerchantCode(businessName, attempts + 1);
        attempts++;
    }
    
    if (attempts >= 100) {
        // Fallback to timestamp-based code
        code = `MERCH-${String(Date.now()).slice(-6)}`;
    }
    
    return code;
}