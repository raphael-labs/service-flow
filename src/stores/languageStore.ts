import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'pt' | 'en' | 'es';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const validLanguages: Language[] = ['pt', 'en', 'es'];

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'pt',
      setLanguage: (language) => set({ language: validLanguages.includes(language) ? language : 'pt' }),
    }),
    {
      name: 'satelite-language',
      onRehydrateStorage: () => (state) => {
        if (state && !validLanguages.includes(state.language)) {
          state.language = 'pt';
        }
      },
    }
  )
);
