import { useBookingLogic } from '@/hooks/useBookingLogic';
import {
  ClassicStyle, MinimalStyle, BoldStyle, ElegantStyle, CompactStyle,
  GlassStyle, PlayfulStyle, CorporateStyle, ModernStyle, WarmStyle
} from '@/components/booking/BookingStyles';
import type { BookingStyle } from '@/stores/businessImageStore';

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
  const StyleComponent = styleMap[props.bookingStyle] || ClassicStyle;
  return <StyleComponent {...props} />;
}
