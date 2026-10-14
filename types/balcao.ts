// ==========================================
// Types — Módulo Balcão / Express RisadaFilm
// ==========================================

export interface ItemBalcao {
  id: string;
  produto: string;      // ex: Cerâmica, Tintado, Alarme, Som
  tonalidade: string;   // ex: G5, G20, G35
  descricao: string;    // ex: Portas dianteiras, Parabrisa, Vigia
  valor: number;        // ex: 350.00
}

export type ZonaAvaria = 
  | 'parabrisa'
  | 'porta_diant_esq'
  | 'porta_diant_dir'
  | 'porta_tras_esq'
  | 'porta_tras_dir'
  | 'vigia_traseiro'
  | 'capo'
  | 'teto'
  | 'traseira';

export interface AvariaItem {
  zona: ZonaAvaria;
  detalhe: string;      // ex: "Risco no vidro", "Trinca", "Arranhão lataria"
}

export interface OrcamentoBalcao {
  id?: string;
  numero: string;       // ex: "001/2026"
  data_emissao: string; // YYYY-MM-DD
  cliente: string;
  telefone: string;
  carro: string;
  placa: string;
  itens: ItemBalcao[];
  avarias: AvariaItem[];
  observacoes: string;
  garantia: string;     // ex: "Garantia de 3 anos conforme certificado 3M"
  total_geral: number;
  created_at?: string;
  updated_at?: string;
}

export interface DadosLojaConfig {
  razaoSocial: string;
  cnpj: string;
  inscEstadual: string;
  endereco: string;
  telefone: string;
  email: string;
  instagram: string;
  opcoesGarantia: string[];
}

export const DADOS_LOJA_PADRAO: DadosLojaConfig = {
  razaoSocial: 'Risada Comércio de Película Solar LTDA',
  cnpj: '33.574.274/0001-43',
  inscEstadual: '120.057.831.117',
  endereco: 'Rua Costa Barros, 66 - São Paulo - SP',
  telefone: '(11) 98278-7205',
  email: 'biroquejunior@hotmail.com',
  instagram: '@risadafilm',
  opcoesGarantia: ['6 Meses', '1 Ano', '5 Anos', '10 Anos', '15 Anos'],
};
