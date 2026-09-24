import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Global Tax Calculation Engine
 * Real-time VAT/GST/Sales Tax calculation for 150+ countries
 * Handles cross-border transactions, digital services, B2B/B2C scenarios
 */

const TAX_RULES = {
    // European Union (27 members) - VAT with reverse charge
    'AT': { type: 'VAT', standard: 20, reduced: [10, 13], digital_services: 20, physical_goods: 20, reverse_charge_b2b: true, tourism_tax: 3.2, exemptions: ['financial', 'insurance', 'gambling'], sez: ['Vienna International Centre'] },
    'BE': { type: 'VAT', standard: 21, reduced: [6, 12], digital_services: 21, physical_goods: 21, reverse_charge_b2b: true, exemptions: ['postal', 'medical'], sez: ['Port of Antwerp FTZ'] },
    'BG': { type: 'VAT', standard: 20, reduced: [9], digital_services: 20, physical_goods: 20, reverse_charge_b2b: true, exemptions: ['medical', 'education'], tourism_tax: 1.5 },
    'CY': { type: 'VAT', standard: 19, reduced: [5, 9], digital_services: 19, physical_goods: 19, reverse_charge_b2b: true, exemptions: ['shipping', 'aviation'] },
    'CZ': { type: 'VAT', standard: 21, reduced: [12, 15], digital_services: 21, physical_goods: 21, reverse_charge_b2b: true, exemptions: ['medical', 'books'] },
    'DE': { type: 'VAT', standard: 19, reduced: [7], digital_services: 19, physical_goods: 19, reverse_charge_b2b: true, exemptions: ['medical', 'financial'], sez: ['Hamburg Free Port', 'Bremerhaven FTZ'] },
    'DK': { type: 'VAT', standard: 25, reduced: [], digital_services: 25, physical_goods: 25, reverse_charge_b2b: true, exemptions: ['press', 'transport'] },
    'EE': { type: 'VAT', standard: 22, reduced: [9], digital_services: 22, physical_goods: 22, reverse_charge_b2b: true, exemptions: ['medical'] },
    'ES': { type: 'VAT', standard: 21, reduced: [10, 4], digital_services: 21, physical_goods: 21, reverse_charge_b2b: true, tourism_tax: 2.5, exemptions: ['medical', 'education'], sez: ['Canary Islands (7%)', 'Ceuta (0.5%)', 'Melilla (0.5%)'] },
    'FI': { type: 'VAT', standard: 25.5, reduced: [14, 10], digital_services: 25.5, physical_goods: 25.5, reverse_charge_b2b: true, exemptions: ['books', 'transport'], sez: ['Åland Islands'] },
    'FR': { type: 'VAT', standard: 20, reduced: [10, 5.5, 2.1], digital_services: 20, physical_goods: 20, reverse_charge_b2b: true, tourism_tax: 4.5, exemptions: ['medical', 'press'], sez: ['Corsica (13%)', 'French Overseas'] },
    'GR': { type: 'VAT', standard: 24, reduced: [13, 6], digital_services: 24, physical_goods: 24, reverse_charge_b2b: true, tourism_tax: 5, exemptions: ['shipping', 'medical'], sez: ['Dodecanese (17%)', 'Aegean Islands (17%)'] },
    'HR': { type: 'VAT', standard: 25, reduced: [13, 5], digital_services: 25, physical_goods: 25, reverse_charge_b2b: true, tourism_tax: 2, exemptions: ['medical'] },
    'HU': { type: 'VAT', standard: 27, reduced: [18, 5], digital_services: 27, physical_goods: 27, reverse_charge_b2b: true, exemptions: ['medical', 'books'] },
    'IE': { type: 'VAT', standard: 23, reduced: [13.5, 9, 4.8], digital_services: 23, physical_goods: 23, reverse_charge_b2b: true, exemptions: ['food', 'medical'], sez: ['Shannon Free Zone'] },
    'IT': { type: 'VAT', standard: 22, reduced: [10, 5, 4], digital_services: 22, physical_goods: 22, reverse_charge_b2b: true, tourism_tax: 3, exemptions: ['medical', 'banking'], sez: ['Livigno (0%)', 'Campione d\'Italia (0%)'] },
    'LT': { type: 'VAT', standard: 21, reduced: [9, 5], digital_services: 21, physical_goods: 21, reverse_charge_b2b: true, exemptions: ['medical'] },
    'LU': { type: 'VAT', standard: 17, reduced: [14, 8, 3], digital_services: 17, physical_goods: 17, reverse_charge_b2b: true, exemptions: ['financial', 'insurance'] },
    'LV': { type: 'VAT', standard: 21, reduced: [12, 5], digital_services: 21, physical_goods: 21, reverse_charge_b2b: true, exemptions: ['medical'] },
    'MT': { type: 'VAT', standard: 18, reduced: [7, 5], digital_services: 18, physical_goods: 18, reverse_charge_b2b: true, exemptions: ['aviation', 'shipping'] },
    'NL': { type: 'VAT', standard: 21, reduced: [9], digital_services: 21, physical_goods: 21, reverse_charge_b2b: true, tourism_tax: 7, exemptions: ['medical', 'education'] },
    'PL': { type: 'VAT', standard: 23, reduced: [8, 5], digital_services: 23, physical_goods: 23, reverse_charge_b2b: true, exemptions: ['medical', 'books'], sez: ['Kostrzyn-Słubice SEZ'] },
    'PT': { type: 'VAT', standard: 23, reduced: [13, 6], digital_services: 23, physical_goods: 23, reverse_charge_b2b: true, tourism_tax: 2, exemptions: ['medical'], sez: ['Madeira (22%)', 'Azores (18%)'] },
    'RO': { type: 'VAT', standard: 19, reduced: [9, 5], digital_services: 19, physical_goods: 19, reverse_charge_b2b: true, exemptions: ['medical', 'books'] },
    'SE': { type: 'VAT', standard: 25, reduced: [12, 6], digital_services: 25, physical_goods: 25, reverse_charge_b2b: true, exemptions: ['press', 'medical'] },
    'SI': { type: 'VAT', standard: 22, reduced: [9.5], digital_services: 22, physical_goods: 22, reverse_charge_b2b: true, exemptions: ['medical'] },
    'SK': { type: 'VAT', standard: 20, reduced: [10], digital_services: 20, physical_goods: 20, reverse_charge_b2b: true, exemptions: ['medical'] },
    
    // Other Europe
    'GB': { type: 'VAT', standard: 20, reduced: [5], zero: ['exports', 'books', 'food', 'children_clothing'], digital_services: 20, physical_goods: 20, reverse_charge_b2b: true, exemptions: ['financial', 'education', 'health'] },
    'NO': { type: 'VAT', standard: 25, reduced: [15, 12], digital_services: 25, physical_goods: 25, exemptions: ['books', 'newspapers'], sez: ['Svalbard (0%)'] },
    'CH': { type: 'VAT', standard: 8.1, reduced: [3.8, 2.6], digital_services: 8.1, physical_goods: 8.1, exemptions: ['medical', 'education'] },
    'IS': { type: 'VAT', standard: 24, reduced: [11], digital_services: 24, physical_goods: 24, exemptions: ['exports'] },
    'LI': { type: 'VAT', standard: 8.1, reduced: [3.8, 2.6], digital_services: 8.1, physical_goods: 8.1 },
    'AL': { type: 'VAT', standard: 20, reduced: [6], digital_services: 20, physical_goods: 20 },
    'AD': { type: 'IGI', standard: 4.5, reduced: [1, 2.5], digital_services: 4.5, physical_goods: 4.5 },
    'BA': { type: 'VAT', standard: 17, reduced: [], digital_services: 17, physical_goods: 17 },
    'BY': { type: 'VAT', standard: 20, reduced: [10], digital_services: 20, physical_goods: 20, sez: ['Great Stone (0%)', 'Brest FEZ (0%)'] },
    'MC': { type: 'VAT', standard: 20, reduced: [10, 5.5], digital_services: 20, physical_goods: 20 },
    'MD': { type: 'VAT', standard: 20, reduced: [12, 8], digital_services: 20, physical_goods: 20 },
    'ME': { type: 'VAT', standard: 21, reduced: [7], digital_services: 21, physical_goods: 21 },
    'MK': { type: 'VAT', standard: 18, reduced: [5], digital_services: 18, physical_goods: 18, sez: ['Technological-Industrial Development Zones (0%)'] },
    'RS': { type: 'VAT', standard: 20, reduced: [10], digital_services: 20, physical_goods: 20, sez: ['Free Zones (0%)'] },
    'RU': { type: 'VAT', standard: 20, reduced: [10], digital_services: 20, physical_goods: 20, sez: ['Skolkovo (0%)', 'Vladivostok FPT (0%)'], exemptions: ['medical', 'education'] },
    'SM': { type: 'VAT', standard: 17, reduced: [], digital_services: 17, physical_goods: 17 },
    'TR': { type: 'VAT', standard: 20, reduced: [10, 1, 8], digital_services: 20, physical_goods: 20, tourism_tax: 2, sez: ['Free Trade Zones (0%)'], exemptions: ['exports', 'medical'] },
    'UA': { type: 'VAT', standard: 20, reduced: [7], digital_services: 20, physical_goods: 20, sez: ['Special Economic Zones (0%)'] },
    'VA': { type: 'VAT', standard: 0, reduced: [], digital_services: 0, physical_goods: 0 },
    'XK': { type: 'VAT', standard: 18, reduced: [8], digital_services: 18, physical_goods: 18 },
    
    // Middle East & North Africa
    'SA': { type: 'VAT', standard: 15, reduced: [], zero: ['exports', 'health', 'education', 'real_estate'], digital_services: 15, physical_goods: 15, sez: ['KAEC (0%)', 'NEOM (0%)'], tourism_tax: 0 },
    'AE': { type: 'VAT', standard: 5, reduced: [], zero: ['exports', 'health', 'education'], digital_services: 5, physical_goods: 5, tourism_tax: 10, sez: ['Free Zones (0%)', 'DIFC (0%)', 'ADGM (0%)'], exemptions: ['residential_property'] },
    'BH': { type: 'VAT', standard: 10, reduced: [], zero: ['exports', 'oil_gas'], digital_services: 10, physical_goods: 10, sez: ['Bahrain Investment Wharf (0%)'] },
    'KW': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0, planned: true },
    'OM': { type: 'VAT', standard: 5, reduced: [], zero: ['exports', 'health', 'education'], digital_services: 5, physical_goods: 5, sez: ['Duqm SEZ (5%)'] },
    'QA': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0, tourism_tax: 10, planned: true },
    'IL': { type: 'VAT', standard: 17, reduced: [], zero: ['exports'], digital_services: 17, physical_goods: 17, exemptions: ['financial', 'insurance'] },
    'JO': { type: 'VAT', standard: 16, reduced: [5], zero: ['exports'], digital_services: 16, physical_goods: 16, sez: ['Aqaba SEZ (0%)'] },
    'LB': { type: 'VAT', standard: 11, reduced: [], zero: ['exports'], digital_services: 11, physical_goods: 11 },
    'IQ': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'SY': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'YE': { type: 'Sales Tax', standard: 5, reduced: [], zero: ['exports'], digital_services: 5, physical_goods: 5 },
    'EG': { type: 'VAT', standard: 14, reduced: [5], zero: ['exports', 'food'], digital_services: 14, physical_goods: 14, tourism_tax: 1, sez: ['Suez Canal Economic Zone (0%)'], exemptions: ['medical'] },
    'DZ': { type: 'VAT', standard: 19, reduced: [9], zero: ['exports'], digital_services: 19, physical_goods: 19 },
    'MA': { type: 'VAT', standard: 20, reduced: [14, 10, 7], zero: ['exports'], digital_services: 20, physical_goods: 20, sez: ['Tanger Free Zone (0%)'] },
    'TN': { type: 'VAT', standard: 19, reduced: [13, 7], zero: ['exports'], digital_services: 19, physical_goods: 19 },
    'LY': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'SD': { type: 'VAT', standard: 17, reduced: [], zero: ['exports'], digital_services: 17, physical_goods: 17 },
    
    // Sub-Saharan Africa
    'ZA': { type: 'VAT', standard: 15, reduced: [], zero: ['exports', 'food', '19_essential_foods'], digital_services: 15, physical_goods: 15, exemptions: ['financial', 'public_transport'], sez: ['IDZ (0%)'] },
    'KE': { type: 'VAT', standard: 16, reduced: [], zero: ['exports', 'agriculture'], digital_services: 16, physical_goods: 16, sez: ['EPZ (0%)', 'SEZ (0%)'], tourism_tax: 2 },
    'NG': { type: 'VAT', standard: 7.5, reduced: [], zero: ['exports', 'medical', 'education'], digital_services: 7.5, physical_goods: 7.5, sez: ['Free Trade Zones (0%)'] },
    'GH': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15, exemptions: ['financial', 'residential_rent'] },
    'ET': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15, sez: ['Industrial Parks (0%)'] },
    'TZ': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18, sez: ['EPZ (0%)'], tourism_tax: 1.5 },
    'UG': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18, exemptions: ['agriculture', 'medical'] },
    'RW': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18, sez: ['Kigali SEZ (0%)'] },
    'SN': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18 },
    'CI': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18 },
    'CM': { type: 'VAT', standard: 19.25, reduced: [], zero: ['exports'], digital_services: 19.25, physical_goods: 19.25 },
    'AO': { type: 'VAT', standard: 14, reduced: [], zero: ['exports'], digital_services: 14, physical_goods: 14 },
    'ZW': { type: 'VAT', standard: 14.5, reduced: [], zero: ['exports'], digital_services: 14.5, physical_goods: 14.5 },
    'MW': { type: 'VAT', standard: 16.5, reduced: [], zero: ['exports'], digital_services: 16.5, physical_goods: 16.5 },
    'ZM': { type: 'VAT', standard: 16, reduced: [], zero: ['exports'], digital_services: 16, physical_goods: 16 },
    'MZ': { type: 'VAT', standard: 17, reduced: [], zero: ['exports'], digital_services: 17, physical_goods: 17 },
    'BW': { type: 'VAT', standard: 14, reduced: [], zero: ['exports'], digital_services: 14, physical_goods: 14 },
    'NA': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    'MU': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15, sez: ['Freeport (0%)'] },
    'SC': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15, tourism_tax: 7 },
    
    // Asia - South Asia
    'IN': { type: 'GST', central: 9, state: 9, integrated: 18, standard: 18, reduced: [5, 12, 28], zero: ['exports'], digital_services: 18, physical_goods: 18, sez: ['SEZ (0%)'], exemptions: ['healthcare', 'education'] },
    'PK': { type: 'Sales Tax', standard: 18, reduced: [10, 5], zero: ['exports'], digital_services: 18, physical_goods: 18, sez: ['Export Processing Zones (0%)'] },
    'BD': { type: 'VAT', standard: 15, reduced: [10, 7.5, 5], zero: ['exports'], digital_services: 15, physical_goods: 15, sez: ['EPZ (0%)'] },
    'LK': { type: 'VAT', standard: 15, reduced: [8], zero: ['exports'], digital_services: 15, physical_goods: 15, sez: ['BOI Zones (0%)'] },
    'NP': { type: 'VAT', standard: 13, reduced: [], zero: ['exports'], digital_services: 13, physical_goods: 13 },
    'AF': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'MV': { type: 'GST', standard: 8, reduced: [], zero: ['exports'], digital_services: 8, physical_goods: 8, tourism_tax: 16 },
    'BT': { type: 'Sales Tax', standard: 7, reduced: [], zero: ['exports'], digital_services: 7, physical_goods: 7 },
    
    // Asia - Southeast Asia
    'SG': { type: 'GST', standard: 9, reduced: [], zero: ['exports', 'financial', 'residential_property'], digital_services: 9, physical_goods: 9, sez: ['Free Trade Zones (0%)'], exemptions: ['investment_precious_metals'] },
    'MY': { type: 'SST', sales_tax: 10, service_tax: 6, standard: 8, reduced: [], zero: ['exports'], digital_services: 6, physical_goods: 10, sez: ['Free Zones (0%)', 'Labuan (0%)'], exemptions: ['essential_goods'] },
    'TH': { type: 'VAT', standard: 7, reduced: [], zero: ['exports'], digital_services: 7, physical_goods: 7, sez: ['Free Zones (0%)'], exemptions: ['medical', 'education'] },
    'ID': { type: 'VAT', standard: 11, reduced: [], zero: ['exports'], digital_services: 11, physical_goods: 11, sez: ['Free Trade Zones (0%)'], exemptions: ['food', 'medical'], tourism_tax: 10 },
    'PH': { type: 'VAT', standard: 12, reduced: [], zero: ['exports'], digital_services: 12, physical_goods: 12, sez: ['PEZA Zones (0%)'], exemptions: ['cooperatives'] },
    'VN': { type: 'VAT', standard: 10, reduced: [5], zero: ['exports'], digital_services: 10, physical_goods: 10, sez: ['Export Processing Zones (0%)'], exemptions: ['agriculture'] },
    'MM': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'KH': { type: 'VAT', standard: 10, reduced: [], zero: ['exports'], digital_services: 10, physical_goods: 10, sez: ['SEZ (0%)'] },
    'LA': { type: 'VAT', standard: 10, reduced: [], zero: ['exports'], digital_services: 10, physical_goods: 10, sez: ['SEZ (0%)'] },
    'BN': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'TL': { type: 'Sales Tax', standard: 2.5, reduced: [], zero: ['exports'], digital_services: 2.5, physical_goods: 2.5 },
    
    // Asia - East Asia
    'CN': { type: 'VAT', standard: 13, reduced: [9, 6], zero: ['exports'], digital_services: 6, physical_goods: 13, sez: ['Hainan FTZ (0%)', 'SEZs (reduced)'], exemptions: ['agriculture'] },
    'JP': { type: 'JCT', standard: 10, reduced: [8], zero: ['exports'], digital_services: 10, physical_goods: 10, exemptions: ['medical', 'education', 'residential_rent'] },
    'KR': { type: 'VAT', standard: 10, reduced: [], zero: ['exports'], digital_services: 10, physical_goods: 10, sez: ['Free Trade Zones (0%)'], exemptions: ['unprocessed_food', 'medical'] },
    'TW': { type: 'VAT', standard: 5, reduced: [], zero: ['exports'], digital_services: 5, physical_goods: 5, sez: ['Export Processing Zones (0%)'] },
    'HK': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'MO': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'MN': { type: 'VAT', standard: 10, reduced: [], zero: ['exports'], digital_services: 10, physical_goods: 10 },
    'KP': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    
    // Asia - Central Asia
    'KZ': { type: 'VAT', standard: 12, reduced: [], zero: ['exports'], digital_services: 12, physical_goods: 12, sez: ['AIFC (0%)', 'SEZs (0%)'] },
    'UZ': { type: 'VAT', standard: 12, reduced: [], zero: ['exports'], digital_services: 12, physical_goods: 12, sez: ['Free Economic Zones (0%)'] },
    'TM': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    'KG': { type: 'VAT', standard: 12, reduced: [], zero: ['exports'], digital_services: 12, physical_goods: 12 },
    'TJ': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18 },
    'AM': { type: 'VAT', standard: 20, reduced: [], zero: ['exports'], digital_services: 20, physical_goods: 20, sez: ['Free Economic Zones (0%)'] },
    'AZ': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18, sez: ['Alat Free Zone (0%)'] },
    'GE': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18, sez: ['Free Industrial Zones (0%)'] },
    
    // Oceania
    'AU': { type: 'GST', standard: 10, reduced: [], zero: ['exports', 'health', 'education', 'food', 'water'], digital_services: 10, physical_goods: 10, exemptions: ['residential_rent', 'financial'] },
    'NZ': { type: 'GST', standard: 15, reduced: [], zero: ['exports', 'financial'], digital_services: 15, physical_goods: 15 },
    'PG': { type: 'VAT', standard: 10, reduced: [], zero: ['exports'], digital_services: 10, physical_goods: 10 },
    'FJ': { type: 'VAT', standard: 15, reduced: [9], zero: ['exports'], digital_services: 15, physical_goods: 15, tourism_tax: 5 },
    'NC': { type: 'TGC', standard: 11, reduced: [3], zero: ['exports'], digital_services: 11, physical_goods: 11 },
    'PF': { type: 'TVA', standard: 16, reduced: [5], zero: ['exports'], digital_services: 16, physical_goods: 16 },
    'WS': { type: 'VAGST', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    'TO': { type: 'CT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    'VU': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    
    // Americas - North America
    'US': { type: 'Sales Tax', state_dependent: true, avg: 7.12, standard: 7.12, digital_services: 'varies', physical_goods: 'varies', sez: ['Foreign Trade Zones (0%)'], note: 'State and local levels' },
    'CA': { type: 'GST/HST', federal: 5, provincial: 'varies', harmonized: [13, 15], standard: 5, reduced: [], zero: ['exports', 'food', 'prescription_drugs'], digital_services: 5, physical_goods: 5 },
    'MX': { type: 'IVA', standard: 16, reduced: [8], zero: ['exports', 'food', 'medicine'], digital_services: 16, physical_goods: 16, sez: ['Maquiladoras (0%)', 'Border regions (8%)'], tourism_tax: 5 },
    
    // Americas - Central America & Caribbean
    'GT': { type: 'IVA', standard: 12, reduced: [], zero: ['exports'], digital_services: 12, physical_goods: 12, sez: ['Free Zones (0%)'] },
    'HN': { type: 'ISV', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15, sez: ['Free Zones (0%)'] },
    'SV': { type: 'IVA', standard: 13, reduced: [], zero: ['exports'], digital_services: 13, physical_goods: 13 },
    'NI': { type: 'IVA', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15, sez: ['Free Zones (0%)'] },
    'CR': { type: 'IVA', standard: 13, reduced: [4, 2, 1], zero: ['exports'], digital_services: 13, physical_goods: 13, sez: ['Free Trade Zones (0%)'] },
    'PA': { type: 'ITBMS', standard: 7, reduced: [], zero: ['exports'], digital_services: 7, physical_goods: 7, sez: ['Colon Free Zone (0%)'], tourism_tax: 10 },
    'BZ': { type: 'GST', standard: 12.5, reduced: [], zero: ['exports'], digital_services: 12.5, physical_goods: 12.5 },
    'JM': { type: 'GCT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15, sez: ['Free Zones (0%)'] },
    'TT': { type: 'VAT', standard: 12.5, reduced: [], zero: ['exports'], digital_services: 12.5, physical_goods: 12.5 },
    'BB': { type: 'VAT', standard: 17.5, reduced: [7.5], zero: ['exports'], digital_services: 17.5, physical_goods: 17.5 },
    'BS': { type: 'VAT', standard: 12, reduced: [], zero: ['exports'], digital_services: 12, physical_goods: 12 },
    'DO': { type: 'ITBIS', standard: 18, reduced: [16], zero: ['exports'], digital_services: 18, physical_goods: 18, sez: ['Free Zones (0%)'] },
    'CU': { type: 'Sales Tax', standard: 10, reduced: [], zero: ['exports'], digital_services: 10, physical_goods: 10, sez: ['Mariel SEZ (0%)'] },
    'HT': { type: 'No VAT', standard: 10, reduced: [], zero: ['exports'], digital_services: 10, physical_goods: 10 },
    
    // Americas - South America
    'BR': { type: 'ICMS/ISS', state: 'varies', avg: 18, standard: 18, reduced: [7, 12], zero: ['exports'], digital_services: 'varies', physical_goods: 'varies', sez: ['Manaus Free Zone (0%)'], exemptions: ['exports', 'books'] },
    'AR': { type: 'IVA', standard: 21, reduced: [10.5, 27], zero: ['exports'], digital_services: 21, physical_goods: 21, exemptions: ['books', 'medical'] },
    'CL': { type: 'IVA', standard: 19, reduced: [], zero: ['exports'], digital_services: 19, physical_goods: 19, sez: ['Punta Arenas Free Zone (0%)'], exemptions: ['education', 'health'] },
    'CO': { type: 'IVA', standard: 19, reduced: [5], zero: ['exports', 'food'], digital_services: 19, physical_goods: 19, sez: ['Free Trade Zones (0%)'], exemptions: ['health', 'education'] },
    'PE': { type: 'IGV', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18, sez: ['CETICOS (0%)'], exemptions: ['financial'] },
    'VE': { type: 'IVA', standard: 16, reduced: [8], zero: ['exports'], digital_services: 16, physical_goods: 16 },
    'EC': { type: 'IVA', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15, sez: ['Galapagos (0%)'] },
    'BO': { type: 'IVA', standard: 13, reduced: [], zero: ['exports'], digital_services: 13, physical_goods: 13 },
    'UY': { type: 'IVA', standard: 22, reduced: [10], zero: ['exports'], digital_services: 22, physical_goods: 22, sez: ['Free Zones (0%)'] },
    'PY': { type: 'IVA', standard: 10, reduced: [5], zero: ['exports'], digital_services: 10, physical_goods: 10 },
    'GY': { type: 'VAT', standard: 14, reduced: [], zero: ['exports'], digital_services: 14, physical_goods: 14 },
    'SR': { type: 'VAT', standard: 10, reduced: [], zero: ['exports'], digital_services: 10, physical_goods: 10 },
    'GF': { type: 'VAT', standard: 8.5, reduced: [2.1], zero: ['exports'], digital_services: 8.5, physical_goods: 8.5 },
    
    // Additional African Countries
    'ML': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18 },
    'BF': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18 },
    'NE': { type: 'VAT', standard: 19, reduced: [], zero: ['exports'], digital_services: 19, physical_goods: 19 },
    'TD': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18 },
    'SO': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'DJ': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'ER': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'SS': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'CF': { type: 'VAT', standard: 19, reduced: [], zero: ['exports'], digital_services: 19, physical_goods: 19 },
    'CG': { type: 'VAT', standard: 18.9, reduced: [], zero: ['exports'], digital_services: 18.9, physical_goods: 18.9 },
    'CD': { type: 'VAT', standard: 16, reduced: [], zero: ['exports'], digital_services: 16, physical_goods: 16 },
    'GA': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18 },
    'GQ': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    'BJ': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18 },
    'TG': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18 },
    'SL': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    'LR': { type: 'GST', standard: 10, reduced: [], zero: ['exports'], digital_services: 10, physical_goods: 10 },
    'GM': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    'GN': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18 },
    'GW': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    'MR': { type: 'VAT', standard: 14, reduced: [], zero: ['exports'], digital_services: 14, physical_goods: 14 },
    'LS': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    'SZ': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    'BI': { type: 'VAT', standard: 18, reduced: [], zero: ['exports'], digital_services: 18, physical_goods: 18 },
    'KM': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'ST': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    'CV': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    
    // Additional Caribbean & Pacific Islands
    'AG': { type: 'ABST', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    'DM': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    'GD': { type: 'VAT', standard: 15, reduced: [], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    'KN': { type: 'VAT', standard: 17, reduced: [], zero: ['exports'], digital_services: 17, physical_goods: 17 },
    'LC': { type: 'VAT', standard: 15, reduced: [8], zero: ['exports'], digital_services: 15, physical_goods: 15 },
    'VC': { type: 'VAT', standard: 16, reduced: [], zero: ['exports'], digital_services: 16, physical_goods: 16 },
    'KI': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'SB': { type: 'VAT', standard: 10, reduced: [], zero: ['exports'], digital_services: 10, physical_goods: 10 },
    'NR': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'TV': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'FM': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'MH': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 },
    'PW': { type: 'No VAT', standard: 0, reduced: [], zero: ['all'], digital_services: 0, physical_goods: 0 }
};

