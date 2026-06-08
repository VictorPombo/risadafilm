'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import type { Orcamento } from '@/types';
import { generateOrcamentoPDF } from '@/lib/pdf/orcamento-pdf';

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => { loadOrcamentos(); }, []);

  async function loadOrcamentos() {
    const { data } = await supabase.from('orcamentos').select('*').order('created_at', { ascending: false });
    setOrcamentos(data || []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja excluir este orçamento?')) return;
    await supabase.from('orcamentos').delete().eq('id', id);
    loadOrcamentos();
  }

  async function handleExportPDF(id: string) {
    const { data: orc } = await supabase.from('orcamentos').select('*').eq('id', id).single();
    const { data: itens } = await supabase.from('orcamento_itens').select('*').eq('orcamento_id', id).order('ordem');
    if (orc) generateOrcamentoPDF({ ...orc, itens: itens || [] });
  }

  const filtered = orcamentos
    .filter(o => filterStatus === 'todos' || o.status === filterStatus)
    .filter(o => o.cliente.toLowerCase().includes(search.toLowerCase()) || o.numero.includes(search));

  const statuses = ['todos', 'Pendente', 'Aprovado', 'Recusado'];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-xl text-[#f0f0f0]">Orçamentos</h1>
          <p className="text-[#888888] text-sm mt-0.5">{orcamentos.length} registrado(s)</p>
        </div>
        <Link href="/admin/orcamentos/novo"
          className="bg-[#f5c518] text-black font-semibold text-sm px-5 py-3 sm:px-4 sm:py-2 rounded-[4px] hover:bg-[#e6b800] transition-colors duration-150 flex items-center gap-2">
          <span className="hidden sm:inline">+ Novo Orçamento</span>
          <span className="sm:hidden text-lg leading-none">+</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-hide">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 sm:px-3 sm:py-1.5 rounded-[4px] text-[12px] sm:text-[11px] font-semibold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors duration-150 ${
                filterStatus === s
                  ? 'bg-[#f5c518] text-black'
                  : 'bg-transparent border border-[#222222] text-[#888888] hover:border-[#f5c518] hover:text-[#f5c518]'
              }`}>
              {s === 'todos' ? 'Todos' : s}
            </button>
          ))}
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
          className="px-3 py-2 rounded-[4px] text-sm w-full sm:flex-1 sm:max-w-[240px] min-h-[36px] bg-[#1a1a1a] border border-[#222222] text-[#f0f0f0] focus:outline-none focus:border-[#f5c518] transition-colors duration-150" />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 rounded-full animate-spin border-[#222222] border-t-[#f5c518]" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-16 text-sm text-[#888888]">Nenhum orçamento encontrado.</p>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block rounded-[6px] overflow-hidden bg-[#111111] border border-[#222222]">
            <table>
              <thead>
                <tr className="border-b border-[#222222]">
                  <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-[#888888]">Nº</th>
                  <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-[#888888]">Cliente</th>
                  <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-[#888888]">Data</th>
                  <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-[0.1em] text-[#888888]">Total</th>
                  <th className="px-5 py-3 text-center text-[11px] font-medium uppercase tracking-[0.1em] text-[#888888]">Status</th>
                  <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-[0.1em] text-[#888888]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((orc) => (
                  <tr key={orc.id} className="border-b border-[#222222] last:border-b-0 hover:bg-[#1a1a1a] transition-colors duration-[120ms]">
                    <td className="px-5 py-3 text-sm font-semibold text-[#f5c518]">{orc.numero}</td>
                    <td className="px-5 py-3 text-sm">{orc.cliente}</td>
                    <td className="px-5 py-3 text-sm text-[#888888]">{formatDate(orc.data_emissao)}</td>
                    <td className="px-5 py-3 text-sm text-right font-mono font-medium">{formatCurrency(orc.total_geral)}</td>
                    <td className="px-5 py-3 text-center"><StatusBadge status={orc.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <Link href={`/admin/orcamentos/${orc.id}`} className="px-2.5 py-1 rounded-[4px] text-xs font-medium border border-[#222222] text-[#888888] hover:border-[#f5c518] hover:text-[#f5c518] transition-colors duration-150">Editar</Link>
                        <button onClick={() => handleExportPDF(orc.id)} className="px-2.5 py-1 rounded-[4px] text-xs font-medium border border-[#222222] text-[#888888] hover:border-[#f5c518] hover:text-[#f5c518] transition-colors duration-150 cursor-pointer">PDF</button>
                        <button onClick={() => handleDelete(orc.id)} className="px-2.5 py-1 rounded-[4px] text-xs font-medium border border-[#e53e3e] text-[#e53e3e] cursor-pointer transition-colors duration-150">Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-4">
            {filtered.map((orc) => (
              <div key={orc.id} className="rounded-[8px] p-4 bg-[#111111] border border-[#222222] shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-sm font-semibold text-[#f5c518] break-words">{orc.numero}</span>
                    <p className="text-base font-medium mt-1 leading-tight break-words">{orc.cliente}</p>
                  </div>
                  <div className="ml-3 shrink-0"><StatusBadge status={orc.status} /></div>
                </div>
                
                <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-[#1f1f1f]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg font-semibold text-white">{formatCurrency(orc.total_geral)}</span>
                    <span className="text-sm text-[#888888]">{formatDate(orc.data_emissao)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/admin/orcamentos/${orc.id}`} className="flex justify-center items-center py-3 rounded-[6px] text-[14px] font-semibold border border-[#222222] bg-[#1a1a1a] text-[#888888] active:bg-[#222]">
                      Editar
                    </Link>
                    <button onClick={() => handleExportPDF(orc.id)} className="flex justify-center items-center py-3 rounded-[6px] text-[14px] font-semibold border border-[#222222] bg-[#1a1a1a] text-[#888888] active:bg-[#222]">
                      Gerar PDF
                    </button>
                    <button onClick={() => handleDelete(orc.id)} className="col-span-2 flex justify-center items-center py-3 rounded-[6px] text-[14px] font-semibold border border-[#e53e3e] bg-[rgba(229,62,62,0.05)] text-[#e53e3e] active:bg-[rgba(229,62,62,0.15)]">
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
