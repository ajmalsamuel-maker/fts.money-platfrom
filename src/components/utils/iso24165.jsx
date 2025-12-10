// ISO 24165:2021 - Digital Token Identifier (DTI)
// 9-character alphanumeric identifier for digital tokens

// DTI Structure: XXXYYYZZ9
// XXX = Issuing Organization (3 chars)
// YYY = Token Identifier (3 chars)
// ZZ = Check digits (2 chars)
// 9 = Version digit (1 char)

// Generate DTI (ISO 24165 compliant)
export const generateDTI = (organizationCode, tokenCode) => {
    const org = organizationCode.substring(0, 3).toUpperCase().padEnd(3, '0');
    const token = tokenCode.substring(0, 3).toUpperCase().padEnd(3, '0');
    const checkDigits = calculateDTICheckDigits(org + token);
    const version = '1';
    
    return `${org}${token}${checkDigits}${version}`;
};

// Calculate DTI check digits (Luhn algorithm variant)
const calculateDTICheckDigits = (baseString) => {
    const numericString = baseString.split('').map(char => {
        return char.charCodeAt(0) - 48;
    }).join('');
    
    let sum = 0;
    for (let i = 0; i < numericString.length; i++) {
        let digit = parseInt(numericString[i]);
        if (i % 2 === 0) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
    }
    
    const checksum = (10 - (sum % 10)) % 10;
    const secondDigit = (sum % 11) % 10;
    
    return `${checksum}${secondDigit}`;
};

// Validate DTI format
export const validateDTI = (dti) => {
    if (!dti || dti.length !== 9) {
        return { valid: false, error: 'DTI must be 9 characters' };
    }
    
    const org = dti.substring(0, 3);
    const token = dti.substring(3, 6);
    const providedCheck = dti.substring(6, 8);
    const version = dti.substring(8, 9);
    
    const calculatedCheck = calculateDTICheckDigits(org + token);
    
    return {
        valid: providedCheck === calculatedCheck,
        organization: org,
        token: token,
        checkDigits: providedCheck,
        version: version,
        error: providedCheck !== calculatedCheck ? 'Invalid check digits' : null
    };
};

// Parse DTI components
export const parseDTI = (dti) => {
    if (!dti || dti.length !== 9) return null;
    
    return {
        organizationCode: dti.substring(0, 3),
        tokenCode: dti.substring(3, 6),
        checkDigits: dti.substring(6, 8),
        version: dti.substring(8, 9),
        full: dti
    };
};

// Common Token Organization Codes (examples)
export const DTI_ORGANIZATIONS = {
    ETH: { code: 'ETH', name: 'Ethereum Foundation', type: 'Protocol' },
    BTC: { code: 'BTC', name: 'Bitcoin Core', type: 'Protocol' },
    BNB: { code: 'BNB', name: 'Binance', type: 'Exchange' },
    USD: { code: 'USD', name: 'USD Stablecoin Issuers', type: 'Stablecoin' },
    CMC: { code: 'CMC', name: 'CoinMarketCap', type: 'Registry' },
    CGK: { code: 'CGK', name: 'CoinGecko', type: 'Registry' }
};

// Token Categories (ISO 24165)
export const TOKEN_CATEGORIES = {
    PAYMENT: { code: 'PAY', description: 'Payment tokens' },
    UTILITY: { code: 'UTL', description: 'Utility tokens' },
    SECURITY: { code: 'SEC', description: 'Security tokens' },
    STABLE: { code: 'STB', description: 'Stablecoins' },
    GOVERNANCE: { code: 'GOV', description: 'Governance tokens' },
    NFT: { code: 'NFT', description: 'Non-fungible tokens' }
};

// DTI Registry (sample entries)
export const DTI_REGISTRY = [
    { dti: 'ETH00011', name: 'Ethereum', symbol: 'ETH', category: 'PAYMENT' },
    { dti: 'BTC00011', name: 'Bitcoin', symbol: 'BTC', category: 'PAYMENT' },
    { dti: 'USDTTR11', name: 'Tether', symbol: 'USDT', category: 'STABLE' },
    { dti: 'USDCRC11', name: 'USD Coin', symbol: 'USDC', category: 'STABLE' },
    { dti: 'BNB00011', name: 'Binance Coin', symbol: 'BNB', category: 'UTILITY' }
];

// Look up token by DTI
export const lookupTokenByDTI = (dti) => {
    return DTI_REGISTRY.find(entry => entry.dti === dti);
};

// Generate DTI for crypto asset
export const generateCryptoAssetDTI = (symbol, issuer = 'CMC') => {
    const tokenCode = symbol.substring(0, 3).toUpperCase();
    return generateDTI(issuer, tokenCode);
};