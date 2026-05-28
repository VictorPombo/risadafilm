// ==========================================
// Types — Módulo Admin RisadaFilm
// ==========================================

// ---------- Orçamento ----------

export interface OrcamentoItem {
  id?: string;
  orcamento_id?: string;
  ordem: number;
  qtd: number;
  descricao: string;
  metros_quadrados: number;
  valor_metro: number;
  total?: number; // computed: qtd * metros_quadrados * valor_metro
}

export type OrcamentoStatus = 'Pendente' | 'Aprovado' | 'Recusado';

export interface Orcamento {
  id: string;
  numero: string;
  data_emissao: string;
  cliente: string;
  atencao?: string;
  observacoes?: string;
  condicoes_pagamento: string;
  prazo_instalacao: string;
  status: OrcamentoStatus;
  total_geral: number;
  created_at: string;
  updated_at: string;
  itens?: OrcamentoItem[];
}

export type OrcamentoInsert = Omit<Orcamento, 'id' | 'numero' | 'created_at' | 'updated_at' | 'itens'>;

// ---------- Ordem de Serviço ----------

export interface OSItem {
  id?: string;
  ordem_servico_id?: string;
  ordem: number;
  quant: number;
  descricao: string;
  medidas?: string;
  total_metros?: number;
  valor_total: number;
}

export type OSStatus = 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada';

export interface OrdemServico {
  id: string;
  numero: string;
  data_emissao: string;
  cliente: string;
  local_servico?: string;
  orcamento_id?: string;
  data_inicio?: string;
  data_termino?: string;
  material_aplicado?: string;
  data_prevista_pagamento?: string;
  status: OSStatus;
  total_geral: number;
  created_at: string;
  updated_at: string;
  itens?: OSItem[];
  orcamento?: Orcamento; // joined
}

export type OSInsert = Omit<OrdemServico, 'id' | 'numero' | 'created_at' | 'updated_at' | 'itens' | 'orcamento'>;

// ---------- Dados bancários fixos ----------

export const DADOS_BANCARIOS = {
  banco: 'Banco Itaú S/A',
  agencia: '0149',
  conta: '26.121-6',
  titular: 'RISADA COMERCIO DE PELICULA SOLAR LTDA ME',
  pix_cnpj: '33.574.274/0001-43',
} as const;

// ---------- Dados da empresa ----------

export const EMPRESA = {
  razaoSocial: 'Risada Comércio de Película Solar LTDA',
  cnpj: '33.574.274/0001-43',
  inscEstadual: '120.057.631.117',
  endereco: 'R. Paramu, 594 - Vila Bela - SP - CEP: 03147-100',
  telefone: '(11) 98278-7205',
  site: 'www.risadafilm.com.br',
  instagram: 'risadafilm',
  facebook: 'risadafilm',
  email: 'isroquejunior@hotmail.com',
  assinantes: [
    {
      nome: 'SAMANTA CAROLINA BRONZIN DA SILVA',
      rg: '35.185.385-6 – SSP- SP',
      cpf: '362.272.098-05',
    },
    {
      nome: 'ISRAEL ROQUE DOS SANTOS JUNIOR',
      rg: '24.268.319-1 – SSP- SP',
      cpf: '174.801.518-45',
    },
  ],
} as const;
