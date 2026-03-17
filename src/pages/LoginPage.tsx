import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '@/components/FormInput';
import { mockLogin } from '@/stores/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      mockLogin(email, password);
      navigate('/dashboard');
    }, 500);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold font-heading text-foreground mb-1">Entrar</h2>
      <p className="text-sm text-muted-foreground mb-6">Acesse sua conta para gerenciar agendamentos</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
        <FormInput label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Não tem conta?{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">Criar conta</Link>
      </p>
    </div>
  );
}
