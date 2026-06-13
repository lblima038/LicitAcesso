import { Bid } from '../domain/entities';

const BASE_URL = 'http://localhost:3000';

// ─── Auth CNPJ ────────────────────────────────────────────────────────────────

export interface CnpjAuthResponse {
  access_token: string;
  user: { id: string; name: string; email: string; cnpj?: string };
}

export async function loginWithCnpj(cnpj: string, senha: string): Promise<CnpjAuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/cnpj/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cnpj: cnpj.replace(/\D/g, ''), senha }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `Erro ${res.status}`);
  }
  return res.json();
}

export async function registerWithCnpj(dto: {
  nomeEmpresa: string;
  cnpj: string;
  email: string;
  senha: string;
}): Promise<CnpjAuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/cnpj/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...dto, cnpj: dto.cnpj.replace(/\D/g, '') }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `Erro ${res.status}`);
  }
  return res.json();
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

// ─── Editais ──────────────────────────────────────────────────────────────────

export interface Edital {
  _id: string;
  ano_compra: number;
  data_publicacao_pncp: string;
  modalidade_nome: string;
  municipio_nome: string;
  objeto_compra: string;
  ramo_mei: string;
  valor_total_estimado: number;
  situacao_nome: string;
  [key: string]: any;
}

export interface EditaisResponse {
  dados: Edital[];
  paginacao: { total: number; pagina: number; tamanho: number; paginas: number };
}

export async function fetchEditais(params: {
  data_inicio?: string;
  data_fim?: string;
  ramo_mei?: string;
  situacao_nome?: string;
  pagina?: number;
  tamanho?: number;
}): Promise<EditaisResponse> {
  const p = new URLSearchParams();
  if (params.data_inicio) p.set('data_inicio', params.data_inicio);
  if (params.data_fim) p.set('data_fim', params.data_fim);
  if (params.ramo_mei) p.set('ramo_mei', params.ramo_mei);
  if (params.situacao_nome) p.set('situacao_nome', params.situacao_nome);
  if (params.pagina) p.set('pagina', String(params.pagina));
  if (params.tamanho) p.set('tamanho', String(params.tamanho));
  const res = await fetch(`${BASE_URL}/editais?${p}`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function fetchFiltros(): Promise<{ ramos_mei: string[]; situacoes: string[] }> {
  const res = await fetch(`${BASE_URL}/editais/filtros`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function fetchEditalById(id: string): Promise<Edital> {
  const res = await fetch(`${BASE_URL}/editais/${id}`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

// ─── Oportunidades ────────────────────────────────────────────────────────────

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

export const bidCache = new Map<string, Bid>();

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

// ─── Checklist ────────────────────────────────────────────────────────────────

export interface ChecklistDocument {
  id: string;
  bidId: string;
  docType: string;
  title: string;
  description: string;
  status: string;
  lastUpdated?: string;
  actionUrl?: string;
}

export async function fetchChecklist(bidId: string, token: string): Promise<ChecklistDocument[]> {
  const res = await fetch(`${BASE_URL}/checklist/${bidId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function updateChecklistStatus(
  bidId: string,
  docId: string,
  status: string,
  token: string,
): Promise<ChecklistDocument> {
  const res = await fetch(`${BASE_URL}/checklist/${bidId}/${docId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

// ─── Documentos do usuário ────────────────────────────────────────────────────

export interface ApiUserDocument {
  id: string;
  name: string;
  mimeType: string;
  uploadDate: string;
  status: string;
  size?: number;
}

export async function fetchUserDocuments(token: string): Promise<ApiUserDocument[]> {
  const res = await fetch(`${BASE_URL}/documents`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function createUserDocument(
  doc: { name: string; mimeType: string; uploadDate: string; size?: number; content?: string },
  token: string,
): Promise<ApiUserDocument> {
  const res = await fetch(`${BASE_URL}/documents`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(doc),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function deleteUserDocument(id: string, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/documents/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
}

// ─── Alertas ──────────────────────────────────────────────────────────────────

export interface ApiAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  dateTime: string;
  isRead: boolean;
}

export interface ApiDeadline {
  id: string;
  title: string;
  date: string;
  description?: string;
  bidId?: string;
}

export async function fetchAlerts(token: string): Promise<ApiAlert[]> {
  const res = await fetch(`${BASE_URL}/alerts`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function markAlertRead(id: string, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/alerts/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
}

export async function markAllAlertsRead(token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/alerts/read-all`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
}

export async function createAlert(
  dto: { type: string; title: string; description: string; dateTime?: string },
  token: string,
): Promise<ApiAlert> {
  const res = await fetch(`${BASE_URL}/alerts`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function fetchDeadlines(token: string): Promise<ApiDeadline[]> {
  const res = await fetch(`${BASE_URL}/alerts/deadlines`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

// ─── Favoritos ────────────────────────────────────────────────────────────────

export interface ApiFavorite {
  id: string;
  bidId: string;
  objeto_compra: string;
  municipio_nome?: string;
  valor_total_estimado?: number;
  situacao_nome?: string;
  ramo_mei?: string;
  modalidade_nome?: string;
  data_publicacao_pncp?: string;
  createdAt: string;
}

export async function fetchFavorites(token: string): Promise<ApiFavorite[]> {
  const res = await fetch(`${BASE_URL}/favorites`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function addFavorite(
  dto: Omit<ApiFavorite, 'id' | 'createdAt'>,
  token: string,
): Promise<ApiFavorite> {
  const res = await fetch(`${BASE_URL}/favorites`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function removeFavorite(bidId: string, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/favorites/${bidId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
}

// ─── Proposals ────────────────────────────────────────────────────────────────

export interface ApiProposal {
  id: string;
  name: string;
  organization: string;
  date: string;
  status: string;
  bidId?: string;
}

export async function fetchProposals(token: string): Promise<ApiProposal[]> {
  const res = await fetch(`${BASE_URL}/proposals`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function createProposal(
  dto: { name: string; organization: string; date: string; status?: string; bidId?: string },
  token: string,
): Promise<ApiProposal> {
  const res = await fetch(`${BASE_URL}/proposals`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function updateProposal(
  id: string,
  dto: { status?: string; name?: string; organization?: string },
  token: string,
): Promise<ApiProposal> {
  const res = await fetch(`${BASE_URL}/proposals/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}
