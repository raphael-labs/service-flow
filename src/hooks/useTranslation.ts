import { useLanguageStore } from '@/stores/languageStore';
import { translations, type TranslationKey } from '@/i18n/translations';

export function useTranslation() {
  const rawLang = useLanguageStore(s => s.language);
  const language = (['pt', 'en', 'es'].includes(rawLang) ? rawLang : 'pt') as 'pt' | 'en' | 'es';
  
  function t(key: TranslationKey, replacements?: Record<string, string>): string {
    let text: string = translations[language][key] ?? translations.pt[key] ?? key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  }

  const locale = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US';

  return { t, language, locale };
}
