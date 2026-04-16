import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const {
      empresa_id,
      nome,
      telefone,
      email,
      data_nascimento,
      servico_id,
      data_hora
    } = req.body;

    if (!empresa_id || !servico_id || !data_hora || !email || !data_nascimento) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // ============================
    // 🔍 1. BUSCAR CLIENTE EXISTENTE
    // ============================
    const { data: clienteExistente } = await supabase
      .from('clientes')
      .select('id')
      .eq('email', email)
      .eq('data_nascimento', data_nascimento)
      .maybeSingle();

    let cliente_id;

    // ============================
    // 👤 2. SE EXISTE → USA ID
    // ============================
    if (clienteExistente) {
      cliente_id = clienteExistente.id;
    } else {
      // ============================
      // ➕ 3. CRIA CLIENTE
      // ============================
      const { data: novoCliente, error: erroCliente } = await supabase
        .from('clientes')
        .insert({
          nome,
          telefone,
          email,
          data_nascimento,
          empresa_id
        })
        .select('id')
        .single();

      if (erroCliente) {
        console.error(erroCliente);
        return res.status(500).json({ error: erroCliente.message });
      }

      cliente_id = novoCliente.id;
    }

    // ============================
    // 📅 4. CRIAR AGENDAMENTO
    // ============================
    const { error: erroAgendamento } = await supabase
      .from('agendamentos')
      .insert({
        empresa_id,
        cliente_id,
        servico_id,
        data_hora
      });

    if (erroAgendamento) {
      console.error(erroAgendamento);
      return res.status(500).json({ error: erroAgendamento.message });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}