import { useBookingLogic } from '@/hooks/useBookingLogic';
import {
  ClassicStyle, MinimalStyle, BoldStyle, ElegantStyle, CompactStyle,
  GlassStyle, PlayfulStyle, CorporateStyle, ModernStyle, WarmStyle
} from '@/components/booking/BookingStyles';
import type { BookingStyle } from '@/stores/businessImageStore';
import FloatingCancelAppointment from '@/components/FloatingCancelAppointment';
import logo from '@/assets/logo.png';


const styleMap: Record<BookingStyle, React.FC<any>> = {
  classic: ClassicStyle,
  minimal: MinimalStyle,
  bold: BoldStyle,
  elegant: ElegantStyle,
  compact: CompactStyle,
  glass: GlassStyle,
  playful: PlayfulStyle,
  corporate: CorporateStyle,
  modern: ModernStyle,
  warm: WarmStyle,
};

export default function BookingPage() {
  const props = useBookingLogic();

  if (props.loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* Spinner */}
          <div className="absolute inset-0 border-4 border-gray-300 border-t-foreground rounded-full animate-spin" />
          {/* Logo centralizada */}
          <img
            src={logo}
            alt="Satelite"
            className="w-64 h-64 object-contain"
          />
        </div>
      </div>
    );
  }
  const StyleComponent = styleMap[props.bookingStyle] || ClassicStyle;
  return (
    <>
      <StyleComponent {...props} />
      <FloatingCancelAppointment />
    </>
  );
}
