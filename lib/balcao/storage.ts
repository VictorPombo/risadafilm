import { createClient } from '@/lib/supabase';
import type { OrcamentoBalcao, DadosLojaConfig } from '@/types/balcao';
import { DADOS_LOJA_PADRAO } from '@/types/balcao';

const STORAGE_KEY_ORCAMENTOS = 'risada_balcao_orcamentos_v1';
const STORAGE_KEY_CONFIG = 'risada_balcao_config_loja_v1';

// ---------- Configurações da Loja (Endereço, Telefones, etc.) ----------

export function carregarConfigLoja(): DadosLojaConfig {
  if (typeof window === 'undefined') return DADOS_LOJA_PADRAO;
  try {
    const salvo = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (salvo) {
      const parsed = JSON.parse(salvo);
      // Se ainda estiver com o endereço antigo, atualiza automaticamente para o novo
      if (parsed.endereco && (parsed.endereco.includes('Panamirim') || parsed.endereco.includes('Paramu'))) {
        parsed.endereco = DADOS_LOJA_PADRAO.endereco;
      }
      if (!parsed.opcoesGarantia || !Array.isArray(parsed.opcoesGarantia) || parsed.opcoesGarantia.length === 0) {
        parsed.opcoesGarantia = [...DADOS_LOJA_PADRAO.opcoesGarantia];
      }
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(parsed));
      return { ...DADOS_LOJA_PADRAO, ...parsed };
    }
  } catch (err) {
    console.error('Erro ao ler config da loja:', err);
  }
  return DADOS_LOJA_PADRAO;
}

export function salvarConfigLoja(dados: DadosLojaConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(dados));
  } catch (err) {
    console.error('Erro ao salvar config da loja:', err);
  }
}

// ---------- Numeração Sequencial ----------

export function obterProximoNumero(lista: OrcamentoBalcao[]): string {
  const anoAtual = new Date().getFullYear();
  let maiorNumero = 0;

  for (const orc of lista) {
    // Formato esperado: "001/2026" ou "ORC-001/2026" ou apenas números
    const match = orc.numero.match(/(\d+)\/(\d{4})/);
    if (match) {
      const num = parseInt(match[1], 10);
      const ano = parseInt(match[2], 10);
      if (ano === anoAtual && num > maiorNumero) {
        maiorNumero = num;
      }
    } else {
      const numApenas = parseInt(orc.numero.replace(/\D/g, ''), 10);
      if (!isNaN(numApenas) && numApenas > maiorNumero) {
        maiorNumero = numApenas;
      }
    }
  }

  const proximo = maiorNumero + 1;
  const formatado = String(proximo).padStart(3, '0');
  return `${formatado}/${anoAtual}`;
}

// ---------- Salvar / Listar Orçamentos ----------

export async function salvarOrcamentoBalcao(orc: OrcamentoBalcao): Promise<OrcamentoBalcao> {
  const agora = new Date().toISOString();
  const orcamentoFinal: OrcamentoBalcao = {
    ...orc,
    id: orc.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `balcao_${Date.now()}`),
    created_at: orc.created_at || agora,
    updated_at: agora,
  };

  // 1. Salvar no localStorage (acesso offline imediato)
  if (typeof window !== 'undefined') {
    try {
      const lista = listarLocalmente();
      const index = lista.findIndex((item) => item.id === orcamentoFinal.id || item.numero === orcamentoFinal.numero);
      if (index >= 0) {
        lista[index] = orcamentoFinal;
      } else {
        lista.unshift(orcamentoFinal);
      }
      localStorage.setItem(STORAGE_KEY_ORCAMENTOS, JSON.stringify(lista));
    } catch (e) {
      console.warn('Erro ao salvar localmente no browser:', e);
    }
  }

  // 2. Salvar na nuvem (Supabase) para garantia permanente
  try {
    const supabase = createClient();
    const payloadBalcao = {
      tipo: 'balcao_express',
      carro: orcamentoFinal.carro,
      placa: orcamentoFinal.placa,
      telefone: orcamentoFinal.telefone,
      itens: orcamentoFinal.itens,
      avarias: orcamentoFinal.avarias,
      observacoes: orcamentoFinal.observacoes,
      garantia: orcamentoFinal.garantia,
    };

    // Formata data_emissao para timestamptz caso venha como YYYY-MM-DD
    const dataEmissaoISO = orcamentoFinal.data_emissao.includes('T')
      ? orcamentoFinal.data_emissao
      : `${orcamentoFinal.data_emissao}T12:00:00Z`;

    const row = {
      id: orcamentoFinal.id,
      numero: orcamentoFinal.numero,
      cliente: orcamentoFinal.cliente || 'Consumidor Balcão',
      atencao: orcamentoFinal.placa ? `Placa: ${orcamentoFinal.placa} | Tel: ${orcamentoFinal.telefone}` : orcamentoFinal.telefone,
      condicoes_pagamento: 'Balcão',
      prazo_instalacao: 'Imediato',
      status: 'Aprovado',
      total_geral: orcamentoFinal.total_geral || 0,
      data_emissao: dataEmissaoISO,
      observacoes: JSON.stringify(payloadBalcao),
      updated_at: agora,
    };

    const { error } = await supabase.from('orcamentos').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('Aviso ao sincronizar com Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Falha na sincronização remota do Supabase (operando via cache local):', err);
  }

  return orcamentoFinal;
}

export function listarLocalmente(): OrcamentoBalcao[] {
  if (typeof window === 'undefined') return [];
  try {
    const salvo = localStorage.getItem(STORAGE_KEY_ORCAMENTOS);
    if (salvo) return JSON.parse(salvo);
  } catch (err) {
    console.error('Erro ao ler orçamentos locais:', err);
  }
  return [];
}

export async function listarTodosOrcamentos(): Promise<OrcamentoBalcao[]> {
  const locais = listarLocalmente();

  // Tenta puxar do Supabase para enriquecer/sincronizar
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orcamentos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (!error && data) {
      const mapa = new Map<string, OrcamentoBalcao>();
      // Primeiro alimenta com os locais
      for (const loc of locais) {
        mapa.set(loc.id || loc.numero, loc);
      }

      // Adiciona ou mescla os da nuvem que sejam do tipo balcão ou antigos
      for (const row of data) {
        try {
          if (row.observacoes && row.observacoes.startsWith('{')) {
            const parsed = JSON.parse(row.observacoes);
            if (parsed.tipo === 'balcao_express') {
              const itemCloud: OrcamentoBalcao = {
                id: row.id,
                numero: row.numero,
                data_emissao: row.data_emissao ? row.data_emissao.split('T')[0] : new Date().toISOString().split('T')[0],
                cliente: row.cliente,
                telefone: parsed.telefone || '',
                carro: parsed.carro || '',
                placa: parsed.placa || '',
                itens: parsed.itens || [],
                avarias: parsed.avarias || [],
                observacoes: parsed.observacoes || '',
                garantia: parsed.garantia || '',
                total_geral: row.total_geral || 0,
                created_at: row.created_at,
                updated_at: row.updated_at,
              };
              mapa.set(row.id, itemCloud);
            }
          }
        } catch {
          // Linha normal não-balcão, ignora
        }
      }

      const mesclados = Array.from(mapa.values()).sort((a, b) => {
        const tA = new Date(a.created_at || a.data_emissao).getTime();
        const tB = new Date(b.created_at || b.data_emissao).getTime();
        return tB - tA;
      });

      // Atualiza o local storage com o merge
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_ORCAMENTOS, JSON.stringify(mesclados));
      }

      return mesclados;
    }
  } catch (err) {
    console.warn('Usando lista local de orçamentos (Supabase offline):', err);
  }

  return locais;
}

export async function excluirOrcamentoBalcao(id: string): Promise<void> {
  if (typeof window !== 'undefined') {
    const locais = listarLocalmente().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY_ORCAMENTOS, JSON.stringify(locais));
  }

  try {
    const supabase = createClient();
    await supabase.from('orcamentos').delete().eq('id', id);
  } catch (e) {
    console.warn('Erro ao deletar da nuvem:', e);
  }
}
