'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import type { Orcamento, OrdemServico } from '@/types';

interface Stats {
  pendentes: number;
  aprovados: number;
  osAbertas: number;
  osConcluidas: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ pendentes: 0, aprovados: 0, osAbertas: 0, osConcluidas: 0 });
  const [recentOrc, setRecentOrc] = useState<Orcamento[]>([]);
  const [recentOS, setRecentOS] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    const [orcRes, osRes, recentOrcRes, recentOSRes] = await Promise.all([
      supabase.from('orcamentos').select('status'),
      supabase.from('ordens_servico').select('status'),
      supabase.from('orcamentos').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('ordens_servico').select('*').order('created_at', { ascending: false }).limit(5),
    ]);
    const orcs = orcRes.data || [];
    const oss = osRes.data || [];
    setStats({
      pendentes: orcs.filter(o => o.status === 'Pendente').length,
      aprovados: orcs.filter(o => o.status === 'Aprovado').length,
      osAbertas: oss.filter(o => o.status === 'Aberta' || o.status === 'Em Andamento').length,
      osConcluidas: oss.filter(o => o.status === 'Concluída').length,
    });
    setRecentOrc(recentOrcRes.data || []);
    setRecentOS(recentOSRes.data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-6 h-6 border-2 rounded-full animate-spin border-[#222222] border-t-[#f5c518]" />
      </div>
    );
  }

  const cards = [
    { label: 'Orçamentos Pendentes', value: stats.pendentes },
    { label: 'Orçamentos Aprovados', value: stats.aprovados },
    { label: 'OS Abertas', value: stats.osAbertas },
    { label: 'OS Concluídas', value: stats.osConcluidas },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header da página */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '24px',
            color: '#f0f0f0',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Dashboard
          </h1>
          <p style={{ color: '#555', fontSize: '13px', margin: '4px 0 0 0' }}>
            Visão geral do negócio
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              background: '#161616',
              border: '1px solid #2a2a2a',
              borderRadius: '10px',
              padding: '22px 24px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,197,24,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
          >
            {/* Linha de destaque no topo do card */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, #f5c518, transparent)',
              opacity: 0.4,
            }} />

            <p style={{
              fontSize: '11px',
              color: '#555',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: '0 0 14px 0',
              fontWeight: 500,
            }}>
              {card.label}
            </p>

            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '42px',
              fontWeight: 700,
              color: '#f5c518',
              margin: 0,
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Últimos Orçamentos */}
        <div style={{
          background: '#141414',
          border: '1px solid #242424',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 20px',
            borderBottom: '1px solid #1f1f1f',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 600,
              color: '#d0d0d0',
            }}>
              Últimos Orçamentos
            </span>
            <Link href="/orcamentos" style={{
              fontSize: '12px',
              color: '#f5c518',
              textDecoration: 'none',
            }}>
              Ver todos →
            </Link>
          </div>
          {recentOrc.length === 0 ? (
            <div style={{
              padding: '48px 20px',
              textAlign: 'center',
              color: '#444',
              fontSize: '13px',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#333',
              }}>
                ☐
              </div>
              Nenhum registro ainda
            </div>
          ) : (
            <div>
              {recentOrc.map((orc) => (
                <Link
                  key={orc.id}
                  href={`/orcamentos/${orc.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-[#222222] last:border-b-0 hover:bg-[#1a1a1a] transition-colors duration-150"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#f5c518] mb-0.5">{orc.numero}</p>
                    <p className="text-[13px] text-[#cccccc] truncate">{orc.cliente}</p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-2">
                    <StatusBadge status={orc.status} />
                    <span className="font-mono text-sm font-medium text-white">{formatCurrency(orc.total_geral)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Últimas OS */}
        <div style={{
          background: '#141414',
          border: '1px solid #242424',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 20px',
            borderBottom: '1px solid #1f1f1f',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 600,
              color: '#d0d0d0',
            }}>
              Últimas Ordens de Serviço
            </span>
            <Link href="/ordens-servico" style={{
              fontSize: '12px',
              color: '#f5c518',
              textDecoration: 'none',
            }}>
              Ver todas →
            </Link>
          </div>
          {recentOS.length === 0 ? (
            <div style={{
              padding: '48px 20px',
              textAlign: 'center',
              color: '#444',
              fontSize: '13px',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#333',
              }}>
                ☐
              </div>
              Nenhum registro ainda
            </div>
          ) : (
            <div>
              {recentOS.map((os) => (
                <Link
                  key={os.id}
                  href={`/ordens-servico/${os.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-[#222222] last:border-b-0 hover:bg-[#1a1a1a] transition-colors duration-150"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#f5c518] mb-0.5">{os.numero}</p>
                    <p className="text-[13px] text-[#cccccc] truncate">{os.cliente}</p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-2">
                    <StatusBadge status={os.status} />
                    <span className="font-mono text-sm font-medium text-white">{formatCurrency(os.total_geral)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
