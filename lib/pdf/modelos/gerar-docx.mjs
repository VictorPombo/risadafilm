import {
  Document, Packer, Paragraph, TextRun, ImageRun,
  Table, TableRow, TableCell, WidthType, AlignmentType,
  BorderStyle, HeadingLevel, VerticalAlign,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.resolve(__dirname, '../../../public/images/LogoNovoRisadaLimpo.png');
const logoBuffer = fs.readFileSync(logoPath);
const outputDir = path.resolve(__dirname, '../../../public');

const noBorder = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

const thinBorder = {
  top: { style: BorderStyle.SINGLE, size: 1 },
  bottom: { style: BorderStyle.SINGLE, size: 1 },
  left: { style: BorderStyle.SINGLE, size: 1 },
  right: { style: BorderStyle.SINGLE, size: 1 },
};

function headerSection() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new ImageRun({
          data: logoBuffer,
          transformation: { width: 150, height: 150 },
          type: 'png',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100 },
      children: [
        new TextRun({ text: 'RISADA FILM', bold: true, size: 28, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Comércio de Película e Serviços', size: 18, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'CNPJ: 33.574.274/0001-43', size: 18, font: 'Arial' }),
      ],
    }),
    new Paragraph({ spacing: { after: 200 }, children: [] }),
  ];
}

function makeCell(text, opts = {}) {
  return new TableCell({
    borders: thinBorder,
    verticalAlign: VerticalAlign.CENTER,
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    children: [
      new Paragraph({
        alignment: opts.align || AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
            bold: opts.bold || false,
            size: opts.size || 20,
            font: 'Arial',
          }),
        ],
      }),
    ],
  });
}

