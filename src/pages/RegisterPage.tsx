import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '@/components/FormInput';
import { mockRegister } from '@/stores/authStore';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      mockRegister(name, email, businessName);
      navigate('/dashboard');
    }, 500);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold font-heading text-foreground mb-1">Criar Conta</h2>
      <p className="text-sm text-muted-foreground mb-6">Comece a gerenciar seus agendamentos</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Nome completo" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" required />
        <FormInput label="Nome do negócio" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Ex: Barbearia do João" required />
        <FormInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
        <FormInput label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Criando...' : 'Criar conta'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link>
      </p>
    </div>
  );
}
