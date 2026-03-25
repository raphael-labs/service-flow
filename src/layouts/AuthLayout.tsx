import { Outlet } from 'react-router-dom';
import logo from '@/assets/logo.png';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src={logo} alt="Satelite" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-bold font-heading text-foreground">Satelite</span>
        </div>
        <div className="card-elevated p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
