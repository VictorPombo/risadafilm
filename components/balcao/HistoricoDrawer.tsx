'use client';

import React, { useState, useMemo } from 'react';
import type { OrcamentoBalcao } from '@/types/balcao';

interface HistoricoDrawerProps {
  aberto: boolean;
  orcamentos: OrcamentoBalcao[];
  orcamentoAtivoId?: string;
  onSelecionar: (orc: OrcamentoBalcao) => void;
  onExcluir: (id: string) => void;
  onFechar: () => void;
}

export default function HistoricoDrawer({
  aberto,
  orcamentos,
  orcamentoAtivoId,
  onSelecionar,
  onExcluir,
  onFechar,
}: HistoricoDrawerProps) {
  const [busca, setBusca] = useState('');
  const [mesFiltro, setMesFiltro] = useState('todos');

  // Extrai lista única de meses disponíveis (YYYY-MM)
  const mesesDisponiveis = useMemo(() => {
    const setMeses = new Set<string>();
    for (const orc of orcamentos) {
      if (orc.data_emissao) {
        const pedaco = orc.data_emissao.substring(0, 7); // "2026-08"
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm no-print animate-fade-in">
      <div className="bg-[#141414] border-l border-[#2e2e2e] w-full max-w-md h-full flex flex-col shadow-2xl text-neutral-100">
        {/* Topo do Drawer */}
        <div className="p-4 border-b border-[#2e2e2e] bg-[#1a1a1a]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-bold text-base text-[#f5c518] flex items-center gap-2">
                <span>📁</span> Histórico de Orçamentos
              </h2>
              <p className="text-xs text-neutral-400">
                {orcamentos.length} orçamento(s) registrado(s)
              </p>
            </div>
            <button
              onClick={onFechar}
              className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 text-lg leading-none"
            >
              ✕
            </button>
          </div>

          {/* Campo de Busca Rápida (Placa / Nome / Carro) */}
          <div className="space-y-2 mt-3">
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Buscar por PLACA, cliente, carro ou tel..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#0a0a0a] border border-[#333] rounded text-xs text-white placeholder-neutral-500 focus:border-[#f5c518]"
              />
              <span className="absolute left-2.5 top-1.5 text-neutral-500 text-xs">🔍</span>
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  className="absolute right-2.5 top-1.5 text-neutral-400 hover:text-white text-xs"
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
                  className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-colors ${
                    mesFiltro === 'todos'
                      ? 'bg-[#f5c518] text-black font-bold'
                      : 'bg-[#222] text-neutral-300 hover:bg-[#333]'
                  }`}
                >
                  Todos
                </button>
                {mesesDisponiveis.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMesFiltro(m)}
                    className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-colors ${
                      mesFiltro === m
                        ? 'bg-[#f5c518] text-black font-bold'
                        : 'bg-[#222] text-neutral-300 hover:bg-[#333]'
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
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtrados.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs">
              <p className="text-2xl mb-1">🔍</p>
              Nenhum orçamento encontrado com esses termos.
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
                  className={`p-3 rounded-lg border transition-all cursor-pointer text-xs ${
                    ativo
                      ? 'bg-[#252210] border-[#f5c518] shadow-md'
                      : 'bg-[#181818] border-[#2c2c2c] hover:border-neutral-500 hover:bg-[#1f1f1f]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#f5c518] font-mono text-[11px]">
                      Nº {orc.numero}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {orc.data_emissao}
                    </span>
                  </div>

                  <div className="font-semibold text-white truncate text-sm mb-0.5">
                    {orc.cliente || 'Consumidor sem nome'}
                  </div>

                  {/* Detalhes do Carro e Placa em Destaque */}
                  <div className="flex flex-wrap gap-1.5 items-center my-1.5">
                    {orc.placa && (
                      <span className="bg-amber-400/20 text-[#f5c518] font-bold px-1.5 py-0.5 rounded text-[10px] border border-amber-400/30 uppercase">
                        Placa: {orc.placa}
                      </span>
                    )}
                    {orc.carro && (
                      <span className="bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded text-[10px]">
                        {orc.carro}
                      </span>
                    )}
                    {orc.telefone && (
                      <span className="text-neutral-400 text-[10px]">
                        Tel: {orc.telefone}
                      </span>
                    )}
                  </div>

                  {/* Resumo de Avarias e Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#292929] mt-2">
                    <div className="text-[10px] text-neutral-400">
                      {orc.avarias?.length ? (
                        <span className="text-red-400 font-semibold">
                          ⚠️ {orc.avarias.length} avaria(s)
                        </span>
                      ) : (
                        <span className="text-neutral-500">Sem avarias</span>
                      )}
                    </div>
                    <div className="font-bold text-white text-xs">
                      {Number(orc.total_geral || 0).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </div>
                  </div>

                  {/* Botão de Excluir */}
                  <div className="flex justify-end mt-2 pt-1 border-t border-[#222]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Deseja realmente excluir o orçamento Nº ${orc.numero}?`)) {
                          if (orc.id) onExcluir(orc.id);
                        }
                      }}
                      className="text-neutral-500 hover:text-red-400 text-[10px]"
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
