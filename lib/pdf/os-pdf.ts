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
  const tableHeaders = [['Quant', 'Descrição', 'Total de Mts', 'Valor T']];

  const tableRows = os.itens.map(item => [
    item.quant.toString(),
    item.descricao,
    item.total_metros ? formatDecimal(item.total_metros) : '',
    formatCurrencyPDF(item.valor_total),
  ]);

  // Adicionar a linha de Total dentro da tabela conforme o DOCX
  tableRows.push(['', 'TOTAL', '', formatCurrencyPDF(os.total_geral)]);

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
      2: { halign: 'center', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 40, fontStyle: 'bold' },
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
  
  y += 8;
  doc.text('Material Aplicado :', margin, y);
  doc.text(os.material_aplicado || '', margin + 35, y);

  y += 12;
  
  // Dados de Pagamento
  doc.text('Data Prevista Para Pagamento', margin, y);
  doc.text(formatDatePDF(os.data_prevista_pagamento || ''), margin + 60, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS PARA DEPOSITO BANCO ITAU S/ A', margin, y);
  
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text('AG. 0149 C/ C 26. 121 - 6 EM NOME DE RISADA COMERCIO DE PELICULA SOLAR LTDA ME', margin, y);
  
  y += 6;
  doc.text('Ou faça pix pelo CNPJ ', margin, y);
  doc.setFont('helvetica', 'bold');
  doc.text('335742740001/43', margin + 45, y);

  // ===== IMAGEM: ASSINATURAS =====
  const assHeight = 40;
  // Colocamos as assinaturas fixas na parte de baixo para ficar exato com o DOCX
  doc.addImage(ASSINATURAS_B64, 'JPEG', margin, 297 - margin - assHeight, pw - margin * 2, assHeight);

  // Download
  doc.save(`OS_${os.numero.replace('/', '-')}_${os.cliente.replace(/\s+/g, '_')}.pdf`);
}
