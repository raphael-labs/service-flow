import { useState } from 'react';
import FormInput from './FormInput';

interface ClientFormProps {
  initialData?: { name: string; phone: string; email: string };
  onSubmit: (data: { name: string; phone: string; email: string }) => void;
  onCancel: () => void;
}

export default function ClientForm({ initialData, onSubmit, onCancel }: ClientFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, phone, email });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput label="Nome" value={name} onChange={e => setName(e.target.value)} required />
      <FormInput label="Telefone" value={phone} onChange={e => setPhone(e.target.value)} required />
      <FormInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1">Salvar</button>
        <button type="button" onClick={onCancel} className="btn-outline flex-1">Cancelar</button>
      </div>
    </form>
  );
}