const EU_COUNTRIES = ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];

function isEU(country) {
    return EU_COUNTRIES.includes(country);
}

// Product category tax mappings
const PRODUCT_CATEGORIES = {
    digital_services: { applies_buyer_location: true, often_exempt: false, luxury: false },
    luxury_goods: { threshold: 1000, surcharge: 10, applies_buyer_location: false, often_exempt: false, luxury: true },
    food: { uses_reduced_rate: true, often_exempt: false, luxury: false },
    medicine: { uses_zero_rate: true, often_exempt: true, luxury: false },
    books: { uses_reduced_rate: true, often_exempt: true, luxury: false },
    education: { uses_zero_rate: true, often_exempt: true, luxury: false },
    health_services: { uses_zero_rate: true, often_exempt: true, luxury: false },
    financial_services: { uses_zero_rate: false, often_exempt: true, luxury: false },
    real_estate: { uses_zero_rate: false, often_exempt: true, luxury: false },
    agriculture: { uses_reduced_rate: true, often_exempt: false, luxury: false },
    children_clothing: { uses_zero_rate: true, often_exempt: false, luxury: false },
    newspapers: { uses_reduced_rate: true, often_exempt: false, luxury: false }
};

function calculateTax(params) {
    const {
        seller_country,
        buyer_country,
        amount,
        currency = 'USD',
        product_category,
        buyer_type = 'B2C', // B2B or B2C
        buyer_vat_number = null,
        seller_vat_number = null,
        is_export = false,
        sez_location = null, // Special Economic Zone
        is_luxury = false
    } = params;

    // Validation
    if (!seller_country || !buyer_country || !amount) {
        throw new Error('Missing required parameters: seller_country, buyer_country, amount');
    }

    const sellerRules = TAX_RULES[seller_country];
    const buyerRules = TAX_RULES[buyer_country];

    if (!sellerRules) {
        throw new Error(`Tax rules not found for seller country: ${seller_country}`);
    }

    let taxRate = 0;
    let taxAmount = 0;
    let taxType = sellerRules.type;
    let taxJurisdiction = seller_country;
    let reverseCharge = false;
    let exemptReason = null;
    let luxurySurcharge = 0;
    let placeOfSupply = seller_country;

    // STEP 1: Check for SEZ (Special Economic Zone) - overrides most other rules
    if (sez_location && sellerRules.sez) {
        const sezMatch = sellerRules.sez.find(zone => 
            zone.toLowerCase().includes(sez_location.toLowerCase())
        );
        if (sezMatch) {
            // Extract rate from format "Zone Name (rate%)"
            const rateMatch = sezMatch.match(/\((\d+(?:\.\d+)?)%?\)/);
            if (rateMatch) {
                taxRate = parseFloat(rateMatch[1]);
                exemptReason = `SEZ: ${sezMatch}`;
            }
        }
    }

    // STEP 2: Product category exemptions (if not already handled by SEZ)
    if (!exemptReason && product_category) {
        const categoryConfig = PRODUCT_CATEGORIES[product_category];
        
        // Check for category-specific exemptions
        if (categoryConfig?.often_exempt) {
            if (sellerRules.exemptions?.includes(product_category.replace('_services', '').replace('_', ''))) {
                taxRate = 0;
                exemptReason = `Exempt - ${product_category}`;
            } else if (sellerRules.zero?.includes(product_category.replace('_services', '').replace('_', ''))) {
                taxRate = 0;
                exemptReason = `Zero-rated - ${product_category}`;
            }
        }

        // Check for zero-rated categories
        if (!exemptReason && categoryConfig?.uses_zero_rate) {
            const categoryKey = product_category.replace('_services', '').replace('_', '');
            if (sellerRules.zero?.includes(categoryKey)) {
                taxRate = 0;
                exemptReason = `Zero-rated - ${product_category}`;
            }
        }
    }

    // STEP 3: Cross-border transaction rules (if not already exempt)
    if (!exemptReason) {
        // Scenario 1: Export (zero-rated)
        if (seller_country !== buyer_country && is_export) {
            taxRate = 0;
            exemptReason = 'Export - Zero-rated';
        }
        // Scenario 2: EU Intra-community B2B (reverse charge)
        else if (isEU(seller_country) && isEU(buyer_country) && seller_country !== buyer_country && buyer_type === 'B2B' && buyer_vat_number) {
            taxRate = 0;
            reverseCharge = true;
            placeOfSupply = buyer_country;
            exemptReason = 'EU Intra-community B2B - Reverse charge applies in buyer country';
        }
        // Scenario 3: EU to Non-EU B2C digital services (VAT MOSS rules)
        else if (isEU(seller_country) && !isEU(buyer_country) && buyer_type === 'B2C' && product_category === 'digital_services') {
            // Place of supply = buyer's country
            if (buyerRules) {
                taxRate = buyerRules.digital_services || buyerRules.standard || 0;
                taxJurisdiction = buyer_country;
                placeOfSupply = buyer_country;
                taxType = buyerRules.type;
            } else {
                taxRate = 0;
                exemptReason = 'Non-EU B2C digital services - No tax info for buyer country';
            }
        }
        // Scenario 4: Non-EU to EU B2C digital services (place of supply = buyer)
        else if (!isEU(seller_country) && isEU(buyer_country) && buyer_type === 'B2C' && product_category === 'digital_services') {
            taxRate = buyerRules.digital_services || buyerRules.standard;
            taxJurisdiction = buyer_country;
            placeOfSupply = buyer_country;
            taxType = buyerRules.type;
        }
        // Scenario 5: Cross-border B2B outside EU
        else if (seller_country !== buyer_country && buyer_type === 'B2B' && buyer_vat_number) {
            // Most jurisdictions apply reverse charge for B2B imports
            taxRate = 0;
            reverseCharge = true;
            placeOfSupply = buyer_country;
            exemptReason = 'Cross-border B2B - Reverse charge (buyer liable in their country)';
        }
        // Scenario 6: Cross-border B2C physical goods
        else if (seller_country !== buyer_country && buyer_type === 'B2C' && product_category !== 'digital_services') {
            // For physical goods, generally seller country tax applies (origin principle)
            // Unless amount exceeds distance selling threshold (EU: €10,000)
            taxRate = sellerRules.physical_goods || sellerRules.standard;
            placeOfSupply = seller_country;
        }
        // Scenario 7: Domestic B2B reverse charge (specific categories)
        else if (seller_country === buyer_country && buyer_type === 'B2B' && sellerRules.reverse_charge_b2b && buyer_vat_number) {
            // Categories that trigger domestic reverse charge
            const reverseChargeCategories = ['construction', 'scrap', 'emissions', 'gas_electricity', 'mobile_phones', 'integrated_circuits'];
            if (reverseChargeCategories.includes(product_category)) {
                taxRate = 0;
                reverseCharge = true;
                exemptReason = `Domestic reverse charge - ${product_category}`;
            } else {
                taxRate = sellerRules.standard;
            }
        }
        // Scenario 8: Standard domestic transaction
        else if (seller_country === buyer_country) {
            taxRate = determineDomesticRate(sellerRules, product_category, amount);
            placeOfSupply = seller_country;
        }
        // Fallback: apply seller country standard rate
        else {
            taxRate = sellerRules.standard;
        }
    }

    // STEP 4: Apply luxury goods surcharge (if applicable)
    if (is_luxury || (PRODUCT_CATEGORIES[product_category]?.luxury && amount >= (PRODUCT_CATEGORIES.luxury_goods?.threshold || 1000))) {
        luxurySurcharge = (amount * (PRODUCT_CATEGORIES.luxury_goods?.surcharge || 10)) / 100;
    }

    taxAmount = (amount * taxRate) / 100 + luxurySurcharge;

    return {
        taxRate,
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        luxurySurcharge: parseFloat(luxurySurcharge.toFixed(2)),
        taxType,
        taxJurisdiction,
        placeOfSupply,
        subtotal: parseFloat(amount.toFixed(2)),
        total: parseFloat((amount + taxAmount).toFixed(2)),
        currency,
        reverseCharge,
        exemptReason,
        breakdown: {
            seller_country,
            buyer_country,
            buyer_type,
            product_category,
            sez_location,
            is_luxury,
            applicable_rule: exemptReason || `${taxType} ${taxRate}%`,
            place_of_supply_rule: placeOfSupply === buyer_country ? 'Destination principle' : 'Origin principle'
        }
    };
}

/**
 * Determine domestic tax rate based on product category
 */
function determineDomesticRate(rules, category, amount) {
    const categoryConfig = PRODUCT_CATEGORIES[category];
    
    // Zero-rated categories
    if (categoryConfig?.uses_zero_rate && rules.zero) {
        const categoryKey = category.replace('_services', '').replace('_', '');
        if (rules.zero.includes(categoryKey)) {
            return 0;
        }
    }
    
    // Reduced rate categories
    if (categoryConfig?.uses_reduced_rate && rules.reduced && rules.reduced.length > 0) {
        // Use lowest reduced rate for essential goods
        if (['food', 'medicine', 'books', 'newspapers'].includes(category)) {
            return Math.min(...rules.reduced);
        }
        return rules.reduced[0];
    }
    
    // Category-specific rates
    if (category === 'digital_services' && rules.digital_services) {
        return rules.digital_services;
    }
    if (category !== 'digital_services' && rules.physical_goods) {
        return rules.physical_goods;
    }
    
    // Default to standard rate
    return rules.standard;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const params = await req.json();

        const result = calculateTax(params);

        return Response.json({
            success: true,
            calculation: result
        });

    } catch (error) {
        console.error('Tax calculation error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 400 });
    }
});