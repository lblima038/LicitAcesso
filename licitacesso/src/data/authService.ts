import auth from '@react-native-firebase/auth';
import { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';

export interface AuthUser {
  firebaseIdToken: string;
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
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  await GoogleSignin.signOut();

  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    throw { type: 'cancelled' } as AuthError;
  }

  const { idToken } = response.data;
  if (!idToken) throw new Error('Google idToken ausente na resposta');

  const credential = auth.GoogleAuthProvider.credential(idToken);
  const { user } = await auth().signInWithCredential(credential);

  const firebaseIdToken = await user.getIdToken();

  return {
    firebaseIdToken,
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    photoUrl: user.photoURL,
  };
}

export async function signOutGoogle(): Promise<void> {
  await Promise.all([auth().signOut(), GoogleSignin.signOut()]);
}

export { isErrorWithCode, statusCodes };
