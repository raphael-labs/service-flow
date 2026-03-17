import { Outlet } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold font-heading text-foreground">AgendaPro</span>
        </div>
        <div className="card-elevated p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
