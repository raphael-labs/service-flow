import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '@/components/FormInput';
//import { mockLogin } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/hooks/useTranslation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  /*const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      mockLogin(email, password);
      navigate('/dashboard');
    }, 500);
  };*/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold font-heading text-foreground mb-1">{t('login')}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t('loginSubtitle')}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label={t('email')} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
        <FormInput label={t('password')} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? t('loggingIn') : t('login')}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">{t('createAccount')}</Link>
      </p>
    </div>
  );
}
