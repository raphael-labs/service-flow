import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔥 chave mestre
);

export default async function handler(req, res) {
  const { user, business_name, name } = req.body;

  try {
    // 🔥 cria empresa
    const { data: empresa } = await supabase
      .from('empresas')
      .insert({
        name: business_name,
        slug: business_name.toLowerCase().replace(/\s+/g, '-'),
      })
      .select()
      .single();

    // 🔥 cria usuario
    await supabase.from('usuarios').insert({
      user_id: user.id,
      empresa_id: empresa.id,
      name: name,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}