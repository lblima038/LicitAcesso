import { useState, useEffect } from 'react';
import { Bid } from '../domain/entities';
import {
  bidCache,
  fetchPorEstado,
  fetchPorAreaServico,
  mapEstadoToBid,
  mapAreaToBid,
} from '../data/apiService';
import { MockUserRepository } from '../data/repositories';

const userRepo = new MockUserRepository();

// ─── Mapeamento de filtro → chamada de API ────────────────────────────────────

async function loadBidsByFilter(filter: string): Promise<Bid[]> {
  switch (filter) {
    case 'obras':
      return (await fetchPorAreaServico('Construção Civil')).map(mapAreaToBid);
    case 'papelaria':
      return (await fetchPorAreaServico('Compras')).map(mapAreaToBid);
    default:
      // 'all', 'nearby', 'urgent' — carrega por estado
      return (await fetchPorEstado()).map(mapEstadoToBid);
  }
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useDashboardViewModel() {
  const [recommendedBids, setRecommendedBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPorEstado()
      .then(items => {
        const sorted = [...items].sort((a, b) => b.valor_total - a.valor_total);
        const bids = sorted.slice(0, 3).map(mapEstadoToBid);
        bids.forEach(b => bidCache.set(b.id, b));
        setRecommendedBids(bids);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user: null, recommendedBids, loading };
}

// ─── Editais (lista) ──────────────────────────────────────────────────────────

export function useEditaisViewModel() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilterState] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadBids(filter: string) {
    setLoading(true);
    setError(null);
    try {
      const loaded = await loadBidsByFilter(filter);
      loaded.forEach(b => bidCache.set(b.id, b));
      setBids(loaded);
    } catch {
      setError('Não foi possível carregar as oportunidades.');
    } finally {
      setLoading(false);
    }
  }

  function setActiveFilter(f: string) {
    setActiveFilterState(f);
    loadBids(f);
  }

  useEffect(() => { loadBids('all'); }, []);

  const filteredBids = bids.filter(bid => {
    if (activeFilter === 'urgent') return (bid.estimatedValue ?? 0) > 500_000;
    const q = searchQuery.toLowerCase();
    return (
      bid.title.toLowerCase().includes(q) ||
      bid.organization.toLowerCase().includes(q)
    );
  });

  return {
    filteredBids,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    loading,
    error,
    retry: () => loadBids(activeFilter),
  };
}

// ─── Detalhe do edital ────────────────────────────────────────────────────────

export function useBidDetailViewModel(id: string) {
  const [bid, setBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadBid() {
    setLoading(true);
    setError(null);
    try {
      // Tenta o cache primeiro; se vazio, busca por estado
      let found = bidCache.get(id) ?? null;
      if (!found) {
        // id pode ser uma UF (ex: "SP") ou um id de área
        const items = await fetchPorEstado(id.length === 2 ? id : undefined);
        const bids = items.map(mapEstadoToBid);
        bids.forEach(b => bidCache.set(b.id, b));
        found = bidCache.get(id) ?? null;
      }
      setBid(found);
    } catch {
      setError('Não foi possível carregar o edital.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBid(); }, [id]);

  return { bid, loading, error, retry: loadBid };
}

// ─── Checklist ────────────────────────────────────────────────────────────────

export function useChecklistViewModel(bidId: string) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userRepo.getDocumentsForBid(bidId).then(docs => {
      setDocuments(docs);
      setLoading(false);
    });
  }, [bidId]);

  const progress =
    documents.length > 0
      ? Math.round(
          (documents.filter(d => d.status === 'ok').length / documents.length) * 100
        )
      : 0;

  return { documents, progress, loading };
}
