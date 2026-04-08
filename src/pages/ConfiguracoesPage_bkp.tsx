import { useState, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore, type Language } from '@/stores/languageStore';
import { useBusinessImageStore, type BookingStyle } from '@/stores/businessImageStore';
import Card from '@/components/Card';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { Upload, X, Image, Check } from 'lucide-react';

export default function ConfiguracoesPage() {
  const user = useAuthStore(s => s.user);
  const { language, setLanguage } = useLanguageStore();
  const { logo, extraImage, bookingStyle, setLogo, setExtraImage, setBookingStyle } = useBusinessImageStore();
  const { t } = useTranslation();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const extraInputRef = useRef<HTMLInputElement>(null);

  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');

  const [activeDays, setActiveDays] = useState<string[]>(['1', '2', '3', '4', '5', '6']);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [slotDuration, setSlotDuration] = useState('30');

  const dayKeys: { value: string; key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun' }[] = [
    { value: '1', key: 'mon' },
    { value: '2', key: 'tue' },
    { value: '3', key: 'wed' },
    { value: '4', key: 'thu' },
    { value: '5', key: 'fri' },
    { value: '6', key: 'sat' },
    { value: '0', key: 'sun' },
  ];

  const toggleDay = (day: string) => {
    setActiveDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('infoSaved'));
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('scheduleSaved'));
  };

  const languageOptions = [
    { value: 'pt', label: 'Português' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (img: string | null) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Max 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
      toast.success(t('imageSaved'));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="page-header">{t('settings')}</h1>

      {/* Language */}
      <Card>
        <h2 className="text-base font-semibold font-heading text-foreground mb-4">{t('language')}</h2>
        <div className="max-w-xs">
          <FormSelect
            label={t('language')}
            value={language}
            onChange={e => setLanguage(e.target.value as Language)}
            options={languageOptions}
          />
        </div>
      </Card>

      {/* Business Images */}
      <Card>
        <h2 className="text-base font-semibold font-heading text-foreground mb-4">{t('businessImages')}</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Logo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{t('logo')}</label>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setLogo)} />
            {logo ? (
              <div className="relative group">
                <div className="w-full aspect-square rounded-xl border border-border bg-card overflow-hidden flex items-center justify-center">
                  <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => { setLogo(null); toast.success(t('imageRemoved')); }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="w-full aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card flex flex-col items-center justify-center gap-2 transition-colors text-muted-foreground hover:text-foreground"
              >
                <Upload className="w-6 h-6" />
                <span className="text-xs">{t('uploadImage')}</span>
              </button>
            )}
          </div>

          {/* Extra Image */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{t('extraImage')}</label>
            <input ref={extraInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setExtraImage)} />
            {extraImage ? (
              <div className="relative group">
                <div className="w-full aspect-square rounded-xl border border-border bg-card overflow-hidden flex items-center justify-center">
                  <img src={extraImage} alt="Extra" className="max-w-full max-h-full object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => { setExtraImage(null); toast.success(t('imageRemoved')); }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => extraInputRef.current?.click()}
                className="w-full aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card flex flex-col items-center justify-center gap-2 transition-colors text-muted-foreground hover:text-foreground"
              >
                <Image className="w-6 h-6" />
                <span className="text-xs">{t('uploadImage')}</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Booking Page Style */}
      <Card>
        <h2 className="text-base font-semibold font-heading text-foreground mb-4">{t('bookingPageStyle')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {([
            { id: 'classic', label: 'Classic', desc: t('styleClassicDesc'), color: 'bg-primary' },
            { id: 'minimal', label: 'Minimal', desc: t('styleMinimalDesc'), color: 'bg-foreground' },
            { id: 'bold', label: 'Bold', desc: t('styleBoldDesc'), color: 'bg-primary' },
            { id: 'elegant', label: 'Elegant', desc: t('styleElegantDesc'), color: 'bg-accent' },
            { id: 'compact', label: 'Compact', desc: t('styleCompactDesc'), color: 'bg-secondary' },
            { id: 'glass', label: 'Glass', desc: t('styleGlassDesc'), color: 'bg-primary/30' },
            { id: 'playful', label: 'Playful', desc: t('stylePlayfulDesc'), color: 'bg-warning' },
            { id: 'corporate', label: 'Corporate', desc: t('styleCorporateDesc'), color: 'bg-primary' },
            { id: 'modern', label: 'Modern', desc: t('styleModernDesc'), color: 'bg-accent' },
            { id: 'warm', label: 'Warm', desc: t('styleWarmDesc'), color: 'bg-warning/30' },
          ] as { id: BookingStyle; label: string; desc: string; color: string }[]).map(style => (
            <button
              key={style.id}
              type="button"
              onClick={() => { setBookingStyle(style.id); toast.success(t('styleSaved')); }}
              className={`relative rounded-xl border-2 p-3 text-left transition-all hover:shadow-md ${
                bookingStyle === style.id ? 'border-primary shadow-md' : 'border-border hover:border-primary/30'
              }`}
            >
              {bookingStyle === style.id && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className={`w-full h-8 rounded-lg mb-2 ${style.color}`} />
              <p className="text-xs font-semibold text-foreground">{style.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{style.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Business Info */}
      <Card>
        <h2 className="text-base font-semibold font-heading text-foreground mb-4">{t('businessInfo')}</h2>
        <form onSubmit={handleSaveBusiness} className="space-y-4">
          <FormInput label={t('companyName')} value={businessName} onChange={e => setBusinessName(e.target.value)} />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormInput label={t('phone')} value={phone} onChange={e => setPhone(e.target.value)} />
            <FormInput label={t('email')} type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <FormInput label={t('address')} value={address} onChange={e => setAddress(e.target.value)} />
          <div className="pt-1">
            <button type="submit" className="btn-primary text-sm">{t('saveInfo')}</button>
          </div>
        </form>
      </Card>

      {/* Schedule Config */}
      <Card>
        <h2 className="text-base font-semibold font-heading text-foreground mb-4">{t('scheduleConfig')}</h2>
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t('workingDays')}</label>
            <div className="flex flex-wrap gap-2">
              {dayKeys.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeDays.includes(day.value)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {t(day.key)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <FormInput label={t('start')} type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            <FormInput label={t('end')} type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            <FormSelect
              label={t('slotDuration')}
              value={slotDuration}
              onChange={e => setSlotDuration(e.target.value)}
              options={[
                { value: '15', label: '15 min' },
                { value: '30', label: '30 min' },
                { value: '45', label: '45 min' },
                { value: '60', label: '60 min' },
              ]}
            />
          </div>

          {/* Public link info */}
          <div className="bg-accent/50 rounded-lg p-4">
            <p className="text-xs font-medium text-foreground mb-1">{t('publicBookingLink')}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-card rounded px-3 py-2 text-muted-foreground border border-border truncate">
                {window.location.origin}/booking/{user?.slug || 'seu-negocio'}
              </code>
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/booking/${user?.slug}`); toast.success(t('linkCopied')); }}
                className="btn-outline text-xs px-3 py-2 shrink-0"
              >
                {t('copy')}
              </button>
            </div>
          </div>

          <div className="pt-1">
            <button type="submit" className="btn-primary text-sm">{t('saveSchedule')}</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
