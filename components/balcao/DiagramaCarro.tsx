'use client';

import React, { useState } from 'react';
import type { ZonaAvaria, AvariaItem } from '@/types/balcao';

interface DiagramaCarroProps {
  avarias: AvariaItem[];
  onChange: (novasAvarias: AvariaItem[]) => void;
  somenteVisualizacao?: boolean;
}

const ZONAS_CONFIG: { id: ZonaAvaria; nome: string; sigla: string; x: number; y: number }[] = [
  { id: 'capo', nome: 'Capô / Frente', sigla: 'CP', x: 120, y: 70 },
  { id: 'parabrisa', nome: 'Parabrisa', sigla: 'PB', x: 120, y: 130 },
  { id: 'teto', nome: 'Teto / Solar', sigla: 'TT', x: 120, y: 200 },
  { id: 'vigia_traseiro', nome: 'Vigia / Vidro Traseiro', sigla: 'VT', x: 120, y: 270 },
  { id: 'traseira', nome: 'Porta-Malas / Traseira', sigla: 'TR', x: 120, y: 330 },
  { id: 'porta_diant_esq', nome: 'Porta Diant. Esquerda (Motorista)', sigla: 'PDE', x: 45, y: 150 },
  { id: 'porta_tras_esq', nome: 'Porta Tras. Esquerda', sigla: 'PTE', x: 45, y: 230 },
  { id: 'porta_diant_dir', nome: 'Porta Diant. Direita (Passageiro)', sigla: 'PDD', x: 195, y: 150 },
  { id: 'porta_tras_dir', nome: 'Porta Tras. Direita', sigla: 'PTD', x: 195, y: 230 },
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
      // Se deixou vazio, remove
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
    <div className="flex flex-col md:flex-row gap-4 items-center md:items-start w-full">
      {/* Blueprint SVG do Veículo */}
      <div className="relative flex-shrink-0 select-none">
        <svg
          viewBox="0 0 240 400"
          className="w-[180px] h-[300px] sm:w-[200px] sm:h-[330px] border border-neutral-300 rounded-lg bg-neutral-50 shadow-inner"
        >
          <defs>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Silhueta do Chassi do Carro */}
          <path
            d="M 60,60 
               C 60,30 90,20 120,20 
               C 150,20 180,30 180,60 
               L 190,120 
               L 195,280 
               L 185,350 
               C 180,380 150,385 120,385 
               C 90,385 60,380 55,350 
               L 45,280 
               L 50,120 Z"
            fill="#ffffff"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Retrovisores */}
          <path d="M 45,110 L 32,105 L 34,120 Z" fill="#333" stroke="#111" strokeWidth="1" />
          <path d="M 195,110 L 208,105 L 206,120 Z" fill="#333" stroke="#111" strokeWidth="1" />

          {/* Faróis Dianteiros e Traseiros */}
          <ellipse cx="75" cy="35" rx="8" ry="4" fill="#f5c518" stroke="#333" strokeWidth="0.8" />
          <ellipse cx="165" cy="35" rx="8" ry="4" fill="#f5c518" stroke="#333" strokeWidth="0.8" />
          <rect x="68" y="375" width="16" height="5" rx="2" fill="#e53e3e" stroke="#333" strokeWidth="0.8" />
          <rect x="156" y="375" width="16" height="5" rx="2" fill="#e53e3e" stroke="#333" strokeWidth="0.8" />

          {/* 1. Capô */}
          <path
            d="M 65,65 Q 120,55 175,65 L 175,95 Q 120,100 65,95 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('capo') ? 'fill-red-200 stroke-red-600' : 'fill-neutral-100 hover:fill-amber-100 stroke-neutral-700'
            }`}
            strokeWidth="1.2"
            onClick={() => handleCliqueZona('capo')}
          />
          <text x="120" y="82" fontSize="9" textAnchor="middle" fill="#666" className="pointer-events-none font-semibold">
            CAPÔ
          </text>

          {/* 2. Parabrisa Dianteiro */}
          <path
            d="M 66,105 Q 120,95 174,105 L 168,145 Q 120,150 72,145 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('parabrisa') ? 'fill-red-300 stroke-red-600' : 'fill-sky-100 hover:fill-amber-200 stroke-neutral-800'
            }`}
            strokeWidth="1.5"
            onClick={() => handleCliqueZona('parabrisa')}
          />
          <text x="120" y="128" fontSize="10" textAnchor="middle" fill="#1e3a8a" className="pointer-events-none font-bold">
            PARABRISA
          </text>

          {/* 3. Teto */}
          <rect
            x="70"
            y="152"
            width="100"
            height="95"
            rx="4"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('teto') ? 'fill-red-200 stroke-red-600' : 'fill-neutral-200 hover:fill-amber-100 stroke-neutral-600'
            }`}
            strokeWidth="1.2"
            onClick={() => handleCliqueZona('teto')}
          />
          <text x="120" y="204" fontSize="10" textAnchor="middle" fill="#444" className="pointer-events-none font-semibold">
            TETO
          </text>

          {/* 4. Vidro Traseiro (Vigia) */}
          <path
            d="M 72,253 Q 120,250 168,253 L 174,290 Q 120,298 66,290 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('vigia_traseiro') ? 'fill-red-300 stroke-red-600' : 'fill-sky-100 hover:fill-amber-200 stroke-neutral-800'
            }`}
            strokeWidth="1.5"
            onClick={() => handleCliqueZona('vigia_traseiro')}
          />
          <text x="120" y="275" fontSize="10" textAnchor="middle" fill="#1e3a8a" className="pointer-events-none font-bold">
            VIGIA TRAS.
          </text>

          {/* 5. Traseira / Porta-Malas */}
          <path
            d="M 66,298 Q 120,305 174,298 L 172,345 Q 120,355 68,345 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('traseira') ? 'fill-red-200 stroke-red-600' : 'fill-neutral-100 hover:fill-amber-100 stroke-neutral-700'
            }`}
            strokeWidth="1.2"
            onClick={() => handleCliqueZona('traseira')}
          />
          <text x="120" y="325" fontSize="9" textAnchor="middle" fill="#666" className="pointer-events-none font-semibold">
            TRASEIRA
          </text>

          {/* 6. Porta Dianteira Esquerda */}
          <path
            d="M 48,115 L 63,110 L 67,195 L 47,190 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('porta_diant_esq') ? 'fill-red-300 stroke-red-600' : 'fill-sky-50 hover:fill-amber-100 stroke-neutral-800'
            }`}
            strokeWidth="1.2"
            onClick={() => handleCliqueZona('porta_diant_esq')}
          />
          <text x="35" y="160" fontSize="8" textAnchor="middle" fill="#333" className="pointer-events-none font-semibold">
            P.D.E
          </text>

          {/* 7. Porta Traseira Esquerda */}
          <path
            d="M 47,195 L 67,197 L 68,275 L 46,270 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('porta_tras_esq') ? 'fill-red-300 stroke-red-600' : 'fill-sky-50 hover:fill-amber-100 stroke-neutral-800'
            }`}
            strokeWidth="1.2"
            onClick={() => handleCliqueZona('porta_tras_esq')}
          />
          <text x="35" y="240" fontSize="8" textAnchor="middle" fill="#333" className="pointer-events-none font-semibold">
            P.T.E
          </text>

          {/* 8. Porta Dianteira Direita */}
          <path
            d="M 192,115 L 177,110 L 173,195 L 193,190 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('porta_diant_dir') ? 'fill-red-300 stroke-red-600' : 'fill-sky-50 hover:fill-amber-100 stroke-neutral-800'
            }`}
            strokeWidth="1.2"
            onClick={() => handleCliqueZona('porta_diant_dir')}
          />
          <text x="205" y="160" fontSize="8" textAnchor="middle" fill="#333" className="pointer-events-none font-semibold">
            P.D.D
          </text>

          {/* 9. Porta Traseira Direita */}
          <path
            d="M 193,195 L 173,197 L 172,275 L 194,270 Z"
            className={`cursor-pointer transition-colors duration-150 ${
              mapaAvarias.has('porta_tras_dir') ? 'fill-red-300 stroke-red-600' : 'fill-sky-50 hover:fill-amber-100 stroke-neutral-800'
            }`}
            strokeWidth="1.2"
            onClick={() => handleCliqueZona('porta_tras_dir')}
          />
          <text x="205" y="240" fontSize="8" textAnchor="middle" fill="#333" className="pointer-events-none font-semibold">
            P.T.D
          </text>

          {/* Marcadores vermelhos para zonas com avaria */}
          {ZONAS_CONFIG.map((z) => {
            if (!mapaAvarias.has(z.id)) return null;
            return (
              <g key={z.id}>
                <circle cx={z.x} cy={z.y} r="8" fill="#e53e3e" stroke="#ffffff" strokeWidth="2" filter="url(#shadow)" />
                <text x={z.x} y={z.y + 3} fontSize="8" textAnchor="middle" fill="#ffffff" fontWeight="bold">
                  !
                </text>
              </g>
            );
          })}
        </svg>

        <p className="text-[10px] text-center text-neutral-500 mt-1 no-print">
          Clique na parte do carro para registrar avaria/risco
        </p>
      </div>

      {/* Painel lateral: Edição e Lista de Avarias */}
      <div className="flex-1 w-full text-xs">
        {/* Editor de Avaria Aberto */}
        {zonaSelecionada && !somenteVisualizacao && (
          <div className="bg-amber-50 border border-amber-300 rounded p-2.5 mb-3 no-print animate-fade-in">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-amber-900">
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
                placeholder="Ex: Risco profundo no vidro, picado de pedra, lataria amassada"
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
        <div className="border border-neutral-200 rounded bg-white p-2 min-h-[120px]">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-200 mb-1.5">
            <span className="font-bold text-neutral-800 tracking-wide uppercase text-[11px]">
              Vistoria de Entrada / Avarias Pré-Existentes
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              {avarias.length} registrada(s)
            </span>
          </div>

          {avarias.length === 0 ? (
            <p className="text-neutral-400 italic text-[11px] py-3 text-center">
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
