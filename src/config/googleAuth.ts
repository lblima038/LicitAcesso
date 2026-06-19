// Client ID do tipo "Web application" no Google Cloud Console.
// IMPORTANTE: o app Android só funciona se existir também um OAuth Client do tipo
// "Android" (package br.com.licitacesso.app + SHA-1) NO MESMO projeto deste Client ID.
// O mesmo valor é usado como `webClientId` no Android/iOS e como `client_id` no Web.
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
  '633143773285-otn3psfsnpidpgtuv929ds02tiqde756.apps.googleusercontent.com';
