export interface AuthUser {
  /** Credencial enviada ao backend: ID token (Android/iOS) ou access token (Web). */
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
