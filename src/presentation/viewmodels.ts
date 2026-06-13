import { useState, useEffect } from 'react';
import {
  fetchPorEstado,
  fetchPorAreaServico,
  fetchEditais,
  fetchFiltros,
  fetchEditalById,
  fetchChecklist,
  updateChecklistStatus,
  Edital,
  OportunidadePorEstado,
  OportunidadePorArea,
  ChecklistDocument,
} from '../data/apiService';
import { useAppContext } from '../context/AppContext';

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
  const [municipio, setMunicipioState] = useState('');
  const [pagina, setPagina] = useState(1);

  const setPeriodo = (v: keyof typeof PERIODOS) => { setPeriodoState(v); setPagina(1); };
  const setRamoMei = (v: string) => { setRamoMeiState(v); setPagina(1); };
  const setSituacao = (v: string) => { setSituacaoState(v); setPagina(1); };
  const setMunicipio = (v: string) => { setMunicipioState(v); setPagina(1); };

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
      municipio_nome: municipio || undefined,
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
  }, [periodo, ramoMei, situacao, municipio, pagina]);

  return {
    editais, paginacao, filtros, loading, error,
    periodo, setPeriodo,
    ramoMei, setRamoMei,
    situacao, setSituacao,
    municipio, setMunicipio,
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
  const { token } = useAppContext();
  const [documents, setDocuments] = useState<ChecklistDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const docs = await fetchChecklist(bidId, token);
      setDocuments(docs);
    } catch {
      setError('Não foi possível carregar o checklist.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [bidId, token]);

  const updateStatus = async (docId: string, status: string) => {
    if (!token) return;
    try {
      const updated = await updateChecklistStatus(bidId, docId, status, token);
      setDocuments(prev => prev.map(d => d.id === updated.id ? updated : d));
    } catch {}
  };

  const progress =
    documents.length > 0
      ? Math.round(
          (documents.filter(d => d.status === 'ok').length / documents.length) * 100
        )
      : 0;

  return { documents, progress, loading, error, updateStatus };
}
