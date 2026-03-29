import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BusinessImageState {
  logo: string | null;
  extraImage: string | null;
  setLogo: (img: string | null) => void;
  setExtraImage: (img: string | null) => void;
}

export const useBusinessImageStore = create<BusinessImageState>()(
  persist(
    (set) => ({
      logo: null,
      extraImage: null,
      setLogo: (img) => set({ logo: img }),
      setExtraImage: (img) => set({ extraImage: img }),
    }),
    { name: 'business-images' }
  )
);
