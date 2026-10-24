'use client';

import React, { useState, useMemo, useRef } from 'react';
import type { OrcamentoBalcao } from '@/types/balcao';

interface HistoricoDrawerProps {
  aberto: boolean;
  orcamentos: OrcamentoBalcao[];
  orcamentoAtivoId?: string;
  onSelecionar: (orc: OrcamentoBalcao) => void;
  onExcluir: (id: string) => void;
  onExportarBackup?: () => void;
  onImportarBackup?: (conteudoJSON: string) => void;
  onFechar: () => void;
}

export default function HistoricoDrawer({
  aberto,
  orcamentos,
  orcamentoAtivoId,
  onSelecionar,
  onExcluir,
  onExportarBackup,
  onImportarBackup,
  onFechar,
}: HistoricoDrawerProps) {
  const [busca, setBusca] = useState('');
  const [mesFiltro, setMesFiltro] = useState('todos');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extrai lista única de meses disponíveis (YYYY-MM)
  const mesesDisponiveis = useMemo(() => {
    const setMeses = new Set<string>();
    for (const orc of orcamentos) {
      if (orc.data_emissao) {
        const pedaco = orc.data_emissao.substring(0, 7);
        if (pedaco.length === 7) setMeses.add(pedaco);
      }
    }
    return Array.from(setMeses).sort().reverse();
  }, [orcamentos]);

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return orcamentos.filter((orc) => {
      // Filtro de mês
      if (mesFiltro !== 'todos') {
        if (!orc.data_emissao.startsWith(mesFiltro)) return false;
      }

      // Filtro de texto (Placa, Cliente, Carro, Telefone, Número)
      if (!termo) return true;
      return (
        orc.cliente.toLowerCase().includes(termo) ||
        orc.placa.toLowerCase().includes(termo) ||
        orc.carro.toLowerCase().includes(termo) ||
        orc.telefone.toLowerCase().includes(termo) ||
        orc.numero.toLowerCase().includes(termo)
      );
    });
  }, [orcamentos, busca, mesFiltro]);

  if (!aberto) return null;

  function formatarMesNome(yyyyMm: string): string {
    const [ano, mes] = yyyyMm.split('-');
    const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const idx = parseInt(mes, 10) - 1;
    return `${nomes[idx] || mes}/${ano}`;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && onImportarBackup) {
        onImportarBackup(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm no-print animate-fade-in">
      <div className="bg-white border-l border-neutral-200 w-full max-w-md h-full flex flex-col shadow-2xl text-neutral-900">
        {/* Topo do Drawer */}
        <div className="p-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                <span className="p-1 bg-amber-400 rounded text-black text-sm">📁</span> Histórico de Orçamentos
              </h2>
              <p className="text-xs text-neutral-600 font-medium mt-0.5">
                {orcamentos.length} orçamento(s) registrado(s)
              </p>
            </div>
            <button
              onClick={onFechar}
              className="text-neutral-500 hover:text-neutral-900 p-1.5 rounded hover:bg-neutral-200 text-lg leading-none transition-colors"
              title="Fechar histórico"
            >
              ✕
            </button>
          </div>

          {/* Botões de Ação de Backup (Anti-Perda) */}
          <div className="flex items-center gap-2 my-2">
            {onExportarBackup && (
              <button
                type="button"
                onClick={onExportarBackup}
                className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[11px] font-semibold py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-colors border border-neutral-300 shadow-2xs"
                title="Baixar cópia de segurança de todos os orçamentos (para pendrive ou PC)"
              >
                <span>📥</span> Baixar Backup (.json)
              </button>
            )}

            {onImportarBackup && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[11px] font-semibold py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-colors border border-neutral-300 shadow-2xs"
                  title="Restaurar backup do pendrive"
                >
                  <span>📤</span> Importar Backup
                </button>
              </>
            )}
          </div>

          {/* Campo de Busca Rápida (Placa / Nome / Carro) */}
          <div className="space-y-2 mt-2">
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Buscar por PLACA, cliente, carro ou tel..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-sm outline-none"
              />
              <span className="absolute left-2.5 top-2 text-neutral-400 text-xs">🔍</span>
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filtro por Mês */}
            {mesesDisponiveis.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setMesFiltro('todos')}
                  className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors border ${
                    mesFiltro === 'todos'
                      ? 'bg-amber-400 border-amber-500 text-neutral-950 font-bold shadow-xs'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Todos
                </button>
                {mesesDisponiveis.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMesFiltro(m)}
                    className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors border ${
                      mesFiltro === m
                        ? 'bg-amber-400 border-amber-500 text-neutral-950 font-bold shadow-xs'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {formatarMesNome(m)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lista de Registros */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-neutral-100/50">
          {filtrados.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 text-xs">
              <p className="text-3xl mb-2">🔍</p>
              <p className="font-semibold text-neutral-700">Nenhum orçamento encontrado</p>
              <p className="text-neutral-500 text-[11px] mt-0.5">Tente buscar por outra placa ou nome.</p>
            </div>
          ) : (
            filtrados.map((orc) => {
              const ativo = orcamentoAtivoId === orc.id;
              return (
                <div
                  key={orc.id || orc.numero}
                  onClick={() => {
                    onSelecionar(orc);
                    onFechar();
                  }}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer text-xs shadow-xs ${
                    ativo
                      ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/30'
                      : 'bg-white border-neutral-200 hover:border-amber-300 hover:bg-amber-50/30 hover:shadow'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-amber-700 font-mono text-[11px] bg-amber-100/80 px-1.5 py-0.5 rounded">
                      Nº {orc.numero}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      {orc.data_emissao}
                    </span>
                  </div>

                  <div className="font-bold text-neutral-900 truncate text-sm mb-1">
                    {orc.cliente || 'Consumidor sem nome'}
                  </div>

                  {/* Detalhes do Carro e Placa em Destaque */}
                  <div className="flex flex-wrap gap-1.5 items-center my-1.5">
                    {orc.placa && (
                      <span className="bg-amber-400 text-neutral-950 font-black px-2 py-0.5 rounded text-[11px] uppercase tracking-wider shadow-xs">
                        {orc.placa}
                      </span>
                    )}
                    {orc.carro && (
                      <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded text-[11px] border border-neutral-200 font-semibold">
                        🚗 {orc.carro}
                      </span>
                    )}
                    {orc.telefone && (
                      <span className="text-neutral-600 text-[11px] font-medium">
                        📞 {orc.telefone}
                      </span>
                    )}
                  </div>

                  {/* Resumo de Avarias e Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 mt-2">
                    <div className="text-[11px]">
                      {orc.avarias?.length ? (
                        <span className="text-red-600 font-bold flex items-center gap-1">
                          ⚠️ {orc.avarias.length} avaria(s)
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">✓ Sem avarias</span>
                      )}
                    </div>
                    <div className="font-black text-neutral-950 text-sm">
                      {Number(orc.total_geral || 0).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </div>
                  </div>

                  {/* Botão de Excluir */}
                  <div className="flex justify-end mt-2 pt-1.5 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Deseja realmente excluir o orçamento Nº ${orc.numero}?`)) {
                          if (orc.id) onExcluir(orc.id);
                        }
                      }}
                      className="text-neutral-400 hover:text-red-600 hover:bg-red-50 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
