'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { OrcamentoBalcao, DadosLojaConfig, ItemBalcao } from '@/types/balcao';
import {
  carregarConfigLoja,
  salvarConfigLoja,
  obterProximoNumero,
  salvarOrcamentoBalcao,
  listarTodosOrcamentos,
  excluirOrcamentoBalcao,
} from '@/lib/balcao/storage';
import FolhaOrcamento from './FolhaOrcamento';
import HistoricoDrawer from './HistoricoDrawer';
import ConfigLojaModal from './ConfigLojaModal';

function criarOrcamentoVazio(proximoNumero: string): OrcamentoBalcao {
  const hoje = new Date().toISOString().split('T')[0];
  const itensIniciais: ItemBalcao[] = Array.from({ length: 6 }).map((_, i) => ({
    id: `item_init_${i}_${Date.now()}`,
    produto: '',
    tonalidade: '',
    descricao: '',
    valor: 0,
  }));

  return {
    numero: proximoNumero,
    data_emissao: hoje,
    cliente: '',
    telefone: '',
    carro: '',
    placa: '',
    itens: itensIniciais,
    avarias: [],
    observacoes: '',
    garantia: '',
    total_geral: 0,
  };
}

export default function BalcaoApp() {
  const [dadosLoja, setDadosLoja] = useState<DadosLojaConfig | null>(null);
  const [listaOrcamentos, setListaOrcamentos] = useState<OrcamentoBalcao[]>([]);
  const [orcamentoAtivo, setOrcamentoAtivo] = useState<OrcamentoBalcao | null>(null);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [drawerHistoricoAberto, setDrawerHistoricoAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState<string | null>(null);

  // PWA Install prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [podeInstalar, setPodeInstalar] = useState(false);

  // 1. Carrega dados iniciais ao montar
  useEffect(() => {
    const config = carregarConfigLoja();
    setDadosLoja(config);

    listarTodosOrcamentos().then((lista) => {
      setListaOrcamentos(lista);
      const proximo = obterProximoNumero(lista);
      setOrcamentoAtivo(criarOrcamentoVazio(proximo));
    });

    // PWA listen
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPodeInstalar(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Notificação temporária
  const exibirNotificacao = useCallback((msg: string) => {
    setMensagemStatus(msg);
    setTimeout(() => {
      setMensagemStatus(null);
    }, 3500);
  }, []);

  // Salvar Orçamento
  const handleSalvar = useCallback(async () => {
    if (!orcamentoAtivo) return;
    setSalvando(true);
    try {
      const salvo = await salvarOrcamentoBalcao(orcamentoAtivo);
      setOrcamentoAtivo(salvo);

      // Atualiza lista em memória
      const atualizados = await listarTodosOrcamentos();
      setListaOrcamentos(atualizados);

      exibirNotificacao(`✓ Orçamento Nº ${salvo.numero} salvo com sucesso!`);
    } catch (err) {
      console.error(err);
      exibirNotificacao('Erro ao salvar orçamento.');
    } finally {
      setSalvando(false);
    }
  }, [orcamentoAtivo, exibirNotificacao]);

  // Novo Orçamento
  const handleNovo = useCallback(() => {
    if (!dadosLoja) return;
    const proximo = obterProximoNumero(listaOrcamentos);
    const novo = criarOrcamentoVazio(proximo);
    setOrcamentoAtivo(novo);
    exibirNotificacao(`Novo orçamento iniciado (Nº ${proximo})`);
  }, [dadosLoja, listaOrcamentos, exibirNotificacao]);

  // Imprimir
  const handleImprimir = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    window.focus();
    setTimeout(() => {
      window.print();
    }, 80);
  }, []);

  // Atalhos globais de teclado (Ctrl+S, Ctrl+P, Ctrl+N, Ctrl+H)
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSalvar();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        // window.print é chamado naturalmente, mas podemos garantir que salva antes se quiser
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNovo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setDrawerHistoricoAberto((prev) => !prev);
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleSalvar, handleNovo]);

  // Salvar configurações da loja (Endereço, etc.)
  function handleSalvarConfig(novosDados: DadosLojaConfig) {
    setDadosLoja(novosDados);
    salvarConfigLoja(novosDados);
    exibirNotificacao('✓ Dados da loja e endereço atualizados!');
  }

  // Excluir orçamento
  async function handleExcluir(id: string) {
    await excluirOrcamentoBalcao(id);
    const atualizados = await listarTodosOrcamentos();
    setListaOrcamentos(atualizados);
    if (orcamentoAtivo?.id === id) {
      handleNovo();
    }
    exibirNotificacao('Orçamento excluído.');
  }

  // Instalar PWA
  async function handleInstalarPWA() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setPodeInstalar(false);
      exibirNotificacao('Aplicativo instalado na Área de Trabalho!');
    }
    setDeferredPrompt(null);
  }

  if (!dadosLoja || !orcamentoAtivo) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center text-white font-mono text-sm">
        Carregando Risada Balcão...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-neutral-100 text-neutral-900 flex flex-col">
      {/* ========================================================= */}
      {/* BARRA DE FERRAMENTAS SUPERIOR (APENAS NA TELA - NO PRINT) */}
      {/* ========================================================= */}
      <nav className="no-print sticky top-0 z-40 bg-[#161616] border-b border-[#282828] shadow-md px-2.5 sm:px-6 py-2 w-full">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Lado Esquerdo: Número do orçamento */}
          <div className="flex items-center min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-neutral-300 truncate">
              Orç. <strong className="text-[#f5c518] font-mono text-sm sm:text-base">#{orcamentoAtivo.numero}</strong>
            </span>
          </div>

          {/* Notificação central */}
          {mensagemStatus && (
            <div className="animate-fade-in bg-amber-400/20 text-[#f5c518] border border-amber-400/40 px-2 py-0.5 rounded text-[11px] font-semibold truncate max-w-[130px] sm:max-w-none">
              {mensagemStatus}
            </div>
          )}

          {/* Lado Direito: Ações rápidas */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {podeInstalar && (
              <button
                type="button"
                onClick={handleInstalarPWA}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-2.5 py-1.5 rounded flex items-center gap-1 transition-colors shadow"
                title="Instalar Aplicativo"
              >
                <span>💻</span> <span className="hidden sm:inline">Instalar</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNovo}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded border border-[#333] transition-colors"
              title="Atalho: Ctrl + N"
            >
              + Novo
            </button>

            <button
              type="button"
              onClick={handleSalvar}
              disabled={salvando}
              className="bg-[#f5c518] hover:bg-[#e6b800] text-black text-xs font-bold px-2.5 sm:px-4 py-1.5 rounded shadow transition-all flex items-center gap-1 disabled:opacity-50"
              title="Atalho: Ctrl + S"
            >
              <span>💾</span> <span className="hidden xs:inline">{salvando ? 'Salvando...' : 'Salvar'}</span>
            </button>

            <button
              type="button"
              onClick={handleImprimir}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded transition-colors flex items-center gap-1"
              title="Atalho: Ctrl + P"
            >
              <span>🖨️</span> <span className="hidden xs:inline">Imprimir</span>
            </button>

            <button
              type="button"
              onClick={() => setDrawerHistoricoAberto(true)}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium px-2 sm:px-3 py-1.5 rounded border border-[#333] flex items-center gap-1 transition-colors"
              title="Atalho: Ctrl + H"
            >
              <span>📁</span>
              <span className="hidden sm:inline">Histórico</span>
              <span className="bg-[#333] text-neutral-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {listaOrcamentos.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setModalConfigAberto(true)}
              className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              title="Editar endereço e dados da loja"
            >
              ⚙️
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* ÁREA DE TRABALHO DA FOLHA (DOCUMENTO TELA INTEIRA / RESPONSIVO) */}
      {/* ========================================================= */}
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden bg-neutral-100 sm:bg-neutral-200 py-1 sm:py-4 px-1 sm:px-4 lg:px-8 print:p-0 print:bg-white flex flex-col items-center">
        <FolhaOrcamento
          orcamento={orcamentoAtivo}
          dadosLoja={dadosLoja}
          onChange={setOrcamentoAtivo}
          onAbrirConfigLoja={() => setModalConfigAberto(true)}
        />
      </main>

      {/* ========================================================= */}
      {/* MODAL DE CONFIGURAÇÃO DO ENDEREÇO DA LOJA */}
      {/* ========================================================= */}
      <ConfigLojaModal
        aberto={modalConfigAberto}
        dadosAtuais={dadosLoja}
        onSalvar={handleSalvarConfig}
        onFechar={() => setModalConfigAberto(false)}
      />

      {/* ========================================================= */}
      {/* GAVETA DE HISTÓRICO E BUSCA (PLACA / MÊS / CLIENTE) */}
      {/* ========================================================= */}
      <HistoricoDrawer
        aberto={drawerHistoricoAberto}
        orcamentos={listaOrcamentos}
        orcamentoAtivoId={orcamentoAtivo.id}
        onSelecionar={(orc) => setOrcamentoAtivo(orc)}
        onExcluir={handleExcluir}
        onFechar={() => setDrawerHistoricoAberto(false)}
      />
    </div>
  );
}
