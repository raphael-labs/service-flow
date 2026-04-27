import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import logo from '@/assets/logo.png';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleUser = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        navigate("/login");
        return;
      }

      try {
        // 🔥 chama sua API serverless
        const res = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user,
            name: user.user_metadata?.name,
            business_name: user.user_metadata?.business_name,
          }),
        });

        const result = await res.json();

        if (!res.ok) {
          console.error("Erro API:", result.error);
          navigate("/login");
          return;
        }

        // ✅ tudo certo
        navigate("/dashboard");

      } catch (err) {
        console.error("Erro geral:", err);
        navigate("/login");
      }
    };

    handleUser();
  }, []);

  //return <p>Carregando...</p>;

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Spinner */}
        <div className="absolute inset-0 border-4 border-gray-300 border-t-foreground rounded-full animate-spin" />
        {/* Logo centralizada */}
        <img
          src={logo}
          alt="Satelite"
          className="w-64 h-64 object-contain"
        />
      </div>
    </div>
  );
}