import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { OrdemServico, OSItem } from '@/types';
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

export function generateOSPDF(os: OrdemServico & { itens: OSItem[] }) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  const margin = 20;
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
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`ORDEM DE SERVIÇO Nº ${os.numero}`, pw - margin, y + 5, { align: 'right' });
  doc.text(`SÃO PAULO, ${formatDatePDF(os.data_emissao)}`, pw - margin, y + 10, { align: 'right' });
  
  y += 25;

  // ===== TÍTULO =====
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(16);
  doc.text('ORDEM DE SERVIÇO', pw / 2, y, { align: 'center' });
  
  y += 15;

  // ===== DADOS DO CLIENTE =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CLIENTE:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(os.cliente, margin + 20, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('LOCAL.', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(os.local_servico || '', margin + 15, y);

  y += 10;

  // ===== TABELA DE ITENS =====
  const tableHeaders = [['Qtd', 'Descrição', 'Total MTs', 'Valor mts²', 'Total']];

  const tableRows: string[][] = [];

  os.itens.forEach(item => {
    const tm = item.total_metros || 0;
    const vt = item.valor_total || 0;
    const vm = tm > 0 ? vt / tm : 0;

    tableRows.push([
      item.quant.toString(),
      item.descricao,
      tm > 0 ? formatDecimal(tm, 3) + ' m²' : '',
      vm > 0 ? formatCurrencyPDF(vm) : '',
      formatCurrencyPDF(vt),
    ]);
  });

  // Adicionar a linha de Total dentro da tabela
  tableRows.push(['', '', '', 'TOTAL GERAL:', formatCurrencyPDF(os.total_geral)]);

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
  y = (doc as any).lastAutoTable.finalY + 10;

  // ===== EXECUÇÃO E DADOS DE PAGAMENTO =====
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  doc.text('Inicio do Serviço', margin, y);
  doc.text(formatDatePDF(os.data_inicio || ''), margin + 35, y);
  
  doc.text('Termino Serviço', pw / 2, y);
  doc.text(formatDatePDF(os.data_termino || ''), (pw / 2) + 35, y);
  
  y += 7;
  doc.text('Material Aplicado :', margin, y);
  doc.text(os.material_aplicado || '', margin + 35, y);

  y += 10;
  
  // Dados de Pagamento
  doc.text('Data Prevista Para Pagamento', margin, y);
  doc.text(formatDatePDF(os.data_prevista_pagamento || ''), margin + 60, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS PARA PAGAMENTO:', margin, y);
  
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text('Banco: Itaú Unibanco (341)  |  Agência: 0140  |  Conta: 98105-1', margin, y);
  
  y += 5;
  doc.text('Favorecido: Risada Comercio De Pelicula So', margin, y);
  
  y += 5;
  doc.text('CNPJ: 33.574.274/0001-43', margin, y);

  y += 5;
  doc.text('Chave PIX (CNPJ): ', margin, y);
  doc.setFont('helvetica', 'bold');
  doc.text('33.574.274/0001-43', margin + 35, y);

  // ===== IMAGEM: ASSINATURAS =====
  const assHeight = 35;
  let sigY = y + 15;
  
  if (sigY + assHeight > 297 - margin) {
    doc.addPage();
    sigY = margin;
  }

  doc.addImage(ASSINATURAS_B64, 'JPEG', margin, sigY, pw - margin * 2, assHeight);

  // Download
  const safeNumero = (os.numero || '').replace(/[^a-zA-Z0-9]/g, '-');
  const safeCliente = (os.cliente || '').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 60);
  doc.save(`OS_${safeNumero}_${safeCliente}.pdf`);
}
