# i18n Migration Guide: Custom → react-i18next

## ✅ What's Done
- ✅ Installed react-i18next & i18next packages
- ✅ Created new i18nConfig.js with all existing translations
- ✅ Updated Layout to use I18nextProvider
- ✅ Created backwards-compatible useI18n() hook
- ✅ Updated LanguageSwitcher component

## 🔄 How to Update Your Pages

### Old Way (EnhancedLanguageProvider):
```javascript
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

const { t } = useI18n();
t('platform:dashboard.title')
```

### New Way (react-i18next) - Option 1: Keep using useI18n():
```javascript
import { useI18n } from '@/components/i18n/I18nextProvider';

const { t } = useI18n();
t('platform:dashboard.title') // Works exactly the same!
```

### New Way (react-i18next) - Option 2: Use native hook:
```javascript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('platform');
t('dashboard.title') // Cleaner syntax
```

## 📝 Pages That Need Updating

Most pages will continue working with the backwards-compatible `useI18n()` hook!

Only update imports from:
```javascript
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';
```

To:
```javascript
import { useI18n } from '@/components/i18n/I18nextProvider';
```

## 🎯 Benefits You Get Immediately

1. **Automatic fallbacks** - Missing keys show English instead of errors
2. **Better performance** - Only loads active language
3. **No more context re-render issues**
4. **Missing translation handling** - Shows key instead of breaking
5. **Industry standard** - Used by thousands of companies

## 🔍 Testing Checklist

- [ ] Platform dashboard loads in English
- [ ] Language switcher works
- [ ] Japanese translations load correctly
- [ ] RTL languages (Arabic, Hebrew) display correctly
- [ ] Missing translations fallback to English
- [ ] No console errors about missing translations

## 📚 Advanced Features (Optional)

### Lazy Loading Languages
```javascript
// Load language on demand (saves bundle size)
i18n.loadLanguages(['fr', 'de']);
```

### Pluralization
```javascript
// translations/en.json
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}

// Usage
t('items', { count: 1 }) // "1 item"
t('items', { count: 5 }) // "5 items"
```

### Interpolation
```javascript
t('welcome', { name: 'John' }) // "Welcome, John!"
```

## ❓ Troubleshooting

### "Translation key not found"
- Check the translation file exists in resources
- Verify namespace is loaded in i18nConfig.js
- Falls back to English automatically

### Language not switching
- Clear localStorage and reload
- Check browser console for errors
- Verify translation files are imported

### RTL not working
- Check SUPPORTED_LANGUAGES has rtl: true
- i18n automatically sets document.dir

## 🚀 Next Steps

1. Test all critical pages work
2. Gradually replace `useI18n()` with `useTranslation()` for better DX
3. Add more language files as needed
4. Enable debugging: `debug: true` in i18nConfig.js if issues arise