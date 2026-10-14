'use client';

import React, { useState } from 'react';
import type { ZonaAvaria, AvariaItem } from '@/types/balcao';

interface DiagramaCarroProps {
  avarias: AvariaItem[];
  onChange: (novasAvarias: AvariaItem[]) => void;
  somenteVisualizacao?: boolean;
}

// Coordenadas das zonas com o carro virado de lado (horizontal: frente à esquerda, traseira à direita)
const ZONAS_CONFIG: { id: ZonaAvaria; nome: string; sigla: string; x: number; y: number }[] = [
  { id: 'capo', nome: 'Capô / Frente', sigla: 'CP', x: 62, y: 100 },
  { id: 'parabrisa', nome: 'Parabrisa', sigla: 'PB', x: 115, y: 100 },
  { id: 'teto', nome: 'Teto / Solar', sigla: 'TT', x: 190, y: 100 },
  { id: 'vigia_traseiro', nome: 'Vigia / Vidro Traseiro', sigla: 'VT', x: 265, y: 100 },
  { id: 'traseira', nome: 'Porta-Malas / Traseira', sigla: 'TR', x: 325, y: 100 },
  { id: 'porta_diant_esq', nome: 'Porta Diant. Esquerda (Motorista)', sigla: 'P.D.E', x: 140, y: 44 },
  { id: 'porta_tras_esq', nome: 'Porta Tras. Esquerda', sigla: 'P.T.E', x: 225, y: 44 },
  { id: 'porta_diant_dir', nome: 'Porta Diant. Direita (Passageiro)', sigla: 'P.D.D', x: 140, y: 156 },
  { id: 'porta_tras_dir', nome: 'Porta Tras. Direita', sigla: 'P.T.D', x: 225, y: 156 },
];

// Função utilitária para comprimir fotos tiradas no celular ou anexadas
function comprimirImagem(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(e.target?.result as string);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DiagramaCarro({ avarias, onChange, somenteVisualizacao = false }: DiagramaCarroProps) {
  const [zonaSelecionada, setZonaSelecionada] = useState<ZonaAvaria | null>(null);
  const [textoAvaria, setTextoAvaria] = useState('');
  const [fotosAvaria, setFotosAvaria] = useState<string[]>([]);
  const [carregandoFoto, setCarregandoFoto] = useState(false);
  const [fotoAmpliadaModal, setFotoAmpliadaModal] = useState<string | null>(null);

  const mapaAvarias = new Map<ZonaAvaria, string>();
  for (const a of avarias) {
    mapaAvarias.set(a.zona, a.detalhe);
  }

  function handleCliqueZona(zona: ZonaAvaria) {
    if (somenteVisualizacao) return;
    const atual = avarias.find((a) => a.zona === zona);
    setZonaSelecionada(zona);
    setTextoAvaria(atual?.detalhe || 'Risco / avaria prévia');
    setFotosAvaria(atual?.fotos || []);
  }

  async function handleUploadFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setCarregandoFoto(true);
    try {
      const novas: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const comp = await comprimirImagem(files[i]);
        novas.push(comp);
      }
      setFotosAvaria((prev) => [...prev, ...novas]);
    } catch (err) {
      console.error('Erro ao comprimir fotos:', err);
    } finally {
      setCarregandoFoto(false);
      e.target.value = '';
    }
  }

  function handleRemoverFoto(index: number) {
    setFotosAvaria((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSalvarAvaria() {
    if (!zonaSelecionada) return;
    const detalheLimpo = textoAvaria.trim();
    if (detalheLimpo || fotosAvaria.length > 0) {
      const filtradas = avarias.filter((a) => a.zona !== zonaSelecionada);
      onChange([
        ...filtradas,
        {
          zona: zonaSelecionada,
          detalhe: detalheLimpo || 'Avaria com fotos registradas',
          fotos: fotosAvaria,
        },
      ]);
    } else {
      onChange(avarias.filter((a) => a.zona !== zonaSelecionada));
    }
    setZonaSelecionada(null);
    setTextoAvaria('');
    setFotosAvaria([]);
  }

  function handleRemoverAvaria(zona: ZonaAvaria) {
    onChange(avarias.filter((a) => a.zona !== zona));
    if (zonaSelecionada === zona) {
      setZonaSelecionada(null);
      setTextoAvaria('');
      setFotosAvaria([]);
    }
  }

  const zonaAtivaConfig = ZONAS_CONFIG.find((z) => z.id === zonaSelecionada);

  return (
    <div className="flex flex-col lg:flex-row print:flex-row gap-3 sm:gap-4 print:gap-2.5 items-center lg:items-start print:items-center w-full min-w-0">
      {/* Blueprint SVG do Veículo (HORIZONTAL / VIRADO DE LADO) */}
      <div className="relative w-full max-w-[340px] sm:max-w-[360px] print:w-[220px] print:max-w-[220px] mx-auto print:mx-0 flex-shrink-0 select-none flex flex-col items-center">
        <svg
          viewBox="0 0 390 200"
          className="w-full h-auto aspect-[390/200] border border-neutral-300 rounded-lg bg-neutral-50 shadow-inner print:max-h-[115px]"
        >
          {/* Rodas do Carro (Pneus visíveis na lateral) */}
          <rect x="52" y="14" width="36" height="12" rx="3" fill="#222" stroke="#111" strokeWidth="1" />
          <rect x="288" y="14" width="36" height="12" rx="3" fill="#222" stroke="#111" strokeWidth="1" />
          <rect x="52" y="174" width="36" height="12" rx="3" fill="#222" stroke="#111" strokeWidth="1" />
          <rect x="288" y="174" width="36" height="12" rx="3" fill="#222" stroke="#111" strokeWidth="1" />

          {/* Silhueta Externa do Chassi (Carro Virado de Lado) */}
          <path
            d="M 60,60 
               C 30,60 20,80 20,100 
               C 20,120 30,140 60,140 
               L 120,146 
               L 280,148 
               L 350,144 
               C 375,140 380,115 380,100 
               C 380,85 375,60 350,56 
               L 280,52 
               L 120,54 Z"
            fill="#ffffff"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Retrovisores */}
          <path d="M 110,48 L 105,32 L 120,38 Z" fill="#333" stroke="#111" strokeWidth="1" />
          <path d="M 110,152 L 105,168 L 120,162 Z" fill="#333" stroke="#111" strokeWidth="1" />

          {/* Faróis Dianteiros (Esquerda) e Traseiros (Direita) */}
          <ellipse cx="26" cy="74" rx="4" ry="7" fill="#f5c518" stroke="#333" strokeWidth="0.8" />
          <ellipse cx="26" cy="126" rx="4" ry="7" fill="#f5c518" stroke="#333" strokeWidth="0.8" />
          <rect x="372" y="66" width="5" height="14" rx="2" fill="#e53e3e" stroke="#333" strokeWidth="0.8" />
          <rect x="372" y="120" width="5" height="14" rx="2" fill="#e53e3e" stroke="#333" strokeWidth="0.8" />

          {/* 1. Capô / Frente */}
          <path
            d="M 32,74 Q 28,100 32,126 L 88,135 Q 92,100 88,65 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('capo') ? 'fill-red-200 stroke-red-600' : 'fill-neutral-100 hover:fill-amber-100 stroke-neutral-700'
            }`}
            strokeWidth="1.2"
            onClick={() => handleCliqueZona('capo')}
          />
          <text x="60" y="103" fontSize="8" textAnchor="middle" fill="#666" className="pointer-events-none font-bold">
            FRENTE / CAPÔ
          </text>

          {/* 2. Parabrisa Dianteiro */}
          <path
            d="M 92,66 Q 88,100 92,134 L 138,130 Q 142,100 138,70 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('parabrisa') ? 'fill-red-300 stroke-red-600' : 'fill-sky-100 hover:fill-amber-200 stroke-neutral-800'
            }`}
            strokeWidth="1.5"
            onClick={() => handleCliqueZona('parabrisa')}
          />
          <text x="115" y="103" fontSize="8.5" textAnchor="middle" fill="#1e3a8a" className="pointer-events-none font-black">
            PARABRISA
          </text>

          {/* 3. Teto */}
          <rect
            x="142"
            y="68"
            width="96"
            height="64"
            rx="4"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('teto') ? 'fill-red-200 stroke-red-600' : 'fill-neutral-200 hover:fill-amber-100 stroke-neutral-600'
            }`}
            strokeWidth="1.2"
            onClick={() => handleCliqueZona('teto')}
          />
          <text x="190" y="103" fontSize="9" textAnchor="middle" fill="#444" className="pointer-events-none font-bold">
            TETO
          </text>

          {/* 4. Vidro Traseiro (Vigia) */}
          <path
            d="M 242,70 Q 238,100 242,130 L 288,134 Q 292,100 288,66 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('vigia_traseiro') ? 'fill-red-300 stroke-red-600' : 'fill-sky-100 hover:fill-amber-200 stroke-neutral-800'
            }`}
            strokeWidth="1.5"
            onClick={() => handleCliqueZona('vigia_traseiro')}
          />
          <text x="265" y="103" fontSize="8.5" textAnchor="middle" fill="#1e3a8a" className="pointer-events-none font-black">
            VIGIA TRAS.
          </text>

          {/* 5. Traseira / Porta-Malas */}
          <path
            d="M 292,66 Q 288,100 292,134 L 358,126 Q 365,100 358,74 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('traseira') ? 'fill-red-200 stroke-red-600' : 'fill-neutral-100 hover:fill-amber-100 stroke-neutral-700'
            }`}
            strokeWidth="1.2"
            onClick={() => handleCliqueZona('traseira')}
          />
          <text x="325" y="103" fontSize="8" textAnchor="middle" fill="#666" className="pointer-events-none font-bold">
            TRASEIRA
          </text>

          {/* 6. Porta Dianteira Esquerda (Motorista - Topo/Esquerda) */}
          <path
            d="M 100,50 L 102,30 L 180,30 L 178,51 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('porta_diant_esq') ? 'fill-red-300 stroke-red-600' : 'fill-sky-50 hover:fill-amber-100 stroke-neutral-800'
            }`}
            strokeWidth="1.2"
            onClick={() => handleCliqueZona('porta_diant_esq')}
          />
          <text x="140" y="44" fontSize="7.5" textAnchor="middle" fill="#222" className="pointer-events-none font-bold">
            P. DIANT. ESQ
          </text>

          {/* 7. Porta Traseira Esquerda (Topo/Direita) */}
          <path
            d="M 184,51 L 186,30 L 264,30 L 262,51 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('porta_tras_esq') ? 'fill-red-300 stroke-red-600' : 'fill-sky-50 hover:fill-amber-100 stroke-neutral-800'
            }`}
            strokeWidth="1.2"
            onClick={() => handleCliqueZona('porta_tras_esq')}
          />
          <text x="225" y="44" fontSize="7.5" textAnchor="middle" fill="#222" className="pointer-events-none font-bold">
            P. TRAS. ESQ
          </text>

          {/* 8. Porta Dianteira Direita (Passageiro - Baixo/Esquerda) */}
          <path
            d="M 100,150 L 102,170 L 180,170 L 178,149 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('porta_diant_dir') ? 'fill-red-300 stroke-red-600' : 'fill-sky-50 hover:fill-amber-100 stroke-neutral-800'
            }`}
            strokeWidth="1.2"
            onClick={() => handleCliqueZona('porta_diant_dir')}
          />
          <text x="140" y="163" fontSize="7.5" textAnchor="middle" fill="#222" className="pointer-events-none font-bold">
            P. DIANT. DIR
          </text>

          {/* 9. Porta Traseira Direita (Baixo/Direita) */}
          <path
            d="M 184,149 L 186,170 L 264,170 L 262,149 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('porta_tras_dir') ? 'fill-red-300 stroke-red-600' : 'fill-sky-50 hover:fill-amber-100 stroke-neutral-800'
            }`}
            strokeWidth="1.2"
            onClick={() => handleCliqueZona('porta_tras_dir')}
          />
          <text x="225" y="163" fontSize="7.5" textAnchor="middle" fill="#222" className="pointer-events-none font-bold">
            P. TRAS. DIR
          </text>

          {/* Indicadores de Avaria com Alerta */}
          {ZONAS_CONFIG.map((z) => {
            if (!mapaAvarias.has(z.id)) return null;
            return (
              <g key={z.id}>
                <circle cx={z.x} cy={z.y} r="7" fill="#e53e3e" stroke="#ffffff" strokeWidth="2" />
                <text x={z.x} y={z.y + 2.5} fontSize="7" textAnchor="middle" fill="#ffffff" fontWeight="bold">
                  !
                </text>
              </g>
            );
          })}
        </svg>

        <p className="text-[10px] text-center text-neutral-500 mt-1 no-print">
          Clique no vidro/peça para registrar avaria pré-existente
        </p>
      </div>

      {/* Painel lateral: Edição e Lista de Avarias */}
      <div className="flex-1 w-full min-w-0 text-xs">
        {/* Editor de Avaria Aberto */}
        {zonaSelecionada && !somenteVisualizacao && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 sm:p-3 mb-2.5 no-print animate-fade-in shadow-xs w-full min-w-0">
            <div className="flex justify-between items-center gap-1.5 mb-1.5 min-w-0">
              <span className="font-bold text-amber-950 text-xs flex items-center gap-1 min-w-0 truncate">
                <span>📍</span> Avaria: <strong className="text-amber-800 underline truncate">{zonaAtivaConfig?.nome}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setZonaSelecionada(null);
                  setTextoAvaria('');
                  setFotosAvaria([]);
                }}
                className="text-neutral-500 hover:text-neutral-900 text-sm leading-none p-1 rounded flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                autoFocus
                value={textoAvaria}
                onChange={(e) => setTextoAvaria(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSalvarAvaria();
                  }
                }}
                placeholder="Ex: Risco profundo no vidro, picado de pedra, arranhão na lataria..."
                className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-neutral-900 text-xs focus:ring-1 focus:ring-amber-500 shadow-inner"
              />

              {/* Botões de Ação: Upload de Fotos e Salvar */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                <label className="cursor-pointer bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 font-semibold px-2.5 py-1 rounded text-xs flex items-center gap-1.5 shadow-xs transition-colors">
                  <span>📸</span>
                  <span>{carregandoFoto ? 'Comprimindo...' : 'Tirar / Anexar Fotos'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    onChange={handleUploadFotos}
                    disabled={carregandoFoto}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setZonaSelecionada(null);
                      setTextoAvaria('');
                      setFotosAvaria([]);
                    }}
                    className="px-2.5 py-1 text-neutral-600 hover:text-neutral-900 text-xs font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSalvarAvaria}
                    className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-3 py-1 rounded text-xs shadow-xs"
                  >
                    Salvar Avaria
                  </button>
                </div>
              </div>

              {/* Miniaturas de fotos anexadas nesta edição */}
              {fotosAvaria.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-200/70">
                  {fotosAvaria.map((foto, idx) => (
                    <div
                      key={idx}
                      className="relative group w-14 h-14 rounded-md border border-neutral-300 overflow-hidden bg-white shadow-xs flex-shrink-0"
                    >
                      <img
                        src={foto}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoverFoto(idx)}
                        className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white text-[10px] w-4 h-4 flex items-center justify-center font-bold rounded-bl"
                        title="Remover foto"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <span className="text-[10px] text-amber-800 self-center font-medium">
                    {fotosAvaria.length} foto(s) anexada(s)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lista de Avarias Registradas */}
        <div className="border border-neutral-200 rounded-lg bg-white p-2.5 print:p-1.5 min-h-[105px] print:min-h-0 print:max-h-[115px] print:overflow-hidden flex-1 w-full">
          <div className="flex items-center justify-between pb-1.5 print:pb-1 border-b border-neutral-200 mb-1.5 print:mb-1">
            <span className="font-bold text-neutral-900 tracking-wide uppercase text-[11px] print:text-[9.5px] flex items-center gap-1.5">
              <span>📋</span> Vistoria de Entrada / Avarias Pré-Existentes
            </span>
            <span className="text-[11px] print:text-[9.5px] text-neutral-500 font-mono font-bold">
              {avarias.length} registrada(s)
            </span>
          </div>

          {avarias.length === 0 ? (
            <p className="text-neutral-400 italic text-[11px] print:text-[9.5px] py-3 print:py-1.5 text-center">
              Nenhuma avaria ou risco registrado no veículo (veículo íntegro na entrada).
            </p>
          ) : (
            <ul className="space-y-1.5 print:space-y-1">
              {avarias.map((a) => {
                const conf = ZONAS_CONFIG.find((z) => z.id === a.zona);
                return (
                  <li
                    key={a.zona}
                    className="flex flex-col sm:flex-row print:flex-row sm:items-center print:items-center justify-between bg-red-50/70 border border-red-200/80 rounded-md p-2 print:p-1 text-neutral-900 gap-2 print:gap-1 text-xs print:text-[9.5px]"
                  >
                    <div className="flex flex-col gap-1 overflow-hidden flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                        <span className="font-bold text-red-950 text-[11px] print:text-[9.5px] whitespace-nowrap">
                          {conf?.nome}:
                        </span>
                        <span className="text-neutral-800 text-[11px] print:text-[9.5px]">
                          {a.detalhe}
                        </span>
                      </div>

                      {/* Fotos registradas para esta avaria */}
                      {a.fotos && a.fotos.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pl-3.5 mt-0.5">
                          {a.fotos.map((foto, fIdx) => (
                            <button
                              type="button"
                              key={fIdx}
                              onClick={() => setFotoAmpliadaModal(foto)}
                              className="w-10 h-10 print:w-12 print:h-12 rounded border border-neutral-300 overflow-hidden bg-white shadow-xs hover:ring-2 hover:ring-amber-500 transition-all flex-shrink-0 cursor-pointer"
                              title="Clique para ampliar a foto da avaria"
                            >
                              <img
                                src={foto}
                                alt={`Avaria ${conf?.nome} ${fIdx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                          <span className="text-[10px] text-neutral-500 font-medium no-print">
                            ({a.fotos.length} foto{a.fotos.length > 1 ? 's' : ''})
                          </span>
                        </div>
                      )}
                    </div>

                    {!somenteVisualizacao && (
                      <button
                        type="button"
                        onClick={() => handleRemoverAvaria(a.zona)}
                        className="text-red-400 hover:text-red-700 no-print font-bold text-xs self-end sm:self-center px-1.5 py-0.5 rounded hover:bg-red-100/50 transition-colors"
                        title="Remover avaria"
                      >
                        ✕
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL LIGHTBOX PARA VISUALIZAR FOTO AMPLIADA DA AVARIA */}
      {/* ========================================================= */}
      {fotoAmpliadaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 no-print animate-fade-in"
          onClick={() => setFotoAmpliadaModal(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-lg p-3 shadow-2xl flex flex-col items-center border border-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center pb-2 border-b border-neutral-200 mb-2">
              <span className="font-bold text-xs text-neutral-800 flex items-center gap-1.5">
                <span>📸</span> Registro Fotográfico de Avaria
              </span>
              <button
                type="button"
                onClick={() => setFotoAmpliadaModal(null)}
                className="text-neutral-500 hover:text-neutral-900 font-bold text-xs px-2 py-1 rounded hover:bg-neutral-100 transition-colors"
              >
                ✕ Fechar
              </button>
            </div>
            <div className="overflow-hidden rounded max-h-[72vh] flex items-center justify-center bg-neutral-900 w-full">
              <img
                src={fotoAmpliadaModal}
                alt="Foto ampliada da avaria"
                className="max-w-full max-h-[72vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
