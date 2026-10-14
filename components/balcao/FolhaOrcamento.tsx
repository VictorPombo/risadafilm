'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import type { OrcamentoBalcao, DadosLojaConfig, ItemBalcao, AvariaItem } from '@/types/balcao';
import DiagramaCarro from './DiagramaCarro';

interface FolhaOrcamentoProps {
  orcamento: OrcamentoBalcao;
  dadosLoja: DadosLojaConfig;
  onChange: (orc: OrcamentoBalcao) => void;
  onAbrirConfigLoja: () => void;
}

export default function FolhaOrcamento({
  orcamento,
  dadosLoja,
  onChange,
  onAbrirConfigLoja,
}: FolhaOrcamentoProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[][]>([]);

  // Atualiza um campo de texto de nível raiz
  function handleCampoRaiz(campo: keyof OrcamentoBalcao, valor: string) {
    onChange({
      ...orcamento,
      [campo]: valor,
    });
  }

  // Atualiza campo de um item da tabela
  function handleItemChange(index: number, campo: keyof ItemBalcao, valor: string | number) {
    const novosItens = [...orcamento.itens];
    novosItens[index] = {
      ...novosItens[index],
      [campo]: valor,
    };

    // Recalcula total geral
    const novoTotal = novosItens.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);

    onChange({
      ...orcamento,
      itens: novosItens,
      total_geral: novoTotal,
    });
  }

  // Adiciona nova linha na tabela
  function handleAdicionarLinha() {
    const novaLinha: ItemBalcao = {
      id: `item_${Date.now()}_${Math.random()}`,
      produto: '',
      tonalidade: '',
      descricao: '',
      valor: 0,
    };
    onChange({
      ...orcamento,
      itens: [...orcamento.itens, novaLinha],
    });
  }

  // Remove uma linha específica
  function handleRemoverLinha(index: number) {
    if (orcamento.itens.length <= 1) return;
    const novosItens = orcamento.itens.filter((_, i) => i !== index);
    const novoTotal = novosItens.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
    onChange({
      ...orcamento,
      itens: novosItens,
      total_geral: novoTotal,
    });
  }

  // Navegação por teclado fluida (Setinhas e Enter)
  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number
  ) {
    const totalRows = orcamento.itens.length;
    const totalCols = 4; // produto (0), tonalidade (1), descricao (2), valor (3)

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (rowIndex + 1 < totalRows) {
        inputsRef.current[rowIndex + 1]?.[colIndex]?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex - 1 >= 0) {
        inputsRef.current[rowIndex - 1]?.[colIndex]?.focus();
      }
    } else if (e.key === 'ArrowRight' && (e.currentTarget.selectionStart === e.currentTarget.value.length || e.currentTarget.type === 'number')) {
      if (colIndex + 1 < totalCols) {
        inputsRef.current[rowIndex]?.[colIndex + 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
      if (colIndex - 1 >= 0) {
        inputsRef.current[rowIndex]?.[colIndex - 1]?.focus();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Se for a última coluna ou estiver descendo
      if (rowIndex + 1 === totalRows) {
        // Na última linha, cria uma nova linha automaticamente e foca nela!
        handleAdicionarLinha();
        setTimeout(() => {
          inputsRef.current[rowIndex + 1]?.[colIndex]?.focus();
        }, 50);
      } else {
        inputsRef.current[rowIndex + 1]?.[colIndex]?.focus();
      }
    }
  }

  // Divide data em dia/mês/ano para cabeçalho
  const [ano, mes, dia] = (orcamento.data_emissao || '').split('-');

  return (
    <div className="w-full max-w-[850px] mx-auto bg-white text-neutral-900 shadow-2xl rounded-sm p-6 sm:p-10 border border-neutral-300 print:border-none print:shadow-none print:p-0 print:max-w-none print:w-full">
      {/* ========================================================= */}
      {/* 1. CABEÇALHO OFICIAL (COM NOVA LOGO + 3M + ENDEREÇO EDITÁVEL) */}
      {/* ========================================================= */}
      <header className="border-b-2 border-neutral-800 pb-3 mb-4">
        <div className="flex items-center justify-between gap-4">
          {/* Nova Logo Risada Film (Escudo) */}
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
              <Image
                src="/images/LogoNovoRisadaLimpo.png"
                alt="Risada Film Logo Oficial"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-display font-black text-lg sm:text-2xl tracking-tight text-neutral-950 uppercase leading-none">
                Risada Film
              </h1>
              <p className="text-[11px] sm:text-xs font-semibold text-neutral-700 mt-0.5">
                {dadosLoja.razaoSocial}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">
                CNPJ: {dadosLoja.cnpj} | IE: {dadosLoja.inscEstadual}
              </p>
            </div>
          </div>

          {/* Logo 3M Aplicador Autorizado */}
          <div className="flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xl sm:text-2xl text-[#e53e3e] leading-none tracking-tighter">
                3M
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-neutral-800 tracking-tight leading-tight">
              Aplicador Autorizado
            </span>
            <span className="text-[9px] text-neutral-500">
              Películas para Vidros
            </span>
          </div>
        </div>

        {/* Linha de Endereço e Contatos (Editável) */}
        <div className="mt-2.5 pt-2 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-neutral-600 gap-1">
          <div className="flex items-center gap-1.5 group">
            <span className="font-semibold text-neutral-800">Endereço:</span>
            <span>{dadosLoja.endereco}</span>
            <button
              type="button"
              onClick={onAbrirConfigLoja}
              className="no-print text-amber-600 hover:text-amber-800 underline text-[10px] ml-1 font-semibold"
              title="Clique para editar o endereço da loja"
            >
              (Editar Endereço)
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span>WhatsApp: <strong className="text-neutral-800">{dadosLoja.telefone}</strong></span>
            <span>E-mail: {dadosLoja.email}</span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. BARRA DE TÍTULO, NÚMERO E DATA */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between border-b border-neutral-300 pb-2 mb-4">
        <div>
          <h2 className="font-display font-black text-xl sm:text-2xl tracking-wider text-neutral-900">
            ORÇAMENTO
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          {/* Número Sequencial Automático / Editável */}
          <div className="flex items-center gap-1">
            <span className="text-neutral-600">Nº</span>
            <input
              type="text"
              value={orcamento.numero}
              onChange={(e) => handleCampoRaiz('numero', e.target.value)}
              className="w-24 px-1.5 py-0.5 border-b border-neutral-400 font-mono font-bold text-neutral-900 bg-transparent text-right focus:border-amber-500"
              placeholder="001/2026"
            />
          </div>

          {/* Data de Emissão */}
          <div className="flex items-center gap-1">
            <span className="text-neutral-600">SÃO PAULO,</span>
            <input
              type="date"
              value={orcamento.data_emissao}
              onChange={(e) => handleCampoRaiz('data_emissao', e.target.value)}
              className="px-1 py-0.5 border-b border-neutral-400 font-mono text-xs bg-transparent text-neutral-900 focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. DADOS DO CLIENTE E VEÍCULO (COM PLACA E TELEFONE) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4 text-xs">
        <div className="flex items-center border-b border-neutral-300 py-1">
          <span className="font-bold text-neutral-700 w-20 flex-shrink-0">CLIENTE:</span>
          <input
            type="text"
            value={orcamento.cliente}
            onChange={(e) => handleCampoRaiz('cliente', e.target.value)}
            placeholder="Nome do cliente"
            className="w-full bg-transparent font-medium text-neutral-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center border-b border-neutral-300 py-1">
          <span className="font-bold text-neutral-700 w-20 flex-shrink-0">TELEFONE:</span>
          <input
            type="text"
            value={orcamento.telefone}
            onChange={(e) => handleCampoRaiz('telefone', e.target.value)}
            placeholder="(11) 90000-0000"
            className="w-full bg-transparent font-mono text-neutral-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center border-b border-neutral-300 py-1">
          <span className="font-bold text-neutral-700 w-20 flex-shrink-0">CARRO:</span>
          <input
            type="text"
            value={orcamento.carro}
            onChange={(e) => handleCampoRaiz('carro', e.target.value)}
            placeholder="Ex: Honda Civic, Palio, Tracker"
            className="w-full bg-transparent font-medium text-neutral-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center border-b border-neutral-300 py-1">
          <span className="font-bold text-neutral-700 w-20 flex-shrink-0">PLACA:</span>
          <input
            type="text"
            value={orcamento.placa}
            onChange={(e) => handleCampoRaiz('placa', e.target.value.toUpperCase())}
            placeholder="ABC1D23"
            className="w-full bg-transparent font-mono font-bold uppercase text-neutral-900 focus:outline-none"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. TABELA DE ITENS (PRODUTO | TONALIDADE | DESCRIÇÃO | VALOR) */}
      {/* ========================================================= */}
      <div className="mb-4">
        <table className="w-full border-collapse border border-neutral-400 text-xs">
          <thead>
            <tr className="bg-neutral-100 border-b border-neutral-400 text-neutral-900">
              <th className="border-r border-neutral-400 p-2 text-left font-bold w-[28%]">
                PRODUTO
              </th>
              <th className="border-r border-neutral-400 p-2 text-center font-bold w-[18%]">
                TONALIDADE
              </th>
              <th className="border-r border-neutral-400 p-2 text-left font-bold w-[38%]">
                DESCRIÇÃO / LOCAL
              </th>
              <th className="p-2 text-right font-bold w-[16%]">
                VALOR (R$)
              </th>
              <th className="w-8 no-print p-0 border-l border-neutral-400"></th>
            </tr>
          </thead>
          <tbody>
            {orcamento.itens.map((item, rowIndex) => {
              if (!inputsRef.current[rowIndex]) {
                inputsRef.current[rowIndex] = [];
              }
              return (
                <tr key={item.id} className="border-b border-neutral-300 hover:bg-neutral-50/50">
                  {/* Coluna 0: Produto */}
                  <td className="border-r border-neutral-300 p-1">
                    <input
                      ref={(el) => { inputsRef.current[rowIndex][0] = el; }}
                      type="text"
                      value={item.produto}
                      onChange={(e) => handleItemChange(rowIndex, 'produto', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 0)}
                      placeholder="Ex: Cerâmica, Alarme"
                      className="w-full px-1.5 py-1 bg-transparent font-medium text-neutral-900 focus:bg-amber-50/60 focus:outline-none rounded-sm"
                    />
                  </td>

                  {/* Coluna 1: Tonalidade */}
                  <td className="border-r border-neutral-300 p-1">
                    <input
                      ref={(el) => { inputsRef.current[rowIndex][1] = el; }}
                      type="text"
                      value={item.tonalidade}
                      onChange={(e) => handleItemChange(rowIndex, 'tonalidade', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 1)}
                      placeholder="G5, G20..."
                      className="w-full px-1.5 py-1 bg-transparent text-center font-mono font-semibold text-neutral-900 focus:bg-amber-50/60 focus:outline-none rounded-sm"
                    />
                  </td>

                  {/* Coluna 2: Descrição / Peça */}
                  <td className="border-r border-neutral-300 p-1">
                    <input
                      ref={(el) => { inputsRef.current[rowIndex][2] = el; }}
                      type="text"
                      value={item.descricao}
                      onChange={(e) => handleItemChange(rowIndex, 'descricao', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 2)}
                      placeholder="Ex: Parabrisa, Portas dianteiras"
                      className="w-full px-1.5 py-1 bg-transparent text-neutral-900 focus:bg-amber-50/60 focus:outline-none rounded-sm"
                    />
                  </td>

                  {/* Coluna 3: Valor (R$) */}
                  <td className="p-1">
                    <input
                      ref={(el) => { inputsRef.current[rowIndex][3] = el; }}
                      type="number"
                      step="0.01"
                      value={item.valor === 0 ? '' : item.valor}
                      onChange={(e) => handleItemChange(rowIndex, 'valor', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 3)}
                      placeholder="0,00"
                      className="w-full px-1.5 py-1 bg-transparent text-right font-mono font-bold text-neutral-900 focus:bg-amber-50/60 focus:outline-none rounded-sm"
                    />
                  </td>

                  {/* Botão de remoção (apenas tela) */}
                  <td className="no-print p-0 text-center border-l border-neutral-300">
                    <button
                      type="button"
                      onClick={() => handleRemoverLinha(rowIndex)}
                      className="text-neutral-300 hover:text-red-500 font-bold p-1 leading-none text-xs"
                      title="Excluir linha"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-400">
              <td colSpan={3} className="p-2 text-right border-r border-neutral-400 uppercase tracking-wider text-xs">
                TOTAL GERAL:
              </td>
              <td className="p-2 text-right font-mono text-sm text-neutral-950 font-black">
                {Number(orcamento.total_geral || 0).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </td>
              <td className="no-print border-l border-neutral-400"></td>
            </tr>
          </tfoot>
        </table>

        {/* Botão para adicionar linha na tela */}
        <div className="flex justify-between items-center mt-1.5 no-print">
          <span className="text-[10px] text-neutral-500">
            Dica: use as <strong>setas do teclado</strong> para se mover ou <strong>Enter</strong> na última linha para criar outra.
          </span>
          <button
            type="button"
            onClick={handleAdicionarLinha}
            className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold px-2.5 py-1 rounded border border-neutral-300 transition-colors"
          >
            + Adicionar Linha
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. DIAGRAMA DO CARRO (VISTORIA DE RISCOS / AVARIAS) */}
      {/* ========================================================= */}
      <div className="border border-neutral-300 rounded p-3 mb-4 bg-neutral-50/60">
        <DiagramaCarro
          avarias={orcamento.avarias}
          onChange={(novasAvarias: AvariaItem[]) => onChange({ ...orcamento, avarias: novasAvarias })}
        />
      </div>

      {/* ========================================================= */}
      {/* 6. OBSERVAÇÕES E CONDIÇÕES */}
      {/* ========================================================= */}
      <div className="border border-neutral-300 rounded p-2.5 mb-4 text-xs">
        <label className="block font-bold text-neutral-700 text-[11px] mb-1 uppercase">
          Observações / Condições Gerais:
        </label>
        <textarea
          rows={2}
          value={orcamento.observacoes}
          onChange={(e) => handleCampoRaiz('observacoes', e.target.value)}
          placeholder="Forma de pagamento, prazo de cura do insulfilm (não abrir vidros por 3 dias), etc."
          className="w-full bg-transparent text-neutral-900 border-none p-0 focus:outline-none resize-none text-xs leading-relaxed"
        />
      </div>

      {/* ========================================================= */}
      {/* 7. TERMO DE GARANTIA E ASSINATURAS */}
      {/* ========================================================= */}
      <footer className="pt-2 border-t border-neutral-300 text-xs">
        {/* Termo de Garantia */}
        <div className="mb-6 text-[10px] text-neutral-600 bg-neutral-50 p-2 rounded border border-neutral-200">
          <p className="font-semibold text-neutral-800 mb-0.5">TERMO DE GARANTIA E RESPONSABILIDADE:</p>
          <p>{dadosLoja.termoGarantiaPadrao}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-neutral-700">Prazo de Garantia:</span>
            <input
              type="text"
              value={orcamento.garantia}
              onChange={(e) => handleCampoRaiz('garantia', e.target.value)}
              placeholder="Ex: 3 anos / 5 anos"
              className="border-b border-neutral-400 bg-transparent px-1 font-semibold text-neutral-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Linhas de Assinatura */}
        <div className="grid grid-cols-2 gap-12 pt-6 text-center text-xs">
          <div>
            <div className="border-t border-neutral-800 pt-1 font-semibold text-neutral-900">
              {orcamento.cliente || 'Assinatura do Cliente'}
            </div>
            <p className="text-[10px] text-neutral-500">De acordo com o orçamento e vistoria de entrada</p>
          </div>
          <div>
            <div className="border-t border-neutral-800 pt-1 font-semibold text-neutral-900">
              RISADA FILM
            </div>
            <p className="text-[10px] text-neutral-500">Aplicador Autorizado</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
