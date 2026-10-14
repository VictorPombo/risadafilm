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
  // Retorna os orçamentos do Balcão salvos de forma isolada, sem misturar com o sistema administrativo
  return listarLocalmente();
}

export async function excluirOrcamentoBalcao(id: string): Promise<void> {
  if (typeof window !== 'undefined') {
    const locais = listarLocalmente().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY_ORCAMENTOS, JSON.stringify(locais));
  }
}
