import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '@/components/FormInput';
//import { mockRegister } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/hooks/useTranslation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  /*const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      mockRegister(name, email, businessName);
      navigate('/dashboard');
    }, 500);
  };*/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
        data: {
          name,
          business_name: businessName
        }
      }
    });
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    alert("Verifique seu email para confirmar a conta!");
  };


  return (
    <div>
      <h2 className="text-xl font-semibold font-heading text-foreground mb-1">{t('createAccountTitle')}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t('createAccountSubtitle')}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label={t('fullName')} value={name} onChange={e => setName(e.target.value)} placeholder={t('fullName')} required />
        <FormInput label={t('businessNameLabel')} value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder={t('businessNamePlaceholder')} required />
        <FormInput label={t('email')} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
        <FormInput label={t('password')} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? t('creatingAccount') : t('createAccount')}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        {t('alreadyHaveAccount')}{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">{t('login')}</Link>
      </p>
    </div>
  );
}
