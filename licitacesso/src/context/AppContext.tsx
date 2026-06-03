import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { UploadedDocument, AppAlert, Proposal, AppDeadline } from '../domain/entities';

// AsyncStorage — graceful fallback to in-memory if not yet installed
let _AS: { getItem(k: string): Promise<string | null>; setItem(k: string, v: string): Promise<void>; removeItem(k: string): Promise<void> };
try {
  const mod = require('@react-native-async-storage/async-storage').default;
  _AS = mod;
} catch {
  const mem: Record<string, string> = {};
  _AS = {
    getItem: async k => mem[k] ?? null,
    setItem: async (k, v) => { mem[k] = v; },
    removeItem: async k => { delete mem[k]; },
  };
}

// App user — stored in AsyncStorage, no Firebase required
export type AppUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
} | null;

const MOCK_ALERTS: AppAlert[] = [
  { id: '1', type: 'novo_edital', title: 'Novo edital disponível', description: 'Edital de limpeza urbana — Prefeitura de São Paulo publicou nova licitação', dateTime: '2026-06-02T08:00:00Z', isRead: false },
  { id: '2', type: 'prazo_proximo', title: 'Prazo se aproximando', description: 'Inscrição para edital de TI do Ministério da Saúde encerra em 2 dias', dateTime: '2026-06-01T14:30:00Z', isRead: false },
  { id: '3', type: 'resultado', title: 'Resultado publicado', description: 'Você foi classificado na fase 2 da licitação de Serviços de TI #2024-001', dateTime: '2026-05-30T09:15:00Z', isRead: false },
  { id: '4', type: 'atualizacao', title: 'Edital atualizado', description: 'Critérios e documentação do edital de consultoria foram revisados', dateTime: '2026-05-28T16:00:00Z', isRead: true },
  { id: '5', type: 'novo_edital', title: 'Nova oportunidade em SP', description: 'Licitação para serviços de manutenção predial — valor estimado R$ 450.000', dateTime: '2026-05-27T11:00:00Z', isRead: true },
];

const MOCK_DEADLINES: AppDeadline[] = [
  { id: '1', title: 'Inscrição — Limpeza Urbana SP', date: '2026-06-05', description: 'Prazo final para envio de propostas' },
  { id: '2', title: 'Entrega de Documentos — TI Gov', date: '2026-06-10', description: 'Documentação técnica e certidões' },
  { id: '3', title: 'Resultado Fase 1 — Consultoria', date: '2026-06-18', description: 'Publicação dos classificados na fase habilitatória' },
];

const MOCK_PROPOSALS: Proposal[] = [
  { id: '1', name: 'Serviços de TI — Ministério da Saúde', organization: 'Ministério da Saúde', date: '2026-05-15', status: 'ganhou' },
  { id: '2', name: 'Limpeza e Conservação — Prefeitura SP', organization: 'Prefeitura de São Paulo', date: '2026-05-20', status: 'em_andamento' },
  { id: '3', name: 'Consultoria Financeira — TCU', organization: 'TCU', date: '2026-04-10', status: 'perdeu' },
  { id: '4', name: 'Manutenção Predial — INSS', organization: 'INSS', date: '2026-04-01', status: 'cancelado' },
  { id: '5', name: 'Desenvolvimento de Software — Serpro', organization: 'Serpro', date: '2026-03-20', status: 'ganhou' },
  { id: '6', name: 'Fornecimento de Equipamentos — MEC', organization: 'Ministério da Educação', date: '2026-03-05', status: 'em_andamento' },
];

const KEYS = {
  USER: '@licitacesso:user_v1',
  DOCUMENTS: '@licitacesso:documents_v1',
  ALERTS_READ: '@licitacesso:alerts_read_v1',
  PROPOSALS: '@licitacesso:proposals_cache_v1',
  PROPOSALS_TIME: '@licitacesso:proposals_time_v1',
};

const PROPOSALS_TTL = 5 * 60 * 1000;

interface AppContextValue {
  firebaseUser: AppUser;
  authLoading: boolean;
  documents: UploadedDocument[];
  alerts: AppAlert[];
  deadlines: AppDeadline[];
  proposals: Proposal[];
  unreadAlerts: number;
  login: (user: NonNullable<AppUser>) => Promise<void>;
  logout: () => Promise<void>;
  addDocument: (doc: UploadedDocument) => void;
  markAlertAsRead: (id: string) => void;
  markAllAlertsAsRead: () => void;
}

const AppContext = createContext<AppContextValue>({
  firebaseUser: null,
  authLoading: true,
  documents: [],
  alerts: MOCK_ALERTS,
  deadlines: MOCK_DEADLINES,
  proposals: MOCK_PROPOSALS,
  unreadAlerts: MOCK_ALERTS.filter(a => !a.isRead).length,
  login: async () => {},
  logout: async () => {},
  addDocument: () => {},
  markAlertAsRead: () => {},
  markAllAlertsAsRead: () => {},
});

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<AppUser>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [alerts, setAlerts] = useState<AppAlert[]>(MOCK_ALERTS);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  // Restore user session from AsyncStorage
  useEffect(() => {
    _AS.getItem(KEYS.USER).then(raw => {
      if (raw) setFirebaseUser(JSON.parse(raw));
    }).catch(() => {}).finally(() => setAuthLoading(false));
  }, []);

  // Restore documents
  useEffect(() => {
    _AS.getItem(KEYS.DOCUMENTS).then(raw => {
      if (raw) setDocuments(JSON.parse(raw));
    }).catch(() => {});
  }, []);

  // Restore alert read states
  useEffect(() => {
    _AS.getItem(KEYS.ALERTS_READ).then(raw => {
      if (!raw) return;
      const readIds: string[] = JSON.parse(raw);
      setAlerts(prev => prev.map(a => ({ ...a, isRead: readIds.includes(a.id) || a.isRead })));
    }).catch(() => {});
  }, []);

  // Load proposals (cached 5 min)
  useEffect(() => {
    (async () => {
      try {
        const [timeRaw, cacheRaw] = await Promise.all([
          _AS.getItem(KEYS.PROPOSALS_TIME),
          _AS.getItem(KEYS.PROPOSALS),
        ]);
        if (timeRaw && cacheRaw && Date.now() - Number(timeRaw) < PROPOSALS_TTL) {
          setProposals(JSON.parse(cacheRaw));
          return;
        }
      } catch {}
      setProposals(MOCK_PROPOSALS);
      _AS.setItem(KEYS.PROPOSALS, JSON.stringify(MOCK_PROPOSALS)).catch(() => {});
      _AS.setItem(KEYS.PROPOSALS_TIME, String(Date.now())).catch(() => {});
    })();
  }, []);

  const login = useCallback(async (user: NonNullable<AppUser>) => {
    await _AS.setItem(KEYS.USER, JSON.stringify(user));
    setFirebaseUser(user);
  }, []);

  const logout = useCallback(async () => {
    if (Platform.OS !== 'web') {
      try {
        const { signOutGoogle } = require('./authService');
        await signOutGoogle();
      } catch {}
    }
    await _AS.removeItem(KEYS.USER);
    setFirebaseUser(null);
  }, []);

  const addDocument = useCallback((doc: UploadedDocument) => {
    setDocuments(prev => {
      const updated = [doc, ...prev];
      _AS.setItem(KEYS.DOCUMENTS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const markAlertAsRead = useCallback((id: string) => {
    setAlerts(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, isRead: true } : a);
      const readIds = updated.filter(a => a.isRead).map(a => a.id);
      _AS.setItem(KEYS.ALERTS_READ, JSON.stringify(readIds)).catch(() => {});
      return updated;
    });
  }, []);

  const markAllAlertsAsRead = useCallback(() => {
    setAlerts(prev => {
      const updated = prev.map(a => ({ ...a, isRead: true }));
      _AS.setItem(KEYS.ALERTS_READ, JSON.stringify(updated.map(a => a.id))).catch(() => {});
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      firebaseUser,
      authLoading,
      documents,
      alerts,
      deadlines: MOCK_DEADLINES,
      proposals,
      unreadAlerts: alerts.filter(a => !a.isRead).length,
      login,
      logout,
      addDocument,
      markAlertAsRead,
      markAllAlertsAsRead,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  return useContext(AppContext);
}
