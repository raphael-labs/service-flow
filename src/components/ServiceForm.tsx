import { useState } from 'react';
import FormInput from './FormInput';

interface ServiceFormProps {
  initialData?: { name: string; duration: number; price: number };
  onSubmit: (data: { name: string; duration: number; price: number }) => void;
  onCancel: () => void;
}

export default function ServiceForm({ initialData, onSubmit, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [duration, setDuration] = useState(initialData?.duration || 30);
  const [price, setPrice] = useState(initialData?.price || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, duration, price });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput label="Nome do Serviço" value={name} onChange={e => setName(e.target.value)} required />
      <FormInput label="Duração (minutos)" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={5} required />
      <FormInput label="Preço (R$)" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} min={0} step={0.01} required />
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1">Salvar</button>
        <button type="button" onClick={onCancel} className="btn-outline flex-1">Cancelar</button>
      </div>
    </form>
  );
}
