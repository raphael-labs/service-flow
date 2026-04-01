/*import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();

            if (data.session) {
                navigate("/dashboard");
            } else {
                navigate("/login");
            }
        };

        getSession();
    }, []);

    return <p>Confirmando login...</p>;
}*/

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

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

            // 🔍 Verifica se já existe usuário
            const { data: existingUser } = await supabase
                .from("usuarios")
                .select("id")
                .eq("user_id", user.id)
                .maybeSingle();

            if (!existingUser) {
                // 🔥 1. Criar empresa
                const { data: empresa, error: empresaError } = await supabase
                    .from("empresas")
                    .insert({
                        name: user.user_metadata?.business_name,
                        slug: user.user_metadata?.business_name
                            ?.toLowerCase()
                            .replace(/\s+/g, "-")
                            + "-" + Math.floor(Math.random() * 1000)
                    })
                    .select()
                    .single();

                if (empresaError) {
                    console.error(empresaError);
                    return;
                }

                // 🔥 2. Criar usuário vinculado
                const { error: userError } = await supabase
                    .from("usuarios")
                    .insert({
                        user_id: user.id,
                        empresa_id: empresa.id,
                        name: user.user_metadata?.name,
                    });

                if (userError) {
                    console.error(userError);
                    return;
                }
            }

            navigate("/dashboard");
        };

        handleUser();
    }, []);

    return <p>Carregando...</p>;
}