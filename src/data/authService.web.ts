// Implementação WEB do fluxo Google Sign-In, usando Google Identity Services (GIS).
// O Metro resolve este arquivo automaticamente quando a plataforma é "web";
// Android/iOS usam ./authService.ts (módulo nativo).
//
// Fluxo: token flow do GIS (popup) → access token → perfil via /userinfo.
// O backend valida o access token via tokeninfo (aud = GOOGLE_WEB_CLIENT_ID).
import { GOOGLE_WEB_CLIENT_ID } from '../config/googleAuth';
import type { AuthUser, AuthError } from './authTypes';

export type { AuthUser, AuthError } from './authTypes';

// Mesmas chaves do @react-native-google-signin para manter a interface única nas telas.
export const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
} as const;

export function isErrorWithCode(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

interface TokenResponse {
  access_token?: string;
  error?: string;
}

interface TokenClient {
  requestAccessToken: (overrides?: { prompt?: string }) => void;
}

interface GoogleOauth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
    error_callback?: (error: { type?: string; message?: string }) => void;
  }) => TokenClient;
  revoke: (token: string, callback?: () => void) => void;
}

function getGoogleOauth2(): GoogleOauth2 | null {
  const google = (globalThis as { google?: { accounts?: { oauth2?: GoogleOauth2 } } }).google;
  return google?.accounts?.oauth2 ?? null;
}

const GIS_SRC = 'https://accounts.google.com/gsi/client';
let gisLoading: Promise<void> | null = null;

function loadGis(): Promise<void> {
  if (getGoogleOauth2()) return Promise.resolve();
  if (gisLoading) return gisLoading;

  gisLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisLoading = null;
      reject({ type: 'unknown', message: 'Falha ao carregar o Google Identity Services.' } as AuthError);
    };
    document.head.appendChild(script);
  });
  return gisLoading;
}

export function configureGoogleAuth(): void {
  // Pré-carrega o script do GIS para o popup abrir sem atraso no clique.
  loadGis().catch(() => {});
}

let lastAccessToken: string | null = null;
let signInInProgress = false;

function requestAccessToken(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const oauth2 = getGoogleOauth2();
    if (!oauth2) {
      reject({ type: 'unknown', message: 'Google Identity Services indisponível.' } as AuthError);
      return;
    }
    const client = oauth2.initTokenClient({
      client_id: GOOGLE_WEB_CLIENT_ID,
      scope: 'openid email profile',
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject({ type: 'unknown', message: response.error ?? 'Token não retornado.' } as AuthError);
          return;
        }
        resolve(response.access_token);
      },
      // Disparado quando o usuário fecha o popup ou o navegador o bloqueia.
      error_callback: (error) => {
        if (error?.type === 'popup_closed') {
          reject({ type: 'cancelled' } as AuthError);
        } else {
          reject({ type: 'unknown', message: error?.message ?? 'Popup do Google bloqueado ou falhou.' } as AuthError);
        }
      },
    });
    client.requestAccessToken();
  });
}

export async function signInWithGoogle(): Promise<AuthUser> {
  if (signInInProgress) {
    throw { type: 'in_progress' } as AuthError;
  }
  signInInProgress = true;
  try {
    await loadGis();
    const accessToken = await requestAccessToken();

    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw { type: 'unknown', message: 'Não foi possível obter o perfil do Google.' } as AuthError;
    }
    const profile = (await res.json()) as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    lastAccessToken = accessToken;
    return {
      idToken: accessToken,
      uid: profile.sub,
      email: profile.email ?? null,
      name: profile.name ?? null,
      photoUrl: profile.picture ?? null,
    };
  } finally {
    signInInProgress = false;
  }
}

export async function signOutGoogle(): Promise<void> {
  const oauth2 = getGoogleOauth2();
  if (oauth2 && lastAccessToken) {
    try {
      oauth2.revoke(lastAccessToken);
    } catch {}
    lastAccessToken = null;
  }
}

export async function isGoogleSignedIn(): Promise<boolean> {
  return false;
}
