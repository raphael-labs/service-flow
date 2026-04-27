import { useState } from 'react';
import FormInput from './FormInput';
import { useTranslation } from '@/hooks/useTranslation';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { FormPhoneInput } from './FormPhoneInput';


interface ClientFormProps {
  initialData?: {
    name: string;
    phone: string;
    email: string;
    data_nascimento?: string | null;
  };
  onSubmit: (data: {
    name: string;
    phone: string;
    email: string;
    data_nascimento?: string | null;
  }) => void;
  onCancel: () => void;
}

export default function ClientForm({ initialData, onSubmit, onCancel }: ClientFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [birthDate, setBirthDate] = useState(initialData?.data_nascimento || '');

  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      name,
      phone,
      email,
      data_nascimento: birthDate || null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label={t('name')}
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />

      <FormPhoneInput
        label={t('phone')}
        value={phone}
        onChange={setPhone}
      />

      <FormInput
        label={t('email')}
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />

      {/* 🔥 NOVO CAMPO */}
      <FormInput
        label={t('birthDate') || 'Data de nascimento'}
        type="date"
        value={birthDate || ''}
        onChange={e => setBirthDate(e.target.value)}
      />

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1">
          {t('save')}
        </button>

        <button type="button" onClick={onCancel} className="btn-outline flex-1">
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}