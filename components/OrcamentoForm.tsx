'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { formatCurrency, formatDecimal, parseDecimal, todayISO } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import type { Orcamento, OrcamentoStatus } from '@/types';

interface Props { orcamento?: Orcamento; }

interface ItemRow {
  id?: string;
  qtd: string;
  descricao: string;
  valor_metro: string;
}

const emptyRow = (): ItemRow => ({ qtd: '1', descricao: '', valor_metro: '' });

const labelCls = "block text-[12px] uppercase tracking-[0.08em] text-[#888888] mb-2 font-semibold";
const inputCls = "w-full bg-[#0f0f0f] border-2 border-[#2a2a2a] rounded-lg px-4 py-3.5 text-[15px] text-[#f0f0f0] focus:outline-none focus:border-[#f5c518] focus:bg-[#141414] transition-all duration-200 placeholder:text-[#555]";
const containerCls = "bg-[#141414] border border-[#242424] rounded-xl p-6 sm:p-8 mb-8 shadow-xl shadow-black/20";
const sectionTitleCls = "font-display text-lg font-semibold text-[#f0f0f0] mb-6 border-b border-[#1f1f1f] pb-4";

export default function OrcamentoForm({ orcamento }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!orcamento;

  const [cliente, setCliente] = useState(orcamento?.cliente || '');
  const [atencao, setAtencao] = useState(orcamento?.atencao || '');
  const [dataEmissao, setDataEmissao] = useState(orcamento?.data_emissao || todayISO());
  const [observacoes, setObservacoes] = useState(orcamento?.observacoes || '');
  const [condicoesPagamento, setCondicoesPagamento] = useState(orcamento?.condicoes_pagamento || 'A COMBINAR');
  const [prazoInstalacao, setPrazoInstalacao] = useState(orcamento?.prazo_instalacao || '05 dias úteis após aprovação');
  const [status, setStatus] = useState<OrcamentoStatus>(orcamento?.status || 'Pendente');
  const [itens, setItens] = useState<ItemRow[]>([emptyRow()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orcamento?.itens && orcamento.itens.length > 0) {
      setItens(orcamento.itens.sort((a, b) => a.ordem - b.ordem).map((item) => ({
        id: item.id, qtd: item.qtd.toString(), descricao: item.descricao,
        valor_metro: formatDecimal(item.valor_metro),
      })));
    }
  }, [orcamento]);

  /** Extrai m² da descrição (ex: 765 x 2545 → 1,95 m² | 200x200 → 4,00 m²) */
  function calcM2(desc: string): number {
    const match = desc.match(/(\d+)\s*[xX×]\s*(\d+)/);
    if (match) {
      const val1 = parseFloat(match[1]);
      const val2 = parseFloat(match[2]);
      // Se alguma dimensão > 500, assume milímetros; senão, centímetros
      const divisor = (val1 > 500 || val2 > 500) ? 1000 : 100;
      return (val1 / divisor) * (val2 / divisor);
    }
    return 0;
  }

  const calcRowTotal = (row: ItemRow): number => {
    const qtd = row.qtd === '' ? 1 : (parseInt(row.qtd) || 0);
    const m2 = calcM2(row.descricao);
    return qtd * m2 * parseDecimal(row.valor_metro);
  };

  const totalGeral = itens.reduce((sum, r) => sum + calcRowTotal(r), 0);

  const updateItem = (i: number, field: keyof ItemRow, value: string) => {
    const n = [...itens]; n[i] = { ...n[i], [field]: value }; setItens(n);
  };
  const addRow = () => setItens([...itens, emptyRow()]);
  const removeRow = (i: number) => { if (itens.length > 1) setItens(itens.filter((_, idx) => idx !== i)); };

  const validate = (): string | null => {
    if (!cliente.trim()) return 'Cliente é obrigatório.';
    const valid = itens.filter(r => r.descricao.trim());
    if (valid.length === 0) return 'Adicione pelo menos 1 item.';
    for (const [i, row] of valid.entries()) {
      const qtd = row.qtd === '' ? 1 : (parseInt(row.qtd) || 0);
      if (qtd <= 0) return `Item ${i + 1}: Qtd > 0.`;
      if (calcM2(row.descricao) <= 0) return `Item ${i + 1}: Inclua medidas na descrição (ex: 765 x 2545).`;
      if (parseDecimal(row.valor_metro) <= 0) return `Item ${i + 1}: Valor m² > 0.`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setSaving(true);
    try {
      const valid = itens.filter(r => r.descricao.trim());
      if (isEditing) {
        await supabase.from('orcamentos').update({
          cliente, atencao: atencao || null, data_emissao: dataEmissao,
          observacoes: observacoes || null, condicoes_pagamento: condicoesPagamento,
          prazo_instalacao: prazoInstalacao, status, total_geral: totalGeral,
          updated_at: new Date().toISOString(),
        }).eq('id', orcamento!.id);
        await supabase.from('orcamento_itens').delete().eq('orcamento_id', orcamento!.id);
        await supabase.from('orcamento_itens').insert(valid.map((row, i) => ({
          orcamento_id: orcamento!.id, ordem: i, qtd: row.qtd === '' ? 1 : (parseInt(row.qtd) || 0),
          descricao: row.descricao, metros_quadrados: calcM2(row.descricao),
          valor_metro: parseDecimal(row.valor_metro),
        })));
      } else {
        const { data: numData } = await supabase.rpc('gerar_proximo_numero', { p_tipo: 'orcamento' });
        const { data: orcData } = await supabase.from('orcamentos').insert({
          numero: numData, cliente, atencao: atencao || null, data_emissao: dataEmissao,
          observacoes: observacoes || null, condicoes_pagamento: condicoesPagamento,
          prazo_instalacao: prazoInstalacao, status, total_geral: totalGeral,
        }).select('id').single();
        if (orcData) await supabase.from('orcamento_itens').insert(valid.map((row, i) => ({
          orcamento_id: orcData.id, ordem: i, qtd: row.qtd === '' ? 1 : (parseInt(row.qtd) || 0),
          descricao: row.descricao, metros_quadrados: calcM2(row.descricao),
          valor_metro: parseDecimal(row.valor_metro),
        })));
      }
      router.push('/admin/orcamentos'); router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto animate-fade-in pb-32 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#f0f0f0] tracking-tight">
            {isEditing ? `Orçamento ${orcamento!.numero}` : 'Novo Orçamento'}
          </h1>
          {isEditing && <div className="mt-2"><StatusBadge status={orcamento!.status} /></div>}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="px-6 py-3 rounded-lg text-[15px] font-semibold cursor-pointer min-h-[48px] bg-transparent border-2 border-[#2a2a2a] text-[#888888] hover:border-[#f5c518] hover:text-[#f5c518] transition-all duration-200 hidden sm:block">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="px-8 py-3 rounded-lg text-[15px] font-bold cursor-pointer disabled:opacity-50 min-h-[48px] bg-[#f5c518] text-black hover:bg-[#e0b213] hover:scale-[0.98] transition-all duration-200 shadow-xl shadow-[#f5c518]/20 hidden sm:block">
            {saving ? 'Salvando...' : isEditing ? 'Atualizar Orçamento' : 'Criar Orçamento'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#e53e3e]/10 border border-[#e53e3e]/20 rounded-[6px]">
          <p className="text-sm text-[#e53e3e] font-medium">{error}</p>
        </div>
      )}

      {/* Fields */}
      <div className={containerCls}>
        <h2 className={sectionTitleCls}>Dados Principais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
          <div><label className={labelCls}>Cliente *</label><input value={cliente} onChange={e => setCliente(e.target.value)} required className={inputCls} placeholder="Nome do cliente" /></div>
          <div><label className={labelCls}>A/C</label><input value={atencao} onChange={e => setAtencao(e.target.value)} className={inputCls} placeholder="Aos cuidados de (opcional)" /></div>
          <div><label className={labelCls}>Data Emissão</label><input type="date" value={dataEmissao} onChange={e => setDataEmissao(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Status</label><select value={status} onChange={e => setStatus(e.target.value as OrcamentoStatus)} className={inputCls}><option value="Pendente">Pendente</option><option value="Aprovado">Aprovado</option><option value="Recusado">Recusado</option></select></div>
          <div><label className={labelCls}>Cond. Pagamento</label><input value={condicoesPagamento} onChange={e => setCondicoesPagamento(e.target.value)} className={inputCls} placeholder="Ex: A combinar" /></div>
          <div><label className={labelCls}>Prazo Instalação</label><input value={prazoInstalacao} onChange={e => setPrazoInstalacao(e.target.value)} className={inputCls} placeholder="Ex: 05 dias úteis" /></div>
        </div>
      </div>

      {/* Items */}
      <div className={containerCls}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-[#1f1f1f] pb-4">
          <h2 className="font-display text-[15px] font-semibold text-[#f0f0f0]">Itens do Orçamento</h2>
          <button type="button" onClick={addRow}
            className="mt-3 sm:mt-0 px-5 py-2.5 rounded-lg text-[13px] font-bold uppercase tracking-wider cursor-pointer bg-[#2a2a2a] text-[#f0f0f0] hover:bg-[#3a3a3a] hover:text-[#f5c518] transition-all duration-200 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Adicionar Item
          </button>
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#222222]">
                <th className="px-2 py-4 text-left text-[12px] font-semibold uppercase tracking-[0.1em] text-[#888888] w-24">Qtd</th>
                <th className="px-4 py-4 text-left text-[12px] font-semibold uppercase tracking-[0.1em] text-[#888888]">Descrição</th>
                <th className="px-4 py-4 text-center text-[12px] font-semibold uppercase tracking-[0.1em] text-[#888888] w-28">m²</th>
                <th className="px-4 py-4 text-right text-[12px] font-semibold uppercase tracking-[0.1em] text-[#888888] w-44">Valor / m²</th>
                <th className="px-4 py-4 text-right text-[12px] font-semibold uppercase tracking-[0.1em] text-[#f5c518] w-44">Total</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {itens.map((row, i) => (
                <tr key={i} className="group hover:bg-[#1a1a1a]/50 transition-colors">
                  <td className="px-2 py-4"><input type="number" min="1" value={row.qtd} onChange={e => updateItem(i, 'qtd', e.target.value)} className="w-full px-4 py-3 text-[15px] text-center bg-[#0f0f0f] border-2 border-[#2a2a2a] rounded-lg text-[#f0f0f0] focus:border-[#f5c518] focus:bg-[#141414] focus:outline-none transition-all duration-200" placeholder="1" /></td>
                  <td className="px-4 py-4"><input value={row.descricao} onChange={e => updateItem(i, 'descricao', e.target.value)} className="w-full px-4 py-3 text-[15px] bg-[#0f0f0f] border-2 border-[#2a2a2a] rounded-lg text-[#f0f0f0] focus:border-[#f5c518] focus:bg-[#141414] focus:outline-none transition-all duration-200 placeholder:text-[#555]" placeholder="Ex: Película 765 x 2545" /></td>
                  <td className="px-4 py-4 text-center font-medium text-[15px] text-[#aaa] align-middle">{formatDecimal(calcM2(row.descricao))} m²</td>
                  <td className="px-4 py-4"><input value={row.valor_metro} onChange={e => updateItem(i, 'valor_metro', e.target.value)} className="w-full px-4 py-3 text-[15px] text-right bg-[#0f0f0f] border-2 border-[#2a2a2a] rounded-lg text-[#f0f0f0] focus:border-[#f5c518] focus:bg-[#141414] focus:outline-none transition-all duration-200 placeholder:text-[#555]" placeholder="R$ 0,00" /></td>
                  <td className="px-4 py-4 text-right font-mono text-[16px] font-bold text-[#f5c518] align-middle">{formatCurrency(calcRowTotal(row))}</td>
                  <td className="px-2 py-4 text-center align-middle">
                    {itens.length > 1 && (
                      <button type="button" onClick={() => removeRow(i)} className="p-2 cursor-pointer text-[#666] hover:text-[#e53e3e] hover:bg-[#e53e3e]/10 rounded-lg transition-colors" title="Remover item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#2a2a2a] bg-[#1a1a1a]/30">
                <td colSpan={4} className="px-4 py-6 text-right text-[15px] font-bold uppercase tracking-widest text-[#888888]">Valor Total</td>
                <td className="px-4 py-6 text-right font-mono text-2xl font-bold text-[#f5c518]">{formatCurrency(totalGeral)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-[#222222]">
          {itens.map((row, i) => (
            <div key={i} className="py-5 relative">
              {itens.length > 1 && <button type="button" onClick={() => removeRow(i)} className="absolute top-5 right-1 p-2 cursor-pointer text-[#e53e3e] hover:bg-[#e53e3e]/10 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>}
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-4">Item {i + 1}</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#888] mb-2">Descrição</label>
                  <input value={row.descricao} onChange={e => updateItem(i, 'descricao', e.target.value)} className={inputCls} placeholder="O que será feito?" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#888] mb-2">Qtd</label>
                    <input type="number" min="1" value={row.qtd} onChange={e => updateItem(i, 'qtd', e.target.value)} className={inputCls} placeholder="1" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#888] mb-2">m²</label>
                    <div className="w-full bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-lg px-4 py-3.5 text-[15px] text-[#aaa] text-center font-medium">
                      {formatDecimal(calcM2(row.descricao))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#888] mb-2">R$/m²</label>
                    <input value={row.valor_metro} onChange={e => updateItem(i, 'valor_metro', e.target.value)} className={inputCls} placeholder="R$" />
                  </div>
                </div>
                <div className="flex justify-between items-center bg-[#0f0f0f] p-4 rounded-lg border-2 border-[#1f1f1f] mt-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#888]">Total do Item</span>
                  <p className="text-right font-mono text-[16px] font-bold text-[#f5c518]">{formatCurrency(calcRowTotal(row))}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="py-5 flex items-center justify-between border-t border-[#2a2a2a] mt-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#888]">Valor Total</span>
            <span className="font-mono text-2xl font-bold text-[#f5c518]">{formatCurrency(totalGeral)}</span>
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className={containerCls}>
        <h2 className={sectionTitleCls}>Observações (Opcional)</h2>
        <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={4}
          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-[6px] px-4 py-3 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#f5c518] transition-colors duration-150 resize-none leading-relaxed"
          placeholder="Condições especiais, detalhes de instalação, etc..." />
      </div>
      
      {/* Footer Buttons Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#111111]/95 backdrop-blur-md border-t border-[#222222] z-50 flex sm:hidden gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button type="button" onClick={() => router.back()}
            className="flex-1 py-4 rounded-lg text-[15px] font-semibold cursor-pointer bg-transparent border-2 border-[#2a2a2a] text-[#888888] active:bg-[#1a1a1a]">
            Cancelar
        </button>
        <button type="submit" disabled={saving}
            className="flex-1 py-4 rounded-lg text-[15px] font-bold cursor-pointer disabled:opacity-50 bg-[#f5c518] text-black active:bg-[#e0b213]">
            {saving ? '...' : isEditing ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
