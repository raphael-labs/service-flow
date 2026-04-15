import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  try {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ error: 'slug obrigatório' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔥 EMPRESA
    const { data: empresa, error: errEmpresa } = await supabase
      .from('empresas')
      .select('*')
      .eq('slug', slug)
      .single();

    if (errEmpresa || !empresa) {
      console.error(errEmpresa);
      return res.status(404).json({ error: 'empresa não encontrada' });
    }

    const empresaId = empresa.id;

    // 🔥 JANELA
    const now = new Date();

    const startDate = new Date(
      now.getTime() + (empresa.min_pre_hora || 0) * 60 * 60 * 1000
    );

    const endDate = new Date();
    endDate.setDate(now.getDate() + (empresa.max_agenda_dias || 7));

    // 🔥 AGENDAMENTOS
    const { data: agendamentos } = await supabase
      .from('agendamentos')
      .select('servico_id, data_hora')
      .eq('empresa_id', empresaId)
      .gte('data_hora', startDate.toISOString())
      .lte('data_hora', endDate.toISOString());

    // 🔥 SERVIÇOS
    const { data: servicos } = await supabase
      .from('servicos')
      .select('*')
      .eq('empresa_id', empresaId);

    // 🔥 DIAS
    const { data: dias } = await supabase
      .from('dias_semanais')
      .select('*')
      .eq('empresa_id', empresaId);

    return res.status(200).json({
      empresa,
      servicos,
      dias,
      agendamentos,
    });

  } catch (err: any) {
    console.error('ERRO GERAL:', err);

    return res.status(500).json({
      error: err.message || 'erro interno'
    });
  }
}