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
      if (parsed.telefone && !parsed.telefone.includes('94720')) {
        parsed.telefone = DADOS_LOJA_PADRAO.telefone;
      }
      if (!parsed.email || parsed.email.includes('biroquejunior')) {
        parsed.email = DADOS_LOJA_PADRAO.email;
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

// ---------- Salvar / Listar Orçamentos (Tabela Isolada: orcamentos_balcao) ----------

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

  // 2. Salvar no Supabase na tabela dedicada orcamentos_balcao (100% isolada)
  try {
    const supabase = createClient();
    const { error } = await supabase.from('orcamentos_balcao').upsert({
      id: orcamentoFinal.id,
      numero: orcamentoFinal.numero,
      data_emissao: orcamentoFinal.data_emissao,
      cliente: orcamentoFinal.cliente,
      telefone: orcamentoFinal.telefone,
      carro: orcamentoFinal.carro,
      placa: orcamentoFinal.placa,
      itens: orcamentoFinal.itens,
      avarias: orcamentoFinal.avarias,
      observacoes: orcamentoFinal.observacoes,
      garantia: orcamentoFinal.garantia,
      total_geral: orcamentoFinal.total_geral,
      created_at: orcamentoFinal.created_at,
      updated_at: orcamentoFinal.updated_at,
    });

    if (error) {
      console.warn('Aviso: orcamentos_balcao no Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Erro de conexão com Supabase:', err);
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

  // Tenta buscar da tabela dedicada orcamentos_balcao no Supabase
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orcamentos_balcao')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data)) {
      const mapa = new Map<string, OrcamentoBalcao>();
      
      // Insere os remotos
      for (const item of data) {
        mapa.set(item.id, {
          id: item.id,
          numero: item.numero,
          data_emissao: item.data_emissao,
          cliente: item.cliente,
          telefone: item.telefone,
          carro: item.carro,
          placa: item.placa,
          itens: Array.isArray(item.itens) ? item.itens : [],
          avarias: Array.isArray(item.avarias) ? item.avarias : [],
          observacoes: item.observacoes || '',
          garantia: item.garantia || '',
          total_geral: Number(item.total_geral) || 0,
          created_at: item.created_at,
          updated_at: item.updated_at,
        });
      }

      // Mescla com locais que porventura ainda não tenham subido
      for (const loc of locais) {
        if (loc.id && !mapa.has(loc.id)) {
          mapa.set(loc.id, loc);
        }
      }

      const listaCompleta = Array.from(mapa.values()).sort(
        (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );

      // Atualiza cache local
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_ORCAMENTOS, JSON.stringify(listaCompleta));
      }

      return listaCompleta;
    }
  } catch (err) {
    console.warn('Falha ao carregar do Supabase orcamentos_balcao:', err);
  }

  // Fallback offline
  return locais;
}

export async function excluirOrcamentoBalcao(id: string): Promise<void> {
  // 1. Remove localmente
  if (typeof window !== 'undefined') {
    const locais = listarLocalmente().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY_ORCAMENTOS, JSON.stringify(locais));
  }

  // 2. Remove do Supabase
  try {
    const supabase = createClient();
    await supabase.from('orcamentos_balcao').delete().eq('id', id);
  } catch (err) {
    console.warn('Erro ao excluir no Supabase:', err);
  }
}
