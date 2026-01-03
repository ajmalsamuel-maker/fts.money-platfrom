# FTS.Money Multilingual System - Implementation Guide

## 📋 Overview

Enterprise-grade internationalization (i18n) system for the FTS.Money platform, supporting 25+ languages across all portals and services.

## 🌍 Standards & Compliance

- **ISO 639-1**: Two-letter language codes (en, es, fr, etc.)
- **ISO 639-2**: Three-letter codes for extended language support
- **BCP 47**: Language tag specification
- **Unicode CLDR**: Locale data for formatting
- **ISO 3166-1**: Country codes for regional variations
- **Financial Services Compliance**: EU, APAC, MENA regional requirements

## 🎯 Supported Languages

### Tier 1 (Global Financial Hubs)
- English (en) 🇬🇧
- Chinese Simplified (zh) 🇨🇳
- Spanish (es) 🇪🇸
- Arabic (ar) 🇸🇦 [RTL]
- French (fr) 🇫🇷

### Tier 2 (Major Markets)
- German (de), Japanese (ja), Portuguese (pt), Russian (ru), Italian (it), Korean (ko)

### Tier 3 (Regional Markets)
- Dutch, Polish, Turkish, Hindi, Indonesian, Thai, Vietnamese, Hebrew [RTL], Swedish, Norwegian, Danish, Finnish

## 🏗️ Architecture

### Multi-Tenant Structure
```
components/i18n/
├── GlobalLanguageStandard.js      # Core language standards & utilities
├── EnhancedLanguageProvider.js    # React Context provider
├── LanguageSwitcher.js             # UI component
├── translations/
│   ├── common/                     # Shared translations
│   │   ├── en.json
│   │   ├── es.json
│   │   └── ...
│   ├── platform/                   # Platform control panel
│   ├── merchant/                   # Merchant portal
│   ├── crypto/                     # Crypto gateway
│   ├── iso/                        # ISO gateway
│   ├── orchestration/              # Orchestration portal
│   ├── rwa/                        # RWA platform
│   └── tenants/                    # PSP-specific overrides
│       └── {psp_code}/
│           └── en.json
```

### Translation Namespaces
- `common` - Shared UI elements (buttons, labels, etc.)
- `platform` - Platform control panel
- `psp` - PSP portal
- `merchant` - Merchant portal
- `crypto` - Crypto gateway
- `iso` - ISO gateway
- `orchestration` - Orchestration
- `rwa` - RWA platform
- `compliance` - Legal & compliance terms
- `financial` - Financial terminology
- `technical` - Technical/API documentation

## 🚀 Implementation

### 1. Wrap App with Provider

```jsx
import { EnhancedLanguageProvider } from '@/components/i18n/EnhancedLanguageProvider';

function App() {
  return (
    <EnhancedLanguageProvider 
      tenantType="merchant" 
      tenantCode="PSP001"
    >
      {/* Your app */}
    </EnhancedLanguageProvider>
  );
}
```

### 2. Use Translations in Components

```jsx
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

function MyComponent() {
  const { t, language, formatCurrency, rtl } = useI18n();

  return (
    <div dir={rtl ? 'rtl' : 'ltr'}>
      <h1>{t('common:dashboard')}</h1>
      <p>{t('merchant.transactions.total', { 
        variables: { count: 150 } 
      })}</p>
      <span>{formatCurrency(1500, 'USD')}</span>
    </div>
  );
}
```

### 3. Namespace-Specific Hook

```jsx
import { useTranslation } from '@/components/i18n/EnhancedLanguageProvider';

function MerchantDashboard() {
  const { t } = useTranslation('merchant');
  
  return <h1>{t('dashboard.title')}</h1>;
}
```

### 4. Add Language Switcher

```jsx
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

// In your header/settings
<LanguageSwitcher variant="select" showLabel={true} />
```

## 📝 Translation File Format

