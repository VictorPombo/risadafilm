'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import OrdemServicoForm from '@/components/OrdemServicoForm';
import type { OrdemServico } from '@/types';

export default function EditOSPage() {
  const { id } = useParams<{ id: string }>();
  const [os, setOS] = useState<OrdemServico | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: osData } = await supabase.from('ordens_servico').select('*').eq('id', id).single();
      const { data: itens } = await supabase.from('os_itens').select('*').eq('ordem_servico_id', id).order('ordem');
      if (osData) setOS({ ...osData, itens: itens || [] });
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#333', borderTopColor: '#d4af37' }} />
      </div>
    );
  }

  if (!os) {
    return <p className="text-center py-16" style={{ color: '#555' }}>Ordem de Serviço não encontrada.</p>;
  }

  return <OrdemServicoForm ordemServico={os} />;
}
