import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { UploadedDocument, AppAlert, Proposal, AppDeadline } from '../domain/entities';
import {
  fetchAlerts,
  fetchDeadlines,
  fetchUserDocuments,
  createUserDocument,
  deleteUserDocument,
  markAlertRead,
  markAllAlertsRead,
  fetchProposals,
  createProposal as apiCreateProposal,
  updateProposal as apiUpdateProposal,
  fetchFavorites,
  addFavorite as apiAddFavorite,
  removeFavorite as apiRemoveFavorite,
  ApiAlert,
  ApiDeadline,
  ApiProposal,
  ApiFavorite,
} from '../data/apiService';

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

export type AppUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
} | null;

const KEYS = {
  USER:      '@licitacesso:user_v1',
  TOKEN:     '@licitacesso:token_v1',
  DOCUMENTS: '@licitacesso:documents_v1',
};

function apiAlertToApp(a: ApiAlert): AppAlert {
  return { id: a.id, type: a.type as AppAlert['type'], title: a.title, description: a.description, dateTime: a.dateTime, isRead: a.isRead };
}
function apiDeadlineToApp(d: ApiDeadline): AppDeadline {
  return { id: d.id, title: d.title, date: d.date, description: d.description };
}
function apiProposalToApp(p: ApiProposal): Proposal {
  return { id: p.id, name: p.name, organization: p.organization, date: p.date, status: p.status as Proposal['status'] };
}

