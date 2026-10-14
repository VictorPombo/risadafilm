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

export default function DiagramaCarro({ avarias, onChange, somenteVisualizacao = false }: DiagramaCarroProps) {
  const [zonaSelecionada, setZonaSelecionada] = useState<ZonaAvaria | null>(null);
  const [textoAvaria, setTextoAvaria] = useState('');

  const mapaAvarias = new Map<ZonaAvaria, string>();
  for (const a of avarias) {
    mapaAvarias.set(a.zona, a.detalhe);
  }

  function handleCliqueZona(zona: ZonaAvaria) {
    if (somenteVisualizacao) return;
    const atual = mapaAvarias.get(zona);
    setZonaSelecionada(zona);
    setTextoAvaria(atual || 'Risco / avaria prévia');
  }

  function handleSalvarAvaria() {
    if (!zonaSelecionada) return;
    const detalheLimpo = textoAvaria.trim();
    if (detalheLimpo) {
      const filtradas = avarias.filter((a) => a.zona !== zonaSelecionada);
      onChange([...filtradas, { zona: zonaSelecionada, detalhe: detalheLimpo }]);
    } else {
      onChange(avarias.filter((a) => a.zona !== zonaSelecionada));
    }
    setZonaSelecionada(null);
    setTextoAvaria('');
  }

  function handleRemoverAvaria(zona: ZonaAvaria) {
    onChange(avarias.filter((a) => a.zona !== zona));
    if (zonaSelecionada === zona) {
      setZonaSelecionada(null);
    }
  }

  const zonaAtivaConfig = ZONAS_CONFIG.find((z) => z.id === zonaSelecionada);

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center lg:items-start w-full">
      {/* Blueprint SVG do Veículo (HORIZONTAL / VIRADO DE LADO) */}
      <div className="relative flex-shrink-0 select-none">
        <svg
          viewBox="0 0 390 200"
          className="w-[290px] h-[155px] sm:w-[350px] sm:h-[185px] border border-neutral-300 rounded-lg bg-neutral-50 shadow-inner"
        >
          <defs>
            <filter id="shadow-car" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.25" />
            </filter>
          </defs>

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
                <circle cx={z.x} cy={z.y} r="7" fill="#e53e3e" stroke="#ffffff" strokeWidth="2" filter="url(#shadow-car)" />
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
      <div className="flex-1 w-full text-xs">
        {/* Editor de Avaria Aberto */}
        {zonaSelecionada && !somenteVisualizacao && (
          <div className="bg-amber-50 border border-amber-300 rounded p-2.5 mb-2.5 no-print animate-fade-in">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-amber-900 text-xs">
                Avaria: {zonaAtivaConfig?.nome}
              </span>
              <button
                type="button"
                onClick={() => setZonaSelecionada(null)}
                className="text-neutral-400 hover:text-neutral-700 text-sm leading-none"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2">
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
                placeholder="Ex: Risco profundo no vidro, picado de pedra, lataria com arranhão"
                className="flex-1 px-2 py-1 bg-white border border-neutral-300 rounded text-neutral-900 text-xs focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleSalvarAvaria}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-3 py-1 rounded text-xs"
              >
                Salvar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Avarias Registradas */}
        <div className="border border-neutral-200 rounded bg-white p-2 min-h-[105px]">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-200 mb-1">
            <span className="font-bold text-neutral-800 tracking-wide uppercase text-[11px]">
              Vistoria de Entrada / Avarias Pré-Existentes
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              {avarias.length} registrada(s)
            </span>
          </div>

          {avarias.length === 0 ? (
            <p className="text-neutral-400 italic text-[11px] py-2 text-center">
              Nenhuma avaria ou risco registrado no veículo (veículo íntegro na entrada).
            </p>
          ) : (
            <ul className="space-y-1">
              {avarias.map((a) => {
                const conf = ZONAS_CONFIG.find((z) => z.id === a.zona);
                return (
                  <li
                    key={a.zona}
                    className="flex items-center justify-between bg-red-50/80 border border-red-200 rounded px-2 py-1 text-neutral-900"
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      <span className="font-bold text-red-950 text-[11px] whitespace-nowrap">
                        {conf?.nome}:
                      </span>
                      <span className="text-neutral-700 truncate text-[11px]">
                        {a.detalhe}
                      </span>
                    </div>
                    {!somenteVisualizacao && (
                      <button
                        type="button"
                        onClick={() => handleRemoverAvaria(a.zona)}
                        className="text-red-400 hover:text-red-700 ml-2 no-print font-bold text-xs"
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
    </div>
  );
}
