import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    const { slug, email, data_nascimento } = req.body;

    if (!slug || !email || !data_nascimento) {
      return res.status(400).json({ error: 'Dados obrigatórios' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔥 1. buscar empresa pelo slug
    const { data: empresa, error: errEmpresa } = await supabase
      .from('empresas')
      .select('id')
      .eq('slug', slug)
      .single();

    if (errEmpresa || !empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // 🔥 2. buscar cliente DENTRO da empresa
    const { data: cliente, error: errCliente } = await supabase
      .from('clientes')
      .select('id, name')
      .eq('empresa_id', empresa.id)
      .eq('email', email)
      .eq('data_nascimento', data_nascimento)
      .single();

    if (errCliente || !cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // 🔥 3. buscar agendamentos futuros
    const now = new Date().toISOString();

    const { data: agendamentos, error } = await supabase
      .from('agendamentos')
      .select(`
        id,
        data_hora,
        servicos ( name )
      `)
      .eq('cliente_id', cliente.id)
      .eq('empresa_id', empresa.id)
      .gte('data_hora', now)
      .order('data_hora', { ascending: true });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }

    return res.status(200).json({
      cliente,
      agendamentos,
    });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      error: err.message || 'Erro interno'
    });
  }
}