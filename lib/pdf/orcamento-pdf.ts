import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Orcamento, OrcamentoItem } from '@/types';
import { formatDecimal } from '@/lib/utils';
import { CABECALHO_B64, LOGO_3M_B64, ASSINATURAS_B64 } from './images';

function formatCurrencyPDF(value: number): string {
  return 'R$ ' + formatDecimal(value);
}

function formatDatePDF(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function generateOrcamentoPDF(orc: Orcamento & { itens: OrcamentoItem[] }) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;

  // ===== IMAGEM: CABEÇALHO =====
  const cabecalhoHeight = 35; 
  doc.addImage(CABECALHO_B64, 'JPEG', margin, y, pw - margin * 2, cabecalhoHeight);
  y += cabecalhoHeight + 5;

  // ===== IMAGEM: LOGO 3M =====
  const logo3mWidth = 45;
  const logo3mHeight = 20;
  doc.addImage(LOGO_3M_B64, 'JPEG', margin, y, logo3mWidth, logo3mHeight);

  // ===== NÚMERO E DATA (Ao lado do 3M) =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`ORÇAMENTO Nº ${orc.numero}`, pw - margin, y + 5, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`São Paulo, ${formatDatePDF(orc.data_emissao)}`, pw - margin, y + 10, { align: 'right' });
  
  y += 25;

  // ===== TÍTULO ORÇAMENTO =====
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(18);
  doc.text('ORÇAMENTO', pw / 2, y, { align: 'center' });
  y += 10;

  // ===== CLIENTE (EMPRESA) =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CLIENTE:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(orc.cliente.toUpperCase(), margin + 20, y);
  y += 6;

  // ===== A/C =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('A/C.', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`  ${orc.atencao || ''}`, margin + 12, y);

  y += 8;

  // ===== TABELA DE ITENS =====
  const tableHeaders = [['Qtd', 'Descrição', 'Total MTs', 'Valor mts²', 'Total']];

  /**
   * Extrai dimensões da descrição (ex: "765 x 2545").
   * Sempre considera entrada em milímetros.
   */
  function calcM2FromDesc(descricao: string, fallbackM2: number): number {
    const regex = /(\d+)\s*[xX×]\s*(\d+)/g;
    let total = 0;
    let match;
    let found = false;
    while ((match = regex.exec(descricao)) !== null) {
      found = true;
      total += (parseFloat(match[1]) / 1000) * (parseFloat(match[2]) / 1000);
    }
    return found ? total : fallbackM2;
  }

  const tableRows: string[][] = [];
  let totalGeralRecalculado = 0;
  let totalQtd = 0;
  let totalM2 = 0;

  orc.itens.forEach(item => {
    const m2 = calcM2FromDesc(item.descricao, item.metros_quadrados);
    const totalItem = item.qtd * m2 * item.valor_metro;
    
    totalGeralRecalculado += totalItem;
    totalQtd += item.qtd;
    totalM2 += m2 * item.qtd;

    tableRows.push([
      item.qtd.toString(),
      item.descricao,
      formatDecimal(m2) + ' m²',
      formatCurrencyPDF(item.valor_metro),
      formatCurrencyPDF(totalItem),
    ]);
  });

  // Adicionar linha de TOTAL GERAL dentro da tabela
  tableRows.push([
    totalQtd.toString(),
    'TOTAL GERAL:',
    formatDecimal(totalM2) + ' m²',
    '',
    formatCurrencyPDF(totalGeralRecalculado)
  ]);

  autoTable(doc, {
    startY: y,
    head: tableHeaders,
    body: tableRows,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center',
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [0, 0, 0],
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
      minCellHeight: 8,
    },
    willDrawCell: (data) => {
      // Deixar a linha do TOTAL em negrito
      if (data.row.index === tableRows.length - 1) {
        doc.setFont('helvetica', 'bold');
        if (data.column.index === 1) {
          data.cell.styles.halign = 'right';
        }
      }
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 35 },
      4: { halign: 'center', cellWidth: 35, fontStyle: 'bold' },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  y += 10;

  // ===== OBSERVAÇÕES E CONDIÇÕES =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('OBS.', margin, y);
  
  if (orc.observacoes) {
    y += 6;
    doc.setFont('helvetica', 'normal');
    const obsLines = doc.splitTextToSize(orc.observacoes, pw - margin * 2);
    doc.text(obsLines, margin, y);
    y += obsLines.length * 5;
  } else {
    y += 10;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('CONDIÇOES DE PAGAMENTOS:', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(orc.condicoes_pagamento.toUpperCase(), margin, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text(`PRAZO DE INSTALAÇÃO. É DE ${orc.prazo_instalacao.toUpperCase()}`, margin, y);

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS PARA PAGAMENTO:', margin, y);
  
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text('Banco: Itaú Unibanco (341)  |  Agência: 0140  |  Conta: 98105-1', margin, y);
  
  y += 6;
  doc.text('Favorecido: Risada Comercio De Pelicula So', margin, y);
  
  y += 6;
  doc.text('CNPJ: 33.574.274/0001-43', margin, y);

  y += 6;
  doc.text('Chave PIX (CNPJ): ', margin, y);
  doc.setFont('helvetica', 'bold');
  doc.text('33.574.274/0001-43', margin + 35, y);

  // ===== IMAGEM: ASSINATURAS =====
  const assHeight = 40;
  let sigY = 297 - margin - assHeight;
  
  if (y > sigY - 10) {
    sigY = y + 10;
    if (sigY + assHeight > 297 - margin) {
      doc.addPage();
      sigY = margin;
    }
  }

  doc.addImage(ASSINATURAS_B64, 'JPEG', margin, sigY, pw - margin * 2, assHeight);

  // Download
  doc.save(`Orcamento_${orc.numero.replace('/', '-')}_${orc.cliente.replace(/\s+/g, '_')}.pdf`);
}
