
/**
 * DEPRECATED: Use I18nextProvider instead
 * This file provides backwards compatibility during migration
 */

export { useI18n, SUPPORTED_LANGUAGES, I18nextProvider as EnhancedLanguageProvider } from './I18nextProvider';

console.warn('⚠️ EnhancedLanguageProvider is deprecated. Please update imports to use I18nextProvider from ./I18nextProvider');
