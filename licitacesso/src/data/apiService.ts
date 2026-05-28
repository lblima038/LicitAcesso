import { Bid } from '../domain/entities';

const BASE_URL = 'https://licitacessobackend.onrender.com';

// ─── Response types ───────────────────────────────────────────────────────────

export interface OportunidadePorEstado {
  uf: string;
  periodo_inicio: string;
  periodo_fim: string;
  data_atualizacao: string;
  orgaos_distintos: number;
  total_contratacoes: number;
  valor_total: number;
}

export interface OportunidadePorArea {
  ramo_mei: string;
  periodo_inicio: string;
  periodo_fim: string;
  data_atualizacao: string;
  orgaos_distintos: number;
  total_contratacoes: number;
  valor_total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDefaultPeriod() {
  const today = new Date();
  const inicio = new Date(today);
  inicio.setDate(today.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
  return { periodo_inicio: fmt(inicio), periodo_fim: fmt(today) };
}

const STATE_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá',
  BA: 'Bahia', CE: 'Ceará', DF: 'Brasília', ES: 'Espírito Santo',
  GO: 'Goiás', MA: 'Maranhão', MG: 'Minas Gerais', MS: 'Mato Grosso do Sul',
  MT: 'Mato Grosso', PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco',
  PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro', RN: 'Rio G. do Norte',
  RO: 'Rondônia', RR: 'Roraima', RS: 'Rio G. do Sul', SC: 'Santa Catarina',
  SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins',
};

export function mapEstadoToBid(item: OportunidadePorEstado): Bid {
  return {
    id: item.uf,
    title: `Licitações em ${STATE_NAMES[item.uf] ?? item.uf}`,
    description: `${item.total_contratacoes} licitações abertas em ${item.orgaos_distintos} órgão(s) público(s).`,
    organization: `${item.orgaos_distintos} órgão(s) público(s)`,
    estimatedValue: item.valor_total,
    deadline: new Date(item.data_atualizacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }),
    location: STATE_NAMES[item.uf] ?? item.uf,
    category: 'Geral',
  };
}

export function mapAreaToBid(item: OportunidadePorArea): Bid {
  return {
    id: `area_${item.ramo_mei.replace(/\s+/g, '_')}`,
    title: item.ramo_mei,
    description: `${item.total_contratacoes} licitações em ${item.orgaos_distintos} órgão(s) público(s).`,
    organization: `${item.orgaos_distintos} órgão(s) público(s)`,
    estimatedValue: item.valor_total,
    deadline: new Date(item.data_atualizacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }),
    location: 'Todo o Brasil',
    category: item.ramo_mei,
  };
}

// ─── In-memory cache para o detail view ──────────────────────────────────────
export const bidCache = new Map<string, Bid>();

// ─── Fetch functions ──────────────────────────────────────────────────────────

export async function fetchPorEstado(uf?: string): Promise<OportunidadePorEstado[]> {
  const { periodo_inicio, periodo_fim } = getDefaultPeriod();
  const params = new URLSearchParams({ periodo_inicio, periodo_fim });
  if (uf) params.set('uf', uf);
  const res = await fetch(`${BASE_URL}/oportunidades/por-estado?${params}`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.por_estado ?? []);
}

export async function fetchPorAreaServico(ramo_mei?: string): Promise<OportunidadePorArea[]> {
  const { periodo_inicio, periodo_fim } = getDefaultPeriod();
  const params = new URLSearchParams({ periodo_inicio, periodo_fim });
  if (ramo_mei) params.set('ramo_mei', ramo_mei);
  const res = await fetch(`${BASE_URL}/oportunidades/por-area-servico?${params}`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.por_area_servico ?? []);
}

export async function fetchPorSituacao(situacao_nome?: string): Promise<OportunidadePorEstado[]> {
  const { periodo_inicio, periodo_fim } = getDefaultPeriod();
  const params = new URLSearchParams({ periodo_inicio, periodo_fim });
  if (situacao_nome) params.set('situacao_nome', situacao_nome);
  const res = await fetch(`${BASE_URL}/oportunidades/por-situacao?${params}`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.por_situacao ?? []);
}

export async function fetchPorFaixaValor(faixa_valor?: string): Promise<OportunidadePorEstado[]> {
  const { periodo_inicio, periodo_fim } = getDefaultPeriod();
  const params = new URLSearchParams({ periodo_inicio, periodo_fim });
  if (faixa_valor) params.set('faixa_valor', faixa_valor);
  const res = await fetch(`${BASE_URL}/oportunidades/por-faixa-valor?${params}`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.por_faixa_valor ?? []);
}

export async function fetchPorMes(mes: number, ano: number): Promise<OportunidadePorEstado[]> {
  const params = new URLSearchParams({ mes: String(mes), ano: String(ano) });
  const res = await fetch(`${BASE_URL}/oportunidades/por-mes?${params}`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.por_mes ?? []);
}
