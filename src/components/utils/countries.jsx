// ISO 3166-1 Alpha-2 Country Codes - Simplified List
export const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'SG', name: 'Singapore' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'PT', name: 'Portugal' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'AT', name: 'Austria' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'IE', name: 'Ireland' },
    { code: 'PL', name: 'Poland' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'GR', name: 'Greece' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'IL', name: 'Israel' },
    { code: 'TR', name: 'Turkey' },
    { code: 'RU', name: 'Russia' },
    { code: 'TH', name: 'Thailand' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'PH', name: 'Philippines' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'KR', name: 'South Korea' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'EG', name: 'Egypt' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'KE', name: 'Kenya' }
];

// ISO 3166-1 country to currency mapping
export const countryCurrencyMap = {
    'US': 'USD', 'GB': 'GBP', 'EU': 'EUR', 'JP': 'JPY', 'CN': 'CNY', 'IN': 'INR',
    'CA': 'CAD', 'AU': 'AUD', 'SG': 'SGD', 'HK': 'HKD', 'CH': 'CHF', 'SE': 'SEK',
    'NO': 'NOK', 'DK': 'DKK', 'PL': 'PLN', 'CZ': 'CZK', 'HU': 'HUF', 'RO': 'RON',
    'NZ': 'NZD', 'MX': 'MXN', 'BR': 'BRL', 'AR': 'ARS', 'CL': 'CLP', 'CO': 'COP',
    'ZA': 'ZAR', 'AE': 'AED', 'SA': 'SAR', 'KW': 'KWD', 'QA': 'QAR', 'BH': 'BHD',
    'IL': 'ILS', 'TR': 'TRY', 'RU': 'RUB', 'UA': 'UAH', 'PH': 'PHP', 'TH': 'THB',
    'MY': 'MYR', 'ID': 'IDR', 'VN': 'VND', 'KR': 'KRW', 'TW': 'TWD', 'BD': 'BDT',
    'PK': 'PKR', 'LK': 'LKR', 'EG': 'EGP', 'NG': 'NGN', 'KE': 'KES', 'GH': 'GHS',
    'MA': 'MAD', 'TN': 'TND', 'JO': 'JOD', 'OM': 'OMR', 'LB': 'LBP', 'IS': 'ISK',
    'BG': 'BGN', 'HR': 'HRK', 'RS': 'RSD', 'BA': 'BAM', 'MK': 'MKD', 'AL': 'ALL',
    'GE': 'GEL', 'AZ': 'AZN', 'KZ': 'KZT', 'UZ': 'UZS', 'AM': 'AMD', 'BY': 'BYN',
    'MD': 'MDL', 'CY': 'EUR', 'MT': 'EUR', 'LU': 'EUR', 'BE': 'EUR', 'NL': 'EUR',
    'FR': 'EUR', 'DE': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'PT': 'EUR', 'GR': 'EUR',
    'AT': 'EUR', 'IE': 'EUR', 'FI': 'EUR', 'EE': 'EUR', 'LV': 'EUR', 'LT': 'EUR',
    'SI': 'EUR', 'SK': 'EUR', 'PE': 'PEN', 'UY': 'UYU', 'PY': 'PYG', 'BO': 'BOB',
    'EC': 'USD', 'VE': 'VES', 'CR': 'CRC', 'PA': 'PAB', 'GT': 'GTQ', 'HN': 'HNL',
    'NI': 'NIO', 'SV': 'USD', 'DO': 'DOP', 'JM': 'JMD', 'TT': 'TTD', 'BB': 'BBD',
    'BS': 'BSD', 'BZ': 'BZD', 'GY': 'GYD', 'SR': 'SRD', 'FJ': 'FJD', 'PG': 'PGK',
    'NC': 'XPF', 'PF': 'XPF', 'WS': 'WST', 'TO': 'TOP', 'VU': 'VUV', 'SB': 'SBD',
    'MN': 'MNT', 'LA': 'LAK', 'KH': 'KHR', 'MM': 'MMK', 'NP': 'NPR', 'BT': 'BTN',
    'MV': 'MVR', 'AF': 'AFN', 'IQ': 'IQD', 'SY': 'SYP', 'YE': 'YER', 'LY': 'LYD',
    'SD': 'SDG', 'ET': 'ETB', 'SO': 'SOS', 'DJ': 'DJF', 'ER': 'ERN', 'TZ': 'TZS',
    'UG': 'UGX', 'RW': 'RWF', 'BI': 'BIF', 'MZ': 'MZN', 'ZM': 'ZMW', 'ZW': 'ZWL',
    'BW': 'BWP', 'NA': 'NAD', 'SZ': 'SZL', 'LS': 'LSL', 'MG': 'MGA', 'MU': 'MUR',
    'SC': 'SCR', 'KM': 'KMF', 'AO': 'AOA', 'CD': 'CDF', 'CG': 'XAF', 'CM': 'XAF',
    'CF': 'XAF', 'TD': 'XAF', 'GQ': 'XAF', 'GA': 'XAF', 'GN': 'GNF', 'GW': 'XOF',
    'CI': 'XOF', 'BF': 'XOF', 'ML': 'XOF', 'NE': 'XOF', 'SN': 'XOF', 'TG': 'XOF',
    'BJ': 'XOF', 'MR': 'MRU', 'GM': 'GMD', 'SL': 'SLL', 'LR': 'LRD', 'CV': 'CVE',
    'ST': 'STN', 'MO': 'MOP', 'BN': 'BND', 'TL': 'USD', 'KP': 'KPW'
};

// Get all countries with ISO codes
export const getAllCountries = () => {
    return COUNTRIES;
};

// Get country by code
export const getCountryByCode = (code) => {
    return COUNTRIES.find(c => c.code === code);
};

// Get currency for country code
export const getCurrencyForCountry = (countryCode) => {
    return countryCurrencyMap[countryCode] || 'USD';
};

// Get country name by code
export const getCountryName = (code) => {
    const country = countries.find(c => c.alpha2 === code || c.alpha3 === code);
    return country ? country.name : code;
};

// Timezone mappings for countries
export const countryTimezoneMap = {
    'US': 'America/New_York',
    'GB': 'Europe/London',
    'DE': 'Europe/Berlin',
    'FR': 'Europe/Paris',
    'JP': 'Asia/Tokyo',
    'CN': 'Asia/Shanghai',
    'IN': 'Asia/Kolkata',
    'AU': 'Australia/Sydney',
    'SG': 'Asia/Singapore',
    'HK': 'Asia/Hong_Kong',
    'CA': 'America/Toronto',
    'BR': 'America/Sao_Paulo',
    'MX': 'America/Mexico_City',
    'AR': 'America/Argentina/Buenos_Aires',
    'ZA': 'Africa/Johannesburg',
    'AE': 'Asia/Dubai',
    'CH': 'Europe/Zurich',
    'SE': 'Europe/Stockholm',
    'NO': 'Europe/Oslo',
    'DK': 'Europe/Copenhagen',
    'NL': 'Europe/Amsterdam',
    'ES': 'Europe/Madrid',
    'IT': 'Europe/Rome',
    'RU': 'Europe/Moscow',
    'TR': 'Europe/Istanbul',
    'TH': 'Asia/Bangkok',
    'MY': 'Asia/Kuala_Lumpur',
    'ID': 'Asia/Jakarta',
    'PH': 'Asia/Manila',
    'KR': 'Asia/Seoul',
    'TW': 'Asia/Taipei',
    'VN': 'Asia/Ho_Chi_Minh',
    'NZ': 'Pacific/Auckland',
    'PL': 'Europe/Warsaw',
    'CZ': 'Europe/Prague',
    'AT': 'Europe/Vienna',
    'BE': 'Europe/Brussels',
    'IE': 'Europe/Dublin',
    'PT': 'Europe/Lisbon',
    'GR': 'Europe/Athens',
    'FI': 'Europe/Helsinki',
    'EG': 'Africa/Cairo',
    'IL': 'Asia/Jerusalem',
    'SA': 'Asia/Riyadh'
};

export const getTimezoneForCountry = (countryCode) => {
    return countryTimezoneMap[countryCode] || 'UTC';
};