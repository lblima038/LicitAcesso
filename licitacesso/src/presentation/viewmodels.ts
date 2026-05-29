import { useState, useEffect } from 'react';
import {
  fetchPorEstado,
  fetchPorAreaServico,
  fetchEditais,
  fetchFiltros,
  fetchEditalById,
  Edital,
  OportunidadePorEstado,
  OportunidadePorArea,
} from '../data/apiService';
import { MockUserRepository } from '../data/repositories';

const userRepo = new MockUserRepository();

export function useDashboardViewModel() {
  const [topEstados, setTopEstados] = useState<OportunidadePorEstado[]>([]);
  const [topAreas, setTopAreas] = useState<OportunidadePorArea[]>([]);
  const [statsNacionais, setStatsNacionais] = useState({
    totalLicitacoes: 0,
    totalValor: 0,
    numEstados: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [estados, areas] = await Promise.all([fetchPorEstado(), fetchPorAreaServico()]);
        const totalLicitacoes = estados.reduce((s, e) => s + e.total_contratacoes, 0);
        const totalValor = estados.reduce((s, e) => s + e.valor_total, 0);
        setStatsNacionais({ totalLicitacoes, totalValor, numEstados: estados.length });
        setTopEstados([...estados].sort((a, b) => b.valor_total - a.valor_total).slice(0, 5));
        setTopAreas([...areas].sort((a, b) => b.valor_total - a.valor_total).slice(0, 5));
      } catch {
        // mantém arrays vazios
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { statsNacionais, topEstados, topAreas, loading };
}

export function useMercadoViewModel() {
  const [tab, setTab] = useState<'estados' | 'areas'>('estados');
  const [estados, setEstados] = useState<OportunidadePorEstado[]>([]);
  const [areas, setAreas] = useState<OportunidadePorArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        const [e, a] = await Promise.all([fetchPorEstado(), fetchPorAreaServico()]);
        setEstados([...e].sort((a, b) => b.valor_total - a.valor_total));
        setAreas([...a].sort((a, b) => b.valor_total - a.valor_total));
      } catch {
        setError('Não foi possível carregar os dados de mercado.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { tab, setTab, estados, areas, loading, error };
}

const PERIODOS = { '7': 7, '30': 30, '90': 90, '365': 365 };

function dateRange(dias: number) {
  const today = new Date();
  const inicio = new Date(today);
  inicio.setDate(today.getDate() - dias);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { data_inicio: fmt(inicio), data_fim: fmt(today) };
}

export function useEditaisViewModel() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [paginacao, setPaginacao] = useState({ total: 0, pagina: 1, paginas: 0 });
  const [filtros, setFiltros] = useState<{ ramos_mei: string[]; situacoes: string[] }>({
    ramos_mei: [],
    situacoes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [periodo, setPeriodoState] = useState<keyof typeof PERIODOS>('30');
  const [ramoMei, setRamoMeiState] = useState('');
  const [situacao, setSituacaoState] = useState('');
  const [pagina, setPagina] = useState(1);

  const setPeriodo = (v: keyof typeof PERIODOS) => { setPeriodoState(v); setPagina(1); };
  const setRamoMei = (v: string) => { setRamoMeiState(v); setPagina(1); };
  const setSituacao = (v: string) => { setSituacaoState(v); setPagina(1); };

  useEffect(() => {
    fetchFiltros().then(setFiltros).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const { data_inicio, data_fim } = dateRange(PERIODOS[periodo]);
    setLoading(true);
    setError(null);
    fetchEditais({
      data_inicio,
      data_fim,
      ramo_mei: ramoMei || undefined,
      situacao_nome: situacao || undefined,
      pagina,
      tamanho: 20,
    })
      .then(result => {
        if (cancelled) return;
        setEditais(result.dados);
        setPaginacao({ total: result.paginacao.total, pagina, paginas: result.paginacao.paginas });
      })
      .catch(() => { if (!cancelled) setError('Não foi possível carregar os editais.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [periodo, ramoMei, situacao, pagina]);

  return {
    editais, paginacao, filtros, loading, error,
    periodo, setPeriodo,
    ramoMei, setRamoMei,
    situacao, setSituacao,
    pagina, setPagina,
  };
}

export function useEditalDetalheViewModel(id: string) {
  const [edital, setEdital] = useState<Edital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEditalById(id);
      setEdital(data);
    } catch {
      setError('Não foi possível carregar o edital.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  return { edital, loading, error, retry: load };
}

export function useBidDetailViewModel(_id: string) {
  return { bid: null as null, loading: false, error: 'Edital não disponível.', retry: () => {} };
}

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
