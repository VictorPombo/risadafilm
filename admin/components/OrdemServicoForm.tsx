'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { formatCurrency, formatDecimal, parseDecimal, todayISO } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import type { OrdemServico, OSStatus } from '@/types';

interface Props { ordemServico?: OrdemServico; }
interface ItemRow { id?: string; quant: string; descricao: string; medidas: string; total_metros: string; valor_total: string; }
interface OrcamentoOption { id: string; numero: string; cliente: string; }

const emptyRow = (): ItemRow => ({ quant: '1', descricao: '', medidas: '', total_metros: '', valor_total: '' });

const labelCls = "block text-[11px] uppercase tracking-[0.08em] text-[#888888] mb-2 font-medium";
const inputCls = "w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-[6px] px-4 py-3 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#f5c518] transition-colors duration-150";
const containerCls = "bg-[#141414] border border-[#242424] rounded-[10px] p-6 sm:p-8 mb-8 shadow-sm";
const sectionTitleCls = "font-display text-[15px] font-semibold text-[#f0f0f0] mb-6 border-b border-[#1f1f1f] pb-4";

export default function OrdemServicoForm({ ordemServico }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!ordemServico;

  const [cliente, setCliente] = useState(ordemServico?.cliente || '');
  const [localServico, setLocalServico] = useState(ordemServico?.local_servico || '');
  const [dataEmissao, setDataEmissao] = useState(ordemServico?.data_emissao || todayISO());
  const [orcamentoId, setOrcamentoId] = useState(ordemServico?.orcamento_id || '');
  const [dataInicio, setDataInicio] = useState(ordemServico?.data_inicio || '');
  const [dataTermino, setDataTermino] = useState(ordemServico?.data_termino || '');
  const [materialAplicado, setMaterialAplicado] = useState(ordemServico?.material_aplicado || '');
  const [dataPrevistaPagamento, setDataPrevistaPagamento] = useState(ordemServico?.data_prevista_pagamento || '');
  const [status, setStatus] = useState<OSStatus>(ordemServico?.status || 'Aberta');
  const [itens, setItens] = useState<ItemRow[]>([emptyRow()]);
  const [orcamentos, setOrcamentos] = useState<OrcamentoOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadOrcamentos(); }, []);
  useEffect(() => {
    if (ordemServico?.itens && ordemServico.itens.length > 0) {
      setItens(ordemServico.itens.sort((a, b) => a.ordem - b.ordem).map((item) => ({
        id: item.id, quant: item.quant.toString(), descricao: item.descricao,
        medidas: item.medidas || '', total_metros: item.total_metros ? formatDecimal(item.total_metros) : '',
        valor_total: formatDecimal(item.valor_total),
      })));
    }
  }, [ordemServico]);

  async function loadOrcamentos() {
    const { data } = await supabase.from('orcamentos').select('id, numero, cliente').eq('status', 'Aprovado').order('created_at', { ascending: false });
    setOrcamentos(data || []);
  }

  const totalGeral = itens.reduce((sum, r) => sum + parseDecimal(r.valor_total), 0);
  const updateItem = (i: number, field: keyof ItemRow, value: string) => { const n = [...itens]; n[i] = { ...n[i], [field]: value }; setItens(n); };
  const addRow = () => setItens([...itens, emptyRow()]);
  const removeRow = (i: number) => { if (itens.length > 1) setItens(itens.filter((_, idx) => idx !== i)); };

  const validate = (): string | null => {
    if (!cliente.trim()) return 'Cliente é obrigatório.';
    const valid = itens.filter(r => r.descricao.trim());
    if (valid.length === 0) return 'Adicione pelo menos 1 item.';
    for (const [i, row] of valid.entries()) {
      const quant = row.quant === '' ? 1 : (parseInt(row.quant) || 0);
      if (quant <= 0) return `Item ${i + 1}: Quantidade > 0.`;
      if (parseDecimal(row.valor_total) <= 0) return `Item ${i + 1}: Valor Total > 0.`;
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
        await supabase.from('ordens_servico').update({
          cliente, local_servico: localServico || null, data_emissao: dataEmissao,
          orcamento_id: orcamentoId || null, data_inicio: dataInicio || null,
          data_termino: dataTermino || null, material_aplicado: materialAplicado || null,
          data_prevista_pagamento: dataPrevistaPagamento || null,
          status, total_geral: totalGeral, updated_at: new Date().toISOString(),
        }).eq('id', ordemServico!.id);
        await supabase.from('os_itens').delete().eq('ordem_servico_id', ordemServico!.id);
        await supabase.from('os_itens').insert(valid.map((row, i) => ({
          ordem_servico_id: ordemServico!.id, ordem: i, quant: row.quant === '' ? 1 : parseInt(row.quant),
          descricao: row.descricao, medidas: row.medidas || null,
          total_metros: parseDecimal(row.total_metros) || null, valor_total: parseDecimal(row.valor_total),
        })));
      } else {
        const { data: numData } = await supabase.rpc('gerar_proximo_numero', { p_tipo: 'os' });
        const { data: osData } = await supabase.from('ordens_servico').insert({
          numero: numData, cliente, local_servico: localServico || null, data_emissao: dataEmissao,
          orcamento_id: orcamentoId || null, data_inicio: dataInicio || null,
          data_termino: dataTermino || null, material_aplicado: materialAplicado || null,
          data_prevista_pagamento: dataPrevistaPagamento || null, status, total_geral: totalGeral,
        }).select('id').single();
        if (osData) await supabase.from('os_itens').insert(valid.map((row, i) => ({
          ordem_servico_id: osData.id, ordem: i, quant: row.quant === '' ? 1 : parseInt(row.quant),
          descricao: row.descricao, medidas: row.medidas || null,
          total_metros: parseDecimal(row.total_metros) || null, valor_total: parseDecimal(row.valor_total),
        })));
      }
      router.push('/ordens-servico'); router.refresh();
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
            {isEditing ? `OS ${ordemServico!.numero}` : 'Nova Ordem de Serviço'}
          </h1>
          {isEditing && <div className="mt-2"><StatusBadge status={ordemServico!.status} /></div>}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="px-5 py-2.5 rounded-[6px] text-sm font-medium cursor-pointer min-h-[44px] bg-transparent border border-[#2a2a2a] text-[#888888] hover:border-[#f5c518] hover:text-[#f5c518] transition-all duration-150 hidden sm:block">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-[6px] text-sm font-semibold cursor-pointer disabled:opacity-50 min-h-[44px] bg-[#f5c518] text-black hover:bg-[#e0b213] hover:scale-[0.98] transition-all duration-150 shadow-lg shadow-[#f5c518]/10 hidden sm:block">
            {saving ? 'Salvando...' : isEditing ? 'Atualizar OS' : 'Criar OS'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#e53e3e]/10 border border-[#e53e3e]/20 rounded-[6px]">
          <p className="text-sm text-[#e53e3e] font-medium">{error}</p>
        </div>
      )}

      {/* Dados */}
      <div className={containerCls}>
        <h2 className={sectionTitleCls}>Dados Principais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
          <div><label className={labelCls}>Cliente *</label><input value={cliente} onChange={e => setCliente(e.target.value)} required className={inputCls} placeholder="Nome do cliente" /></div>
          <div><label className={labelCls}>Local</label><input value={localServico} onChange={e => setLocalServico(e.target.value)} className={inputCls} placeholder="Endereço" /></div>
          <div><label className={labelCls}>Data Emissão</label><input type="date" value={dataEmissao} onChange={e => setDataEmissao(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Orçamento Origem</label><select value={orcamentoId} onChange={e => setOrcamentoId(e.target.value)} className={inputCls}><option value="">Nenhum</option>{orcamentos.map(o => <option key={o.id} value={o.id}>{o.numero} — {o.cliente}</option>)}</select></div>
          <div><label className={labelCls}>Status</label><select value={status} onChange={e => setStatus(e.target.value as OSStatus)} className={inputCls}><option value="Aberta">Aberta</option><option value="Em Andamento">Em Andamento</option><option value="Concluída">Concluída</option><option value="Cancelada">Cancelada</option></select></div>
          <div><label className={labelCls}>Material Aplicado</label><input value={materialAplicado} onChange={e => setMaterialAplicado(e.target.value)} className={inputCls} placeholder="Ex: Película Solar" /></div>
        </div>
      </div>

      {/* Execução */}
      <div className={containerCls}>
        <h2 className={sectionTitleCls}>Prazos e Execução</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6">
          <div><label className={labelCls}>Início do Serviço</label><input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Término do Serviço</label><input type="date" value={dataTermino} onChange={e => setDataTermino(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Pagamento Previsto</label><input type="date" value={dataPrevistaPagamento} onChange={e => setDataPrevistaPagamento(e.target.value)} className={inputCls} /></div>
        </div>
      </div>

      {/* Items */}
      <div className={containerCls}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-[#1f1f1f] pb-4">
          <h2 className="font-display text-[15px] font-semibold text-[#f0f0f0]">Itens da Ordem de Serviço</h2>
          <button type="button" onClick={addRow}
            className="mt-3 sm:mt-0 px-4 py-2 rounded-[6px] text-xs font-semibold uppercase tracking-wider cursor-pointer bg-[#2a2a2a] text-[#f0f0f0] hover:bg-[#3a3a3a] hover:text-[#f5c518] transition-all duration-150 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Adicionar Item
          </button>
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#222222]">
                <th className="px-2 py-3 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-[#888888] w-20">Quant</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-[#888888]">Descrição</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-[#888888] w-32">Medidas</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-[#888888] w-32">Total de Mts</th>
                <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-[0.1em] text-[#f5c518] w-40">Valor T.</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {itens.map((row, i) => (
                <tr key={i} className="group hover:bg-[#1a1a1a]/50 transition-colors">
                  <td className="px-2 py-3"><input type="number" min="1" value={row.quant} onChange={e => updateItem(i, 'quant', e.target.value)} className="w-full px-3 py-2.5 text-sm text-center bg-[#0a0a0a] border border-[#2a2a2a] rounded-[4px] text-[#f0f0f0] focus:border-[#f5c518] focus:outline-none transition-colors" placeholder="1" /></td>
                  <td className="px-4 py-3"><input value={row.descricao} onChange={e => updateItem(i, 'descricao', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-[#0a0a0a] border border-[#2a2a2a] rounded-[4px] text-[#f0f0f0] focus:border-[#f5c518] focus:outline-none transition-colors" placeholder="Ex: Aplicação de Película" /></td>
                  <td className="px-4 py-3"><input value={row.medidas} onChange={e => updateItem(i, 'medidas', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-[#0a0a0a] border border-[#2a2a2a] rounded-[4px] text-[#f0f0f0] focus:border-[#f5c518] focus:outline-none transition-colors" placeholder="1,20x0,80" /></td>
                  <td className="px-4 py-3"><input value={row.total_metros} onChange={e => updateItem(i, 'total_metros', e.target.value)} className="w-full px-3 py-2.5 text-sm text-right bg-[#0a0a0a] border border-[#2a2a2a] rounded-[4px] text-[#f0f0f0] focus:border-[#f5c518] focus:outline-none transition-colors" placeholder="0,00" /></td>
                  <td className="px-4 py-3"><input value={row.valor_total} onChange={e => updateItem(i, 'valor_total', e.target.value)} className="w-full px-3 py-2.5 text-sm text-right font-mono font-bold bg-[#0a0a0a] text-[#f5c518] border border-[#2a2a2a] rounded-[4px] focus:border-[#f5c518] focus:outline-none transition-colors" placeholder="R$ 0,00" /></td>
                  <td className="px-2 py-3 text-center">
                    {itens.length > 1 && (
                      <button type="button" onClick={() => removeRow(i)} className="p-2 cursor-pointer text-[#666] hover:text-[#e53e3e] hover:bg-[#e53e3e]/10 rounded-[4px] transition-colors" title="Remover item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#2a2a2a] bg-[#1a1a1a]/30">
                <td colSpan={4} className="px-4 py-5 text-right text-sm font-bold uppercase tracking-widest text-[#888888]">Valor Total</td>
                <td className="px-4 py-5 text-right font-mono text-xl font-bold text-[#f5c518]">{formatCurrency(totalGeral)}</td>
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
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#666] mb-1">Descrição</label>
                  <input value={row.descricao} onChange={e => updateItem(i, 'descricao', e.target.value)} className={inputCls} placeholder="O que será feito?" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#666] mb-1">Quant</label>
                    <input type="number" min="1" value={row.quant} onChange={e => updateItem(i, 'quant', e.target.value)} className={inputCls} placeholder="1" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#666] mb-1">Medidas</label>
                    <input value={row.medidas} onChange={e => updateItem(i, 'medidas', e.target.value)} className={inputCls} placeholder="Ex: 1x2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#666] mb-1">Total de Mts</label>
                    <input value={row.total_metros} onChange={e => updateItem(i, 'total_metros', e.target.value)} className={inputCls} placeholder="0,00" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#666] mb-1">Valor T.</label>
                    <input value={row.valor_total} onChange={e => updateItem(i, 'valor_total', e.target.value)} className={inputCls} placeholder="R$" />
                  </div>
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
      
      {/* Footer Buttons Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#111111]/95 backdrop-blur-md border-t border-[#222222] z-50 flex sm:hidden gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button type="button" onClick={() => router.back()}
            className="flex-1 py-3.5 rounded-[6px] text-sm font-medium cursor-pointer bg-transparent border border-[#2a2a2a] text-[#888888] active:bg-[#1a1a1a]">
            Cancelar
        </button>
        <button type="submit" disabled={saving}
            className="flex-1 py-3.5 rounded-[6px] text-sm font-semibold cursor-pointer disabled:opacity-50 bg-[#f5c518] text-black active:bg-[#e0b213]">
            {saving ? '...' : isEditing ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
