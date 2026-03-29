import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BookingStyle = 'classic' | 'minimal' | 'bold' | 'elegant' | 'compact' | 'glass' | 'playful' | 'corporate' | 'modern' | 'warm';

interface BusinessImageState {
  logo: string | null;
  extraImage: string | null;
  bookingStyle: BookingStyle;
  setLogo: (img: string | null) => void;
  setExtraImage: (img: string | null) => void;
  setBookingStyle: (style: BookingStyle) => void;
}

export const useBusinessImageStore = create<BusinessImageState>()(
  persist(
    (set) => ({
      logo: null,
      extraImage: null,
      bookingStyle: 'classic',
      setLogo: (img) => set({ logo: img }),
      setExtraImage: (img) => set({ extraImage: img }),
      setBookingStyle: (style) => set({ bookingStyle: style }),
    }),
    { name: 'business-images' }
  )
);
