import { useState } from 'react';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import FormSelect from './FormSelect';
import type { Currency } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface ServiceFormData {
  name: string;
  description?: string;
  duration: number;
  price?: number;
  currency: Currency;
  simultaneousSlots: number;
}

interface ServiceFormProps {
  initialData?: Partial<ServiceFormData>;
  onSubmit: (data: ServiceFormData) => void;
  onCancel: () => void;
}

export default function ServiceForm({ initialData, onSubmit, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [duration, setDuration] = useState(initialData?.duration || 30);
  const [priceStr, setPriceStr] = useState(initialData?.price != null ? String(initialData.price) : '');
  const [currency, setCurrency] = useState<Currency>(initialData?.currency || 'BRL');
  const [simultaneousSlots, setSimultaneousSlots] = useState(initialData?.simultaneousSlots || 1);
  const { t } = useTranslation();

  const currencyOptions = [
    { value: 'BRL', label: 'Real (R$)' },
    { value: 'USD', label: 'Dólar (US$)' },
    { value: 'EUR', label: 'Euro (€)' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = priceStr.trim() !== '' ? Number(priceStr) : undefined;
    onSubmit({ name, description: description.trim() || undefined, duration, price, currency, simultaneousSlots });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput label={t('serviceName')} value={name} onChange={e => setName(e.target.value)} required />
      <FormTextarea label={t('descriptionOptional')} value={description} onChange={e => setDescription(e.target.value)} placeholder={t('serviceDescPlaceholder')} rows={3} />
      <FormInput label={t('durationMinutes')} type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={5} required />
      
      <div className="grid grid-cols-2 gap-3">
        <FormSelect
          label={t('currency')}
          value={currency}
          onChange={e => setCurrency(e.target.value as Currency)}
          options={currencyOptions}
        />
        <FormInput
          label={t('priceOptional')}
          type="number"
          value={priceStr}
          onChange={e => setPriceStr(e.target.value)}
          min={0}
          step={0.01}
          placeholder={t('priceHidePlaceholder')}
        />
      </div>

      <FormInput
        label={t('simultaneousSlots')}
        type="number"
        value={simultaneousSlots}
        onChange={e => setSimultaneousSlots(Number(e.target.value))}
        min={1}
        required
      />

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1">{t('save')}</button>
        <button type="button" onClick={onCancel} className="btn-outline flex-1">{t('cancel')}</button>
      </div>
    </form>
  );
}