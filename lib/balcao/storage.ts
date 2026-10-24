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

// ---------- Numeração Sequencial Robusta ----------

export function obterProximoNumero(lista: OrcamentoBalcao[]): string {
  const anoAtual = new Date().getFullYear();
  let maiorNumero = 0;

  for (const orc of lista) {
    if (!orc.numero) continue;
    const match = orc.numero.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maiorNumero) {
        maiorNumero = num;
      }
    }
  }

  const proximo = maiorNumero + 1;
  const formatado = String(proximo).padStart(3, '0');
  return `${formatado}/${anoAtual}`;
}

// ---------- Salvar / Listar Orçamentos (Tabela Isolada: orcamentos_balcao) ----------

export async function salvarOrcamentoBalcao(orc: OrcamentoBalcao): Promise<{ salvo: OrcamentoBalcao; nuvemOk: boolean }> {
  const agora = new Date().toISOString();
  const orcamentoFinal: OrcamentoBalcao = {
    ...orc,
    id: orc.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `balcao_${Date.now()}`),
    created_at: orc.created_at || agora,
    updated_at: agora,
  };

  // 1. Salvar no localStorage (acesso offline e imediato no PC físico)
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

  // 2. Salvar no Supabase na nuvem
  let nuvemOk = false;
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

    if (!error) {
      nuvemOk = true;
    } else {
      console.warn('Aviso: orcamentos_balcao no Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Erro de conexão com Supabase:', err);
  }

  return { salvo: orcamentoFinal, nuvemOk };
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

export async function listarTodosOrcamentos(): Promise<{ lista: OrcamentoBalcao[]; nuvemOk: boolean }> {
  const locais = listarLocalmente();
  let nuvemOk = false;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orcamentos_balcao')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data)) {
      nuvemOk = true;
      const mapa = new Map<string, OrcamentoBalcao>();
      
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

      for (const loc of locais) {
        if (loc.id && !mapa.has(loc.id)) {
          mapa.set(loc.id, loc);
          supabase.from('orcamentos_balcao').upsert(loc).then(() => {}, () => {});
        }
      }

      const listaCompleta = Array.from(mapa.values()).sort(
        (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_ORCAMENTOS, JSON.stringify(listaCompleta));
      }

      return { lista: listaCompleta, nuvemOk };
    }
  } catch (err) {
    console.warn('Falha ao carregar do Supabase orcamentos_balcao:', err);
  }

  return { lista: locais, nuvemOk: false };
}

export async function excluirOrcamentoBalcao(id: string): Promise<void> {
  if (typeof window !== 'undefined') {
    const locais = listarLocalmente().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY_ORCAMENTOS, JSON.stringify(locais));
  }

  try {
    const supabase = createClient();
    await supabase.from('orcamentos_balcao').delete().eq('id', id);
  } catch (err) {
    console.warn('Erro ao excluir no Supabase:', err);
  }
}

// ---------- Utilitários de Backup Anti-Perda (Exportar / Importar JSON) ----------

export function exportarBackupJSON(lista: OrcamentoBalcao[]): void {
  if (typeof window === 'undefined') return;
  const hoje = new Date().toISOString().split('T')[0];
  const blob = new Blob([JSON.stringify(lista, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_orcamentos_risada_${hoje}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importarBackupJSON(conteudoJSON: string): Promise<number> {
  try {
    const parsed = JSON.parse(conteudoJSON);
    if (!Array.isArray(parsed)) throw new Error('Formato inválido: esperado um array de orçamentos');

    let importados = 0;
    for (const orc of parsed) {
      if (orc.numero && (orc.cliente || orc.total_geral)) {
        await salvarOrcamentoBalcao(orc);
        importados++;
      }
    }
    return importados;
  } catch (err: any) {
    throw new Error('Falha ao importar backup: ' + err.message);
  }
}