### Standard Format
```json
{
  "dashboard": {
    "title": "Dashboard",
    "stats": {
      "total_volume": "Total Volume",
      "transactions": "Transactions"
    }
  },
  "buttons": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "messages": {
    "welcome": "Welcome, {{name}}!",
    "transactions_count": {
      "zero": "No transactions",
      "one": "1 transaction",
      "other": "{{count}} transactions"
    }
  }
}
```

### Variable Interpolation
```jsx
t('messages.welcome', { variables: { name: 'John' } })
// Output: "Welcome, John!"
```

### Pluralization
```jsx
t('messages.transactions_count', { count: 5 })
// Output: "5 transactions"
```

## 🎨 RTL (Right-to-Left) Support

Automatic RTL layout for Arabic (ar) and Hebrew (he):

```jsx
const { rtl } = useI18n();

<div dir={rtl ? 'rtl' : 'ltr'}>
  {/* Content automatically flips */}
</div>
```

CSS automatically adjusts:
- `margin-left` → `margin-right`
- `text-align: left` → `text-align: right`
- Flexbox direction reverses

## 🔧 Formatting Utilities

### Currency
```jsx
formatCurrency(1500.50, 'USD') 
// en: "$1,500.50"
// de: "1.500,50 $"
// ar: "١٬٥٠٠٫٥٠ US$"
```

### Date/Time
```jsx
formatDateTime(new Date(), { 
  dateStyle: 'full', 
  timeStyle: 'short' 
})
// en: "Friday, January 3, 2026 at 2:30 PM"
// es: "viernes, 3 de enero de 2026, 14:30"
```

### Numbers
```jsx
formatNumber(1234567.89)
// en: "1,234,567.89"
// de: "1.234.567,89"
// ar: "١٬٢٣٤٬٥٦٧٫٨٩"
```

## 🏢 PSP-Specific Overrides

PSPs can override any translation:

1. Create file: `translations/tenants/{psp_code}/en.json`
2. Override specific keys:
```json
{
  "merchant": {
    "branding": {
      "company_name": "Custom PSP Name"
    }
  }
}
```

## ✅ Compliance Requirements

### EU (GDPR + PSD2)
- **Required**: ✅ Yes
- **Min Languages**: 2
- **Must Include**: English
- **Recommended**: German, French, Spanish, Italian

### APAC
- **Required**: Optional
- **Min Languages**: 1
- **Must Include**: English
- **Recommended**: Chinese, Japanese, Korean

### MENA (Middle East & North Africa)
- **Required**: ✅ Yes
- **Min Languages**: 2
- **Must Include**: Arabic, English
- **Recommended**: French

## 🔐 Security & Data Protection

- Language preferences stored in user profile (encrypted)
- No PII in translation keys
- Compliance with GDPR Article 25 (Data Protection by Design)

## 📊 Monitoring & Analytics

Track language usage:
```jsx
// Automatically logged
{
  userId: "user123",
  language: "es",
  portal: "merchant",
  pspCode: "PSP001",
  timestamp: "2026-01-03T10:30:00Z"
}
```

## 🚦 Rollout Strategy

### Phase 1 (Q1 2026)
- ✅ Tier 1 languages (en, zh, es, ar, fr)
- ✅ Platform control panel
- ✅ Merchant portal

### Phase 2 (Q2 2026)
- Tier 2 languages
- Crypto gateway
- ISO gateway

### Phase 3 (Q3 2026)
- Tier 3 languages
- All remaining portals
- Full PSP customization

## 🤝 Contributing Translations

1. Navigate to `components/i18n/translations/{namespace}/`
2. Copy `en.json` to `{language_code}.json`
3. Translate all values (keep keys unchanged)
4. Submit PR with native speaker review

## 📞 Support

For translation questions or issues:
- Platform Team: platform@fts.money
- Documentation: https://docs.fts.money/i18n
- GitHub Issues: https://github.com/fts-money/platform/issues