import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'agenda' | 'claro' | 'escuro';

interface ThemeStore {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'agenda',
      setTheme: (theme) => {
        set({ theme });
        // Toggle dark class on html element
        if (theme === 'escuro') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    {
      name: 'satelite-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'escuro') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }
  )
);
