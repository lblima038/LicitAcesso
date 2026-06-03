import { Platform } from 'react-native';
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export interface AuthUser {
  idToken: string;
  uid: string;
  email: string | null;
  name: string | null;
  photoUrl: string | null;
}

export type AuthError =
  | { type: 'cancelled' }
  | { type: 'in_progress' }
  | { type: 'play_services_unavailable' }
  | { type: 'unknown'; message: string };

export async function signInWithGoogle(): Promise<AuthUser> {
  if (Platform.OS === 'web') {
    throw { type: 'unknown', message: 'Google Sign-In não disponível no navegador.' } as AuthError;
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    throw { type: 'cancelled' } as AuthError;
  }

  const tokens = await GoogleSignin.getTokens();

  return {
    idToken: tokens.idToken,
    uid: response.data.user.id,
    email: response.data.user.email ?? null,
    name: response.data.user.name ?? null,
    photoUrl: response.data.user.photo ?? null,
  };
}

export async function signOutGoogle(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await GoogleSignin.signOut();
  } catch {}
}

export async function isGoogleSignedIn(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return await GoogleSignin.isSignedIn();
  } catch {
    return false;
  }
}

export { isErrorWithCode, statusCodes };
