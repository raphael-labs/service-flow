import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    const { agendamento_id, motivo } = req.body;

    if (!agendamento_id) {
      return res.status(400).json({ error: 'ID obrigatório' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('agendamentos')
      .update({
        cancel_at: new Date().toISOString(),
        motivo_cancel: motivo || null,
        lido: false,
      })
      .eq('id', agendamento_id);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao cancelar' });
    }

    return res.status(200).json({ success: true });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      error: err.message || 'Erro interno'
    });
  }
}