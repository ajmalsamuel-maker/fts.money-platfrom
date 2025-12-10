// ISO 4217 Currency Codes - Complete Reference
// Enhanced with minor units, currency names, and country mappings

export const ISO4217_CURRENCIES = [
    { code: 'USD', num: '840', name: 'US Dollar', minorUnit: 2, countries: ['US', 'EC', 'SV', 'TL'] },
    { code: 'EUR', num: '978', name: 'Euro', minorUnit: 2, countries: ['DE', 'FR', 'IT', 'ES', 'PT', 'IE', 'NL', 'BE', 'AT', 'FI', 'GR', 'LU', 'SI', 'SK', 'EE', 'LV', 'LT', 'CY', 'MT'] },
    { code: 'GBP', num: '826', name: 'Pound Sterling', minorUnit: 2, countries: ['GB'] },
    { code: 'JPY', num: '392', name: 'Yen', minorUnit: 0, countries: ['JP'] },
    { code: 'CHF', num: '756', name: 'Swiss Franc', minorUnit: 2, countries: ['CH', 'LI'] },
    { code: 'AUD', num: '036', name: 'Australian Dollar', minorUnit: 2, countries: ['AU', 'KI', 'NR', 'TV'] },
    { code: 'CAD', num: '124', name: 'Canadian Dollar', minorUnit: 2, countries: ['CA'] },
    { code: 'CNY', num: '156', name: 'Yuan Renminbi', minorUnit: 2, countries: ['CN'] },
    { code: 'HKD', num: '344', name: 'Hong Kong Dollar', minorUnit: 2, countries: ['HK'] },
    { code: 'NZD', num: '554', name: 'New Zealand Dollar', minorUnit: 2, countries: ['NZ', 'CK', 'NU', 'PN', 'TK'] },
    { code: 'SEK', num: '752', name: 'Swedish Krona', minorUnit: 2, countries: ['SE'] },
    { code: 'KRW', num: '410', name: 'Won', minorUnit: 0, countries: ['KR'] },
    { code: 'SGD', num: '702', name: 'Singapore Dollar', minorUnit: 2, countries: ['SG'] },
    { code: 'NOK', num: '578', name: 'Norwegian Krone', minorUnit: 2, countries: ['NO', 'SJ', 'BV'] },
    { code: 'MXN', num: '484', name: 'Mexican Peso', minorUnit: 2, countries: ['MX'] },
    { code: 'INR', num: '356', name: 'Indian Rupee', minorUnit: 2, countries: ['IN', 'BT'] },
    { code: 'RUB', num: '643', name: 'Russian Ruble', minorUnit: 2, countries: ['RU'] },
    { code: 'ZAR', num: '710', name: 'Rand', minorUnit: 2, countries: ['ZA', 'LS', 'NA'] },
    { code: 'TRY', num: '949', name: 'Turkish Lira', minorUnit: 2, countries: ['TR'] },
    { code: 'BRL', num: '986', name: 'Brazilian Real', minorUnit: 2, countries: ['BR'] },
    { code: 'TWD', num: '901', name: 'New Taiwan Dollar', minorUnit: 2, countries: ['TW'] },
    { code: 'DKK', num: '208', name: 'Danish Krone', minorUnit: 2, countries: ['DK', 'FO', 'GL'] },
    { code: 'PLN', num: '985', name: 'Zloty', minorUnit: 2, countries: ['PL'] },
    { code: 'THB', num: '764', name: 'Baht', minorUnit: 2, countries: ['TH'] },
    { code: 'IDR', num: '360', name: 'Rupiah', minorUnit: 2, countries: ['ID'] },
    { code: 'HUF', num: '348', name: 'Forint', minorUnit: 2, countries: ['HU'] },
    { code: 'CZK', num: '203', name: 'Czech Koruna', minorUnit: 2, countries: ['CZ'] },
    { code: 'ILS', num: '376', name: 'New Israeli Sheqel', minorUnit: 2, countries: ['IL', 'PS'] },
    { code: 'CLP', num: '152', name: 'Chilean Peso', minorUnit: 0, countries: ['CL'] },
    { code: 'PHP', num: '608', name: 'Philippine Peso', minorUnit: 2, countries: ['PH'] },
    { code: 'AED', num: '784', name: 'UAE Dirham', minorUnit: 2, countries: ['AE'] },
    { code: 'COP', num: '170', name: 'Colombian Peso', minorUnit: 2, countries: ['CO'] },
    { code: 'SAR', num: '682', name: 'Saudi Riyal', minorUnit: 2, countries: ['SA'] },
    { code: 'MYR', num: '458', name: 'Malaysian Ringgit', minorUnit: 2, countries: ['MY'] },
    { code: 'RON', num: '946', name: 'Romanian Leu', minorUnit: 2, countries: ['RO'] },
    { code: 'ARS', num: '032', name: 'Argentine Peso', minorUnit: 2, countries: ['AR'] },
    { code: 'VND', num: '704', name: 'Dong', minorUnit: 0, countries: ['VN'] },
    { code: 'EGP', num: '818', name: 'Egyptian Pound', minorUnit: 2, countries: ['EG'] },
    { code: 'NGN', num: '566', name: 'Naira', minorUnit: 2, countries: ['NG'] },
    { code: 'BDT', num: '050', name: 'Taka', minorUnit: 2, countries: ['BD'] },
    { code: 'PKR', num: '586', name: 'Pakistan Rupee', minorUnit: 2, countries: ['PK'] },
    { code: 'MAD', num: '504', name: 'Moroccan Dirham', minorUnit: 2, countries: ['MA', 'EH'] },
    { code: 'UAH', num: '980', name: 'Hryvnia', minorUnit: 2, countries: ['UA'] },
    { code: 'KES', num: '404', name: 'Kenyan Shilling', minorUnit: 2, countries: ['KE'] },
    { code: 'QAR', num: '634', name: 'Qatari Rial', minorUnit: 2, countries: ['QA'] },
    { code: 'KWD', num: '414', name: 'Kuwaiti Dinar', minorUnit: 3, countries: ['KW'] },
    { code: 'BHD', num: '048', name: 'Bahraini Dinar', minorUnit: 3, countries: ['BH'] },
    { code: 'OMR', num: '512', name: 'Rial Omani', minorUnit: 3, countries: ['OM'] },
    { code: 'JOD', num: '400', name: 'Jordanian Dinar', minorUnit: 3, countries: ['JO'] },
];

// Get currency by code
export const getCurrencyByCode = (code) => {
    return ISO4217_CURRENCIES.find(c => c.code === code);
};

// Get currency by numeric code
export const getCurrencyByNumeric = (num) => {
    return ISO4217_CURRENCIES.find(c => c.num === num);
};

// Get currencies for country
export const getCurrenciesForCountry = (countryCode) => {
    return ISO4217_CURRENCIES.filter(c => 
        c.countries.includes(countryCode)
    );
};

// Format amount according to currency
export const formatCurrencyAmount = (amount, currencyCode) => {
    const currency = getCurrencyByCode(currencyCode);
    if (!currency) return amount.toFixed(2);
    
    return amount.toFixed(currency.minorUnit);
};

// Convert to minor units (cents, pence, etc)
export const toMinorUnits = (amount, currencyCode) => {
    const currency = getCurrencyByCode(currencyCode);
    if (!currency) return Math.round(amount * 100);
    
    return Math.round(amount * Math.pow(10, currency.minorUnit));
};

// Convert from minor units
export const fromMinorUnits = (amount, currencyCode) => {
    const currency = getCurrencyByCode(currencyCode);
    if (!currency) return amount / 100;
    
    return amount / Math.pow(10, currency.minorUnit);
};

// Get all currency codes
export const getAllCurrencyCodes = () => {
    return ISO4217_CURRENCIES.map(c => c.code);
};

// Get currency symbol (common ones)
export const getCurrencySymbol = (code) => {
    const symbols = {
        USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
        CHF: 'Fr', AUD: 'A$', CAD: 'C$', HKD: 'HK$',
        INR: '₹', RUB: '₽', BRL: 'R$', KRW: '₩',
        TRY: '₺', MXN: 'Mex$', ZAR: 'R', SGD: 'S$',
        SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł',
        THB: '฿', AED: 'د.إ', SAR: '﷼', IDR: 'Rp'
    };
    return symbols[code] || code;
};

// Validate currency code
export const isValidCurrencyCode = (code) => {
    return ISO4217_CURRENCIES.some(c => c.code === code);
};

// Get currency info with symbol
export const getCurrencyInfo = (code) => {
    const currency = getCurrencyByCode(code);
    if (!currency) return null;
    
    return {
        ...currency,
        symbol: getCurrencySymbol(code),
        displayName: `${currency.name} (${code})`
    };
};