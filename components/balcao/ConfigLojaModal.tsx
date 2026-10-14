'use client';

import React, { useState } from 'react';
import type { DadosLojaConfig } from '@/types/balcao';

interface ConfigLojaModalProps {
  aberto: boolean;
  dadosAtuais: DadosLojaConfig;
  onSalvar: (novosDados: DadosLojaConfig) => void;
  onFechar: () => void;
}

export default function ConfigLojaModal({ aberto, dadosAtuais, onSalvar, onFechar }: ConfigLojaModalProps) {
  const [form, setForm] = useState<DadosLojaConfig>(dadosAtuais);

  if (!aberto) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSalvar(form);
    onFechar();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print animate-fade-in">
      <div className="bg-[#181818] border border-[#2e2e2e] rounded-lg w-full max-w-lg shadow-2xl overflow-hidden text-neutral-100">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2e2e2e] bg-[#202020]">
          <div>
            <h3 className="font-bold text-sm text-[#f5c518]">Configurações dos Dados da Loja</h3>
            <p className="text-xs text-neutral-400">Edite o endereço e contatos que saem no cabeçalho dos orçamentos</p>
          </div>
          <button
            onClick={onFechar}
            className="text-neutral-400 hover:text-white text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block text-neutral-300 font-semibold mb-1">Razão Social</label>
            <input
              type="text"
              value={form.razaoSocial}
              onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#101010] border border-[#333] rounded text-white focus:border-[#f5c518]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">CNPJ</label>
              <input
                type="text"
                value={form.cnpj}
                onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#101010] border border-[#333] rounded text-white focus:border-[#f5c518]"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Inscrição Estadual</label>
              <input
                type="text"
                value={form.inscEstadual}
                onChange={(e) => setForm({ ...form, inscEstadual: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#101010] border border-[#333] rounded text-white focus:border-[#f5c518]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#f5c518] font-bold mb-1">
              Endereço da Loja (Alterar quando mudar de ponto físico):
            </label>
            <textarea
              rows={2}
              value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              placeholder="Ex: Rua Costa Barros, 66 - São Paulo - SP"
              className="w-full px-3 py-1.5 bg-[#101010] border border-[#444] rounded text-white focus:border-[#f5c518]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#101010] border border-[#333] rounded text-white focus:border-[#f5c518]"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">E-mail</label>
              <input
                type="text"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#101010] border border-[#333] rounded text-white focus:border-[#f5c518]"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">Termo de Garantia Padrão</label>
            <input
              type="text"
              value={form.termoGarantiaPadrao}
              onChange={(e) => setForm({ ...form, termoGarantiaPadrao: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#101010] border border-[#333] rounded text-white focus:border-[#f5c518]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#2e2e2e]">
            <button
              type="button"
              onClick={onFechar}
              className="px-4 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#f5c518] hover:bg-[#e6b800] text-black font-bold"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
