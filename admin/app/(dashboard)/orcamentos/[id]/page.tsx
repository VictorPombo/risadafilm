'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import OrcamentoForm from '@/components/OrcamentoForm';
import type { Orcamento } from '@/types';

export default function EditOrcamentoPage() {
  const { id } = useParams<{ id: string }>();
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: orc } = await supabase.from('orcamentos').select('*').eq('id', id).single();
      const { data: itens } = await supabase.from('orcamento_itens').select('*').eq('orcamento_id', id).order('ordem');
      if (orc) setOrcamento({ ...orc, itens: itens || [] });
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

  if (!orcamento) {
    return <p className="text-center py-16" style={{ color: '#555' }}>Orçamento não encontrado.</p>;
  }

  return <OrcamentoForm orcamento={orcamento} />;
}
