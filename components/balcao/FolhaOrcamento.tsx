'use client';

import React from 'react';
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
  function handleAdicionarLinha(): number {
    const novaLinha: ItemBalcao = {
      id: `item_${Date.now()}_${Math.random()}`,
      produto: '',
      tonalidade: '',
      descricao: '',
      valor: 0,
    };
    const novoIndex = orcamento.itens.length;
    onChange({
      ...orcamento,
      itens: [...orcamento.itens, novaLinha],
    });
    return novoIndex;
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

  // Navegação ultra-robusta por ID para a tabela de itens
  function handleTableKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number
  ) {
    const totalRows = orcamento.itens.length;

    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      if (rowIndex + 1 < totalRows) {
        const proximo = document.getElementById(`nav-item-${rowIndex + 1}-${colIndex}`) as HTMLInputElement;
        proximo?.focus();
        proximo?.select();
      } else {
        // Última linha: adiciona uma nova e move o foco
        handleAdicionarLinha();
        setTimeout(() => {
          const proximo = document.getElementById(`nav-item-${rowIndex + 1}-${colIndex}`) as HTMLInputElement;
          proximo?.focus();
          proximo?.select();
        }, 50);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex > 0) {
        const anterior = document.getElementById(`nav-item-${rowIndex - 1}-${colIndex}`) as HTMLInputElement;
        anterior?.focus();
        anterior?.select();
      } else {
        // Subir da linha 0 para os campos do veículo
        if (colIndex <= 1) {
          document.getElementById('nav-carro')?.focus();
        } else {
          document.getElementById('nav-placa')?.focus();
        }
      }
    } else if (e.key === 'ArrowRight') {
      const el = e.currentTarget;
      // Se cursor no fim ou campo vazio, avança para a próxima coluna
      if (el.selectionStart === el.value.length || e.ctrlKey || e.metaKey) {
        if (colIndex < 3) {
          e.preventDefault();
          const proxCol = document.getElementById(`nav-item-${rowIndex}-${colIndex + 1}`) as HTMLInputElement;
          proxCol?.focus();
          proxCol?.select();
        }
      }
    } else if (e.key === 'ArrowLeft') {
      const el = e.currentTarget;
      // Se cursor no início, recua para a coluna anterior
      if (el.selectionStart === 0 || e.ctrlKey || e.metaKey) {
        if (colIndex > 0) {
          e.preventDefault();
          const antCol = document.getElementById(`nav-item-${rowIndex}-${colIndex - 1}`) as HTMLInputElement;
          antCol?.focus();
          antCol?.select();
        }
      }
    }
  }

  // Navegação por teclado nos campos do cliente e veículo
  function handleHeaderKeyDown(e: React.KeyboardEvent<HTMLInputElement>, campo: 'cliente' | 'telefone' | 'carro' | 'placa') {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      if (campo === 'cliente') {
        document.getElementById('nav-carro')?.focus();
      } else if (campo === 'telefone') {
        document.getElementById('nav-placa')?.focus();
      } else if (campo === 'carro') {
        const item0 = document.getElementById('nav-item-0-0') as HTMLInputElement;
        item0?.focus();
        item0?.select();
      } else if (campo === 'placa') {
        const item0 = document.getElementById('nav-item-0-1') as HTMLInputElement;
        item0?.focus();
        item0?.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (campo === 'carro') {
        document.getElementById('nav-cliente')?.focus();
      } else if (campo === 'placa') {
        document.getElementById('nav-telefone')?.focus();
      } else if (campo === 'cliente' || campo === 'telefone') {
        document.getElementById('nav-numero')?.focus();
      }
    } else if (e.key === 'ArrowRight') {
      if (campo === 'cliente') {
        e.preventDefault();
        document.getElementById('nav-telefone')?.focus();
      } else if (campo === 'carro') {
        e.preventDefault();
        document.getElementById('nav-placa')?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      if (campo === 'telefone') {
        e.preventDefault();
        document.getElementById('nav-cliente')?.focus();
      } else if (campo === 'placa') {
        e.preventDefault();
        document.getElementById('nav-carro')?.focus();
      }
    }
  }

  return (
    <div className="folha-orcamento-container w-full max-w-5xl mx-auto bg-white text-neutral-900 p-3 sm:p-6 lg:p-8 print:p-0 print:m-0 print:shadow-none print:border-none print:max-w-full print:w-full">
      {/* ========================================================= */}
      {/* 1. CABEÇALHO OFICIAL (COM NOVA LOGO + 3M + ENDEREÇO EDITÁVEL) */}
      {/* ========================================================= */}
      <header className="border-b-2 border-neutral-800 pb-3 mb-4">
        <div className="cabecalho-logos-print grid grid-cols-1 sm:grid-cols-3 print:!flex print:!flex-row items-center justify-between gap-4 print:!gap-2 w-full">
          {/* 1. Esquerda: Nova Logo Risada Film (Escudo) + Dados */}
          <div className="flex items-center gap-3 justify-center sm:justify-start print:!justify-start flex-shrink-0">
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 print:w-14 print:h-14 flex-shrink-0">
              <Image
                src="/images/LogoNovoRisadaLimpo.png"
                alt="Risada Film Logo Oficial"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-cooper italic font-bold text-2xl sm:text-3xl print:text-xl tracking-tight text-neutral-950 uppercase leading-none">
                Risada Film
              </h1>
              <p className="text-[11px] sm:text-xs print:text-[10px] font-semibold text-neutral-700 mt-0.5">
                {dadosLoja.razaoSocial}
              </p>
              <p className="text-[10px] print:text-[9px] text-neutral-500 font-mono">
                CNPJ: {dadosLoja.cnpj} | IE: {dadosLoja.inscEstadual}
              </p>
            </div>
          </div>

          {/* 2. Centro: Logo 3M Aplicador Autorizado Oficial (Deslocado 25% para a direita na tela, centralizado no papel) */}
          <div className="logo-3m-print flex flex-col items-center text-center justify-center py-1 sm:translate-x-[25%] print:!translate-x-0 transition-transform flex-shrink-0">
            <div className="relative flex items-center justify-center">
              <Image
                src="/images/logo-3m-oficial.png"
                alt="3M Oficial"
                width={102}
                height={54}
                priority
                className="w-16 sm:w-20 print:w-16 h-auto object-contain"
              />
            </div>
            <span className="text-[10px] sm:text-[11px] print:text-[9px] font-bold text-neutral-900 tracking-tight leading-tight mt-1">
              Aplicador Autorizado
            </span>
            <span className="text-[9px] sm:text-[10px] print:text-[8px] text-neutral-600 font-medium leading-none mt-0.5">
              Películas para Vidros
            </span>
          </div>

          {/* 3. Direita: Logo Tech-Cut Oficial (com 10% de espaço até a borda na tela, alinhado no papel) */}
          <div className="logo-techcut-print flex flex-col items-center sm:items-end print:!items-end justify-center py-1 sm:pr-[10%] print:!pr-0 flex-shrink-0">
            <div className="relative flex items-center justify-center">
              <Image
                src="/images/logo-tech-cut.png"
                alt="Tech-Cut"
                width={200}
                height={35}
                priority
                className="w-28 sm:w-36 print:w-28 h-auto object-contain"
              />
            </div>
            <span className="text-[9px] sm:text-[10px] print:text-[8px] font-semibold text-neutral-600 uppercase tracking-wider mt-1">
              Corte Computadorizado
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
              id="nav-numero"
              type="text"
              value={orcamento.numero}
              onChange={(e) => handleCampoRaiz('numero', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  document.getElementById('nav-cliente')?.focus();
                }
              }}
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
      {/* 3. DADOS DO CLIENTE E VEÍCULO (COM NAVEGAÇÃO POR SETAS/ENTER) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4 text-xs">
        <div className="flex items-center border-b border-neutral-300 py-1">
          <span className="font-bold text-neutral-700 w-20 flex-shrink-0">CLIENTE:</span>
          <input
            id="nav-cliente"
            type="text"
            value={orcamento.cliente}
            onChange={(e) => handleCampoRaiz('cliente', e.target.value)}
            onKeyDown={(e) => handleHeaderKeyDown(e, 'cliente')}
            placeholder="Nome do cliente"
            className="w-full bg-transparent font-medium text-neutral-900 focus:outline-none focus:bg-amber-50/50 px-1 rounded-sm"
          />
        </div>

        <div className="flex items-center border-b border-neutral-300 py-1">
          <span className="font-bold text-neutral-700 w-20 flex-shrink-0">TELEFONE:</span>
          <input
            id="nav-telefone"
            type="text"
            value={orcamento.telefone}
            onChange={(e) => handleCampoRaiz('telefone', e.target.value)}
            onKeyDown={(e) => handleHeaderKeyDown(e, 'telefone')}
            placeholder="(11) 90000-0000"
            className="w-full bg-transparent font-mono text-neutral-900 focus:outline-none focus:bg-amber-50/50 px-1 rounded-sm"
          />
        </div>

        <div className="flex items-center border-b border-neutral-300 py-1">
          <span className="font-bold text-neutral-700 w-20 flex-shrink-0">CARRO:</span>
          <input
            id="nav-carro"
            type="text"
            value={orcamento.carro}
            onChange={(e) => handleCampoRaiz('carro', e.target.value)}
            onKeyDown={(e) => handleHeaderKeyDown(e, 'carro')}
            placeholder="Ex: Honda Civic, Palio, Tracker"
            className="w-full bg-transparent font-medium text-neutral-900 focus:outline-none focus:bg-amber-50/50 px-1 rounded-sm"
          />
        </div>

        <div className="flex items-center border-b border-neutral-300 py-1">
          <span className="font-bold text-neutral-700 w-20 flex-shrink-0">PLACA:</span>
          <input
            id="nav-placa"
            type="text"
            value={orcamento.placa}
            onChange={(e) => handleCampoRaiz('placa', e.target.value.toUpperCase())}
            onKeyDown={(e) => handleHeaderKeyDown(e, 'placa')}
            placeholder="ABC1D23"
            className="w-full bg-transparent font-mono font-bold uppercase text-neutral-900 focus:outline-none focus:bg-amber-50/50 px-1 rounded-sm"
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
            {orcamento.itens.map((item, rowIndex) => (
              <tr key={item.id} className="border-b border-neutral-300 hover:bg-neutral-50/50">
                {/* Coluna 0: Produto */}
                <td className="border-r border-neutral-300 p-1">
                  <input
                    id={`nav-item-${rowIndex}-0`}
                    type="text"
                    value={item.produto}
                    onChange={(e) => handleItemChange(rowIndex, 'produto', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, rowIndex, 0)}
                    placeholder="Ex: Cerâmica, Alarme"
                    className="w-full px-1.5 py-1 bg-transparent font-medium text-neutral-900 focus:bg-amber-100/70 focus:outline-none rounded-sm"
                  />
                </td>

                {/* Coluna 1: Tonalidade */}
                <td className="border-r border-neutral-300 p-1">
                  <input
                    id={`nav-item-${rowIndex}-1`}
                    type="text"
                    value={item.tonalidade}
                    onChange={(e) => handleItemChange(rowIndex, 'tonalidade', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, rowIndex, 1)}
                    placeholder="G5, G20..."
                    className="w-full px-1.5 py-1 bg-transparent text-center font-mono font-semibold text-neutral-900 focus:bg-amber-100/70 focus:outline-none rounded-sm"
                  />
                </td>

                {/* Coluna 2: Descrição / Peça */}
                <td className="border-r border-neutral-300 p-1">
                  <input
                    id={`nav-item-${rowIndex}-2`}
                    type="text"
                    value={item.descricao}
                    onChange={(e) => handleItemChange(rowIndex, 'descricao', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, rowIndex, 2)}
                    placeholder="Ex: Parabrisa, Portas"
                    className="w-full px-1.5 py-1 bg-transparent text-neutral-900 focus:bg-amber-100/70 focus:outline-none rounded-sm"
                  />
                </td>

                {/* Coluna 3: Valor (R$) */}
                <td className="p-1">
                  <input
                    id={`nav-item-${rowIndex}-3`}
                    type="text"
                    inputMode="decimal"
                    value={item.valor === 0 ? '' : item.valor}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value.replace(',', '.'));
                      handleItemChange(rowIndex, 'valor', isNaN(num) ? 0 : num);
                    }}
                    onKeyDown={(e) => handleTableKeyDown(e, rowIndex, 3)}
                    placeholder="0,00"
                    className="w-full px-1.5 py-1 bg-transparent text-right font-mono font-bold text-neutral-900 focus:bg-amber-100/70 focus:outline-none rounded-sm"
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
            ))}
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
            Dica: use as <strong>setas do teclado</strong> para se mover entre os campos ou <strong>Enter</strong> para pular e criar linhas.
          </span>
          <button
            type="button"
            onClick={() => handleAdicionarLinha()}
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
      {/* 7. CAIXAS DE SELEÇÃO DE GARANTIA (Personalizáveis na Configuração) */}
      {/* ========================================================= */}
      <div className="border-2 border-neutral-800 rounded-sm p-3 bg-neutral-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-display font-black text-sm text-neutral-950 uppercase tracking-wider">
            Garantia:
          </span>
          <button
            type="button"
            onClick={onAbrirConfigLoja}
            className="no-print text-[10px] text-amber-700 hover:text-amber-900 underline font-semibold"
            title="Personalizar caixas e prazos de garantia"
          >
            (Configurar)
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          {(dadosLoja.opcoesGarantia && dadosLoja.opcoesGarantia.length > 0
            ? dadosLoja.opcoesGarantia
            : ['6 Meses', '1 Ano', '5 Anos', '10 Anos', '15 Anos']
          ).map((opcao) => {
            const selecionado = orcamento.garantia?.includes(opcao);
            return (
              <label
                key={opcao}
                onClick={() => {
                  const atuais = orcamento.garantia ? orcamento.garantia.split(', ').filter(Boolean) : [];
                  let novas: string[];
                  if (atuais.includes(opcao)) {
                    novas = atuais.filter((g) => g !== opcao);
                  } else {
                    novas = [...atuais, opcao];
                  }
                  handleCampoRaiz('garantia', novas.join(', '));
                }}
                className="flex items-center gap-2 cursor-pointer select-none font-bold text-xs text-neutral-900 hover:text-black py-0.5"
              >
                <div
                  className={`w-4 h-4 border-2 border-neutral-900 rounded-[2px] flex items-center justify-center transition-all ${
                    selecionado ? 'bg-neutral-950 border-neutral-950' : 'bg-white'
                  }`}
                >
                  {selecionado && (
                    <span className="text-white print:text-black text-[11px] font-black leading-none">
                      ✓
                    </span>
                  )}
                </div>
                <span className={selecionado ? 'text-neutral-950 font-black' : 'text-neutral-700'}>
                  {opcao}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
