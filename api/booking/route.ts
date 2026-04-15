import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'slug obrigatório' }, { status: 400 });
    }

    // 🔥 1. EMPRESA
    const { data: empresa } = await supabase
        .from('empresas')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!empresa) {
        return NextResponse.json({ error: 'empresa não encontrada' }, { status: 404 });
    }

    const empresaId = empresa.id;

    // 🔥 2. SERVIÇOS
    const { data: servicos } = await supabase
        .from('servicos')
        .select('*')
        .eq('empresa_id', empresaId);

    // 🔥 3. DIAS
    const { data: dias } = await supabase
        .from('dias_semanais')
        .select('*')
        .eq('empresa_id', empresaId);

    // 🔥 4. AGENDAMENTOS (LIMITADO)
    /*const { data: agendamentos } = await supabase
      .from('agendamentos')
      .select('servico_id, data_hora') // 🔥 NÃO retorna dados sensíveis
      .eq('empresa_id', empresaId);*/

    // 🔥 calcula janela válida
    const now = new Date();

    const startDate = new Date(
        now.getTime() + empresa.min_pre_hora * 60 * 60 * 1000
    );

    const endDate = new Date();
    endDate.setDate(now.getDate() + empresa.max_agenda_dias);

    // 🔥 busca SOMENTE o necessário
    const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('servico_id, data_hora')
        .eq('empresa_id', empresaId)
        .gte('data_hora', startDate.toISOString())
        .lte('data_hora', endDate.toISOString());

    return NextResponse.json({
        empresa: {
            id: empresa.id,
            name: empresa.name,
            telefone: empresa.telefone,
            email: empresa.email,
            endereco: empresa.endereco,
            logo: empresa.path_img_logo,
            bg: empresa.path_img_bg,
            estilo: empresa.pg_estilo,
            min_pre_hora: empresa.min_pre_hora,
            max_agenda_dias: empresa.max_agenda_dias,
        },
        servicos,
        dias,
        agendamentos,
    });
}