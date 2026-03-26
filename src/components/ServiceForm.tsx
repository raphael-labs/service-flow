import { useState } from 'react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import type { Currency } from '@/types';

interface ServiceFormData {
  name: string;
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

const currencyOptions = [
  { value: 'BRL', label: 'Real (R$)' },
  { value: 'USD', label: 'Dólar (US$)' },
  { value: 'EUR', label: 'Euro (€)' },
];

export default function ServiceForm({ initialData, onSubmit, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [duration, setDuration] = useState(initialData?.duration || 30);
  const [priceStr, setPriceStr] = useState(initialData?.price != null ? String(initialData.price) : '');
  const [currency, setCurrency] = useState<Currency>(initialData?.currency || 'BRL');
  const [simultaneousSlots, setSimultaneousSlots] = useState(initialData?.simultaneousSlots || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = priceStr.trim() !== '' ? Number(priceStr) : undefined;
    onSubmit({ name, duration, price, currency, simultaneousSlots });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput label="Nome do Serviço" value={name} onChange={e => setName(e.target.value)} required />
      <FormInput label="Duração (minutos)" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={5} required />
      
      <div className="grid grid-cols-2 gap-3">
        <FormSelect
          label="Moeda"
          value={currency}
          onChange={e => setCurrency(e.target.value as Currency)}
          options={currencyOptions}
        />
        <FormInput
          label="Preço (opcional)"
          type="number"
          value={priceStr}
          onChange={e => setPriceStr(e.target.value)}
          min={0}
          step={0.01}
          placeholder="Deixe vazio para ocultar"
        />
      </div>

      <FormInput
        label="Serviços simultâneos"
        type="number"
        value={simultaneousSlots}
        onChange={e => setSimultaneousSlots(Number(e.target.value))}
        min={1}
        required
      />

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1">Salvar</button>
        <button type="button" onClick={onCancel} className="btn-outline flex-1">Cancelar</button>
      </div>
    </form>
  );
}