interface AppContextValue {
  firebaseUser: AppUser;
  authLoading: boolean;
  token: string | null;
  documents: UploadedDocument[];
  alerts: AppAlert[];
  deadlines: AppDeadline[];
  proposals: Proposal[];
  favorites: ApiFavorite[];
  favoritedIds: Set<string>;
  unreadAlerts: number;
  login: (user: NonNullable<AppUser>, accessToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  addDocument: (doc: UploadedDocument) => Promise<void>;
  removeDocument: (id: string) => Promise<void>;
  markAlertAsRead: (id: string) => Promise<void>;
  markAllAlertsAsRead: () => Promise<void>;
  addProposal: (dto: { name: string; organization: string; date: string; status?: string; bidId?: string }) => Promise<void>;
  updateProposalStatus: (id: string, status: string) => Promise<void>;
  toggleFavorite: (edital: Omit<ApiFavorite, 'id' | 'createdAt'>) => Promise<void>;
  refreshAlerts: () => Promise<void>;
  refreshDocuments: () => Promise<void>;
  refreshProposals: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const AppContext = createContext<AppContextValue>({
  firebaseUser: null,
  authLoading: true,
  token: null,
  documents: [],
  alerts: [],
  deadlines: [],
  proposals: [],
  favorites: [],
  favoritedIds: new Set(),
  unreadAlerts: 0,
  login: async () => {},
  logout: async () => {},
  addDocument: async () => {},
  removeDocument: async () => {},
  markAlertAsRead: async () => {},
  markAllAlertsAsRead: async () => {},
  addProposal: async () => {},
  updateProposalStatus: async () => {},
  toggleFavorite: async () => {},
  refreshAlerts: async () => {},
  refreshDocuments: async () => {},
  refreshProposals: async () => {},
  refreshFavorites: async () => {},
});

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<AppUser>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [alerts, setAlerts] = useState<AppAlert[]>([]);
  const [deadlines, setDeadlines] = useState<AppDeadline[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [favorites, setFavorites] = useState<ApiFavorite[]>([]);

  const favoritedIds = new Set(favorites.map(f => f.bidId));

  // Restore user session and token
  useEffect(() => {
    Promise.all([_AS.getItem(KEYS.USER), _AS.getItem(KEYS.TOKEN)])
      .then(([userRaw, storedToken]) => {
        if (userRaw) setFirebaseUser(JSON.parse(userRaw));
        if (storedToken) setToken(storedToken);
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  const loadAlertsAndDeadlines = useCallback(async (t: string) => {
    try {
      const [a, d] = await Promise.all([fetchAlerts(t), fetchDeadlines(t)]);
      setAlerts(a.map(apiAlertToApp));
      setDeadlines(d.map(apiDeadlineToApp));
    } catch {}
  }, []);

  const loadDocuments = useCallback(async (t: string) => {
    try {
      const docs = await fetchUserDocuments(t);
      setDocuments(docs.map(d => ({
        id: d.id, name: d.name, mimeType: d.mimeType,
        uploadDate: d.uploadDate, status: d.status as UploadedDocument['status'], size: d.size,
      })));
    } catch {
      const raw = await _AS.getItem(KEYS.DOCUMENTS).catch(() => null);
      if (raw) setDocuments(JSON.parse(raw));
    }
  }, []);

  const loadProposals = useCallback(async (t: string) => {
    try {
      const data = await fetchProposals(t);
      setProposals(data.map(apiProposalToApp));
    } catch {}
  }, []);

  const loadFavorites = useCallback(async (t: string) => {
    try {
      const data = await fetchFavorites(t);
      setFavorites(data);
    } catch {}
  }, []);

  // Load all backend data once token is available
  useEffect(() => {
    if (!token) return;
    loadAlertsAndDeadlines(token);
    loadDocuments(token);
    loadProposals(token);
    loadFavorites(token);
  }, [token]);

  const login = useCallback(async (user: NonNullable<AppUser>, accessToken?: string) => {
    await _AS.setItem(KEYS.USER, JSON.stringify(user));
    setFirebaseUser(user);
    if (accessToken) {
      await _AS.setItem(KEYS.TOKEN, accessToken);
      setToken(accessToken);
    }
  }, []);

  const logout = useCallback(async () => {
    if (Platform.OS !== 'web') {
      try { const { signOutGoogle } = require('./authService'); await signOutGoogle(); } catch {}
    }
    await Promise.all([_AS.removeItem(KEYS.USER), _AS.removeItem(KEYS.TOKEN)]);
    setFirebaseUser(null);
    setToken(null);
    setDocuments([]);
    setAlerts([]);
    setDeadlines([]);
    setProposals([]);
    setFavorites([]);
  }, []);

  const addDocument = useCallback(async (doc: UploadedDocument) => {
    if (token) {
      try {
        const created = await createUserDocument(
          { name: doc.name, mimeType: doc.mimeType, uploadDate: doc.uploadDate, size: doc.size },
          token,
        );
        setDocuments(prev => [{
          id: created.id, name: created.name, mimeType: created.mimeType,
          uploadDate: created.uploadDate, status: created.status as UploadedDocument['status'],
          size: created.size, uri: doc.uri,
        }, ...prev]);
        return;
      } catch {}
    }
    setDocuments(prev => {
      const updated = [doc, ...prev];
      _AS.setItem(KEYS.DOCUMENTS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, [token]);

  const removeDocument = useCallback(async (id: string) => {
    if (token) { try { await deleteUserDocument(id, token); } catch {} }
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, [token]);

  const markAlertAsRead = useCallback(async (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
    if (token) { try { await markAlertRead(id, token); } catch {} }
  }, [token]);

  const markAllAlertsAsRead = useCallback(async () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    if (token) { try { await markAllAlertsRead(token); } catch {} }
  }, [token]);

  const addProposal = useCallback(async (dto: { name: string; organization: string; date: string; status?: string; bidId?: string }) => {
    if (!token) return;
    try {
      const created = await apiCreateProposal(dto, token);
      setProposals(prev => [apiProposalToApp(created), ...prev]);
    } catch {}
  }, [token]);

  const updateProposalStatus = useCallback(async (id: string, status: string) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status: status as Proposal['status'] } : p));
    if (token) { try { await apiUpdateProposal(id, { status }, token); } catch {} }
  }, [token]);

  const toggleFavorite = useCallback(async (edital: Omit<ApiFavorite, 'id' | 'createdAt'>) => {
    const isFav = favorites.some(f => f.bidId === edital.bidId);
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.bidId !== edital.bidId));
      if (token) {
        try { await apiRemoveFavorite(edital.bidId, token); } catch {
          setFavorites(prev => [...prev, { ...edital, id: '', createdAt: '' }]);
        }
      }
    } else {
      const temp: ApiFavorite = { ...edital, id: `tmp_${edital.bidId}`, createdAt: new Date().toISOString() };
      setFavorites(prev => [temp, ...prev]);
      if (token) {
        try {
          const created = await apiAddFavorite(edital, token);
          setFavorites(prev => prev.map(f => f.id === temp.id ? created : f));
        } catch {
          setFavorites(prev => prev.filter(f => f.id !== temp.id));
        }
      }
    }
  }, [token, favorites]);

  const refreshAlerts    = useCallback(async () => { if (token) await loadAlertsAndDeadlines(token); }, [token, loadAlertsAndDeadlines]);
  const refreshDocuments = useCallback(async () => { if (token) await loadDocuments(token); }, [token, loadDocuments]);
  const refreshProposals = useCallback(async () => { if (token) await loadProposals(token); }, [token, loadProposals]);
  const refreshFavorites = useCallback(async () => { if (token) await loadFavorites(token); }, [token, loadFavorites]);

  return (
    <AppContext.Provider value={{
      firebaseUser, authLoading, token,
      documents, alerts, deadlines, proposals, favorites, favoritedIds,
      unreadAlerts: alerts.filter(a => !a.isRead).length,
      login, logout,
      addDocument, removeDocument,
      markAlertAsRead, markAllAlertsAsRead,
      addProposal, updateProposalStatus,
      toggleFavorite,
      refreshAlerts, refreshDocuments, refreshProposals, refreshFavorites,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  return useContext(AppContext);
}