// =================== ORÇAMENTO ===================
async function gerarOrcamento() {
  const doc = new Document({
    sections: [{
      children: [
        ...headerSection(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
          children: [
            new TextRun({ text: 'ORÇAMENTO', bold: true, italics: true, size: 36, font: 'Times New Roman' }),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: 'ORÇAMENTO Nº ', bold: true, size: 22, font: 'Arial' }),
            new TextRun({ text: '___________', size: 22, font: 'Arial' }),
            new TextRun({ text: '          São Paulo, ____/____/________', size: 20, font: 'Arial' }),
          ],
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: 'CLIENTE: ', bold: true, size: 22, font: 'Arial' }),
            new TextRun({ text: '____________________________________________', size: 22, font: 'Arial' }),
          ],
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: 'A/C. ', bold: true, size: 22, font: 'Arial' }),
            new TextRun({ text: '________________________________________________', size: 22, font: 'Arial' }),
          ],
        }),
        new Paragraph({ spacing: { after: 100 }, children: [] }),
        // Tabela
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                makeCell('Qtd', { bold: true, width: 10 }),
                makeCell('Descrição', { bold: true, width: 40 }),
                makeCell('Total MTs', { bold: true, width: 15 }),
                makeCell('Valor mts²', { bold: true, width: 17 }),
                makeCell('Total', { bold: true, width: 18 }),
              ],
            }),
            ...Array.from({ length: 5 }, () =>
              new TableRow({
                children: [
                  makeCell(' ', { width: 10 }),
                  makeCell(' ', { width: 40 }),
                  makeCell(' ', { width: 15 }),
                  makeCell(' ', { width: 17 }),
                  makeCell(' ', { width: 18 }),
                ],
              })
            ),
            new TableRow({
              children: [
                makeCell('', { width: 10 }),
                makeCell('', { width: 40 }),
                makeCell('', { width: 15 }),
                makeCell('', { width: 17 }),
                makeCell('TOTAL', { bold: true, width: 18 }),
              ],
            }),
          ],
        }),
        new Paragraph({ spacing: { after: 100 }, children: [] }),
        new Paragraph({
          children: [new TextRun({ text: 'OBS.', bold: true, size: 20, font: 'Arial' })],
        }),
        new Paragraph({
          children: [new TextRun({ text: '________________________________________________________________________', size: 20, font: 'Arial' })],
        }),
        new Paragraph({ spacing: { after: 50 }, children: [] }),
        new Paragraph({
          children: [
            new TextRun({ text: 'CONDIÇÕES DE PAGAMENTOS: ', bold: true, size: 20, font: 'Arial' }),
            new TextRun({ text: '____________________________________', size: 20, font: 'Arial' }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'PRAZO DE INSTALAÇÃO: ', bold: true, size: 20, font: 'Arial' }),
            new TextRun({ text: '________________________________________', size: 20, font: 'Arial' }),
          ],
        }),
        new Paragraph({ spacing: { after: 100 }, children: [] }),
        new Paragraph({
          children: [new TextRun({ text: 'DADOS PARA PAGAMENTO:', bold: true, size: 20, font: 'Arial' })],
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Banco: Itaú Unibanco (341)  |  Agência: 0140  |  Conta: 98105-1', size: 20, font: 'Arial' })],
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Favorecido: Risada Comercio De Pelicula So', size: 20, font: 'Arial' })],
        }),
        new Paragraph({
          children: [new TextRun({ text: 'CNPJ: 33.574.274/0001-43', size: 20, font: 'Arial' })],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Chave PIX (CNPJ): ', size: 20, font: 'Arial' }),
            new TextRun({ text: '33.574.274/0001-43', bold: true, size: 20, font: 'Arial' }),
          ],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(outputDir, 'ORCAMENTO_LOGO_NOVO.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ Orçamento gerado: ${outPath}`);
}

// =================== ORDEM DE SERVIÇO ===================
async function gerarOS() {
  const doc = new Document({
    sections: [{
      children: [
        ...headerSection(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
          children: [
            new TextRun({ text: 'ORDEM DE SERVIÇO', bold: true, italics: true, size: 32, font: 'Times New Roman' }),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: 'ORDEM DE SERVIÇO Nº ', size: 22, font: 'Arial' }),
            new TextRun({ text: '___________', size: 22, font: 'Arial' }),
            new TextRun({ text: '          SÃO PAULO, ____/____/________', size: 20, font: 'Arial' }),
          ],
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: 'CLIENTE: ', bold: true, size: 22, font: 'Arial' }),
            new TextRun({ text: '____________________________________________', size: 22, font: 'Arial' }),
          ],
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: 'LOCAL. ', bold: true, size: 22, font: 'Arial' }),
            new TextRun({ text: '________________________________________________', size: 22, font: 'Arial' }),
          ],
        }),
        new Paragraph({ spacing: { after: 100 }, children: [] }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                makeCell('Qtd', { bold: true, width: 10 }),
                makeCell('Descrição', { bold: true, width: 40 }),
                makeCell('Total MTs', { bold: true, width: 15 }),
                makeCell('Valor mts²', { bold: true, width: 17 }),
                makeCell('Total', { bold: true, width: 18 }),
              ],
            }),
            ...Array.from({ length: 5 }, () =>
              new TableRow({
                children: [
                  makeCell(' ', { width: 10 }),
                  makeCell(' ', { width: 40 }),
                  makeCell(' ', { width: 15 }),
                  makeCell(' ', { width: 17 }),
                  makeCell(' ', { width: 18 }),
                ],
              })
            ),
            new TableRow({
              children: [
                makeCell('', { width: 10 }),
                makeCell('', { width: 40 }),
                makeCell('', { width: 15 }),
                makeCell('TOTAL GERAL:', { bold: true, width: 17 }),
                makeCell('', { bold: true, width: 18 }),
              ],
            }),
          ],
        }),
        new Paragraph({ spacing: { after: 100 }, children: [] }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Inicio do Serviço: ____________    ', size: 20, font: 'Arial' }),
            new TextRun({ text: 'Termino Serviço: ____________', size: 20, font: 'Arial' }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Material Aplicado: ', size: 20, font: 'Arial' }),
            new TextRun({ text: '____________________________________________', size: 20, font: 'Arial' }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Data Prevista Para Pagamento: ', size: 20, font: 'Arial' }),
            new TextRun({ text: '____________________', size: 20, font: 'Arial' }),
          ],
        }),
        new Paragraph({ spacing: { after: 100 }, children: [] }),
        new Paragraph({
          children: [new TextRun({ text: 'DADOS PARA PAGAMENTO:', bold: true, size: 20, font: 'Arial' })],
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Banco: Itaú Unibanco (341)  |  Agência: 0140  |  Conta: 98105-1', size: 20, font: 'Arial' })],
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Favorecido: Risada Comercio De Pelicula So', size: 20, font: 'Arial' })],
        }),
        new Paragraph({
          children: [new TextRun({ text: 'CNPJ: 33.574.274/0001-43', size: 20, font: 'Arial' })],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Chave PIX (CNPJ): ', size: 20, font: 'Arial' }),
            new TextRun({ text: '33.574.274/0001-43', bold: true, size: 20, font: 'Arial' }),
          ],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(outputDir, 'ORDEM_SERVICO_LOGO_NOVO.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ Ordem de Serviço gerada: ${outPath}`);
}

await gerarOrcamento();
await gerarOS();
console.log('🎉 Prontos!');
