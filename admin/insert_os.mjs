import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  const os = {
    numero: 'OS-001/2026',
    data_emissao: new Date().toISOString(),
    cliente: 'Condomínio Edifício Horizon',
    local_servico: 'Portaria Principal e Fachada',
    data_inicio: '2026-06-01',
    data_termino: '2026-06-03',
    material_aplicado: 'Película Solar G20 e Película Antivandalismo PS8',
    data_prevista_pagamento: '2026-06-10',
    status: 'Aberta',
    total_geral: 4500.00
  };

  const { data: osData, error: osError } = await supabase
    .from('ordens_servico')
    .insert([os])
    .select()
    .single();

  if (osError) {
    console.error('Error inserting OS:', osError);
    return;
  }

  const items = [
    {
      ordem_servico_id: osData.id,
      ordem: 1,
      quant: 2,
      descricao: 'Instalação Película Solar G20 - Fachada Sul',
      medidas: '2.0m x 1.5m',
      total_metros: 6.0,
      valor_total: 2500.00
    },
    {
      ordem_servico_id: osData.id,
      ordem: 2,
      quant: 1,
      descricao: 'Aplicação PS8 na Guarita',
      medidas: 'Vidros laterais',
      total_metros: 2.5,
      valor_total: 2000.00
    }
  ];

  const { error: itemsError } = await supabase
    .from('os_itens')
    .insert(items);

  if (itemsError) {
    console.error('Error inserting items:', itemsError);
    return;
  }
  
  console.log('Inserted OS successfully!');
}

run();
