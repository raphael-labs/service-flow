import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore, type Language } from '@/stores/languageStore';
import Card from '@/components/Card';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

export default function ConfiguracoesPage() {
  const user = useAuthStore(s => s.user);
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();

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
