// Implementação NATIVA (Android/iOS) do fluxo Google Sign-In.
// No Web, o Metro resolve automaticamente para ./authService.web.ts.
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '../config/googleAuth';
import type { AuthUser, AuthError } from './authTypes';

export type { AuthUser, AuthError } from './authTypes';

export function configureGoogleAuth(): void {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
}

export async function signInWithGoogle(): Promise<AuthUser> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    throw { type: 'cancelled' } as AuthError;
  }

  // response.data.idToken é mais confiável que getTokens() — getTokens pode retornar null
  // se o serverClientId não está configurado ou o token expirou
  let idToken = response.data.idToken;
  if (!idToken) {
    const tokens = await GoogleSignin.getTokens();
    idToken = tokens.idToken;
  }
  if (!idToken) {
    throw { type: 'unknown', message: 'Não foi possível obter o token do Google. Verifique a configuração do OAuth.' } as AuthError;
  }

  return {
    idToken,
    uid: response.data.user.id,
    email: response.data.user.email ?? null,
    name: response.data.user.name ?? null,
    photoUrl: response.data.user.photo ?? null,
  };
}

export async function signOutGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {}
}

export async function isGoogleSignedIn(): Promise<boolean> {
  try {
    return GoogleSignin.hasPreviousSignIn();
  } catch {
    return false;
  }
}

export { isErrorWithCode, statusCodes };
