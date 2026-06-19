<div align="center">

# 📋 LicitAcesso

**Licitações públicas, simplificadas para o seu negócio.**

App mobile que ajuda MEIs e pequenas empresas a encontrar, acompanhar e participar
de licitações públicas brasileiras — com dados reais do PNCP.

[![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Platform](https://img.shields.io/badge/Android%20%7C%20iOS-mobile-success)]()

</div>

---

## ✨ Funcionalidades

- 🔐 **Autenticação** — login com Google e por CNPJ, com sessão persistida no aparelho
- 🔎 **Editais** — lista de licitações abertas no Brasil com filtros (período, situação, ramo MEI, município) otimizados para celular
- 🔖 **Favoritos** — salve editais e acesse rápido em *Editais → Salvos*
- ✅ **Checklist de habilitação** — por edital, com progresso de documentos e indicadores de status
- 📁 **Documentos** — upload, visualização e acompanhamento de pendências
- 🔔 **Alertas e calendário** — notificações de novidades e prazos
- 📊 **Dashboard** — histórico de participações, andamento das propostas e estatísticas nacionais do mercado

---

## 🧰 Stack

| Camada | Tecnologias |
|--------|-------------|
| **App** | React Native · Expo 54 · Expo Router · TypeScript |
| **Estado** | Context API + hooks (ViewModels) · AsyncStorage |
| **Auth** | `@react-native-google-signin` (Google) · JWT (CNPJ) |
| **Backend** | NestJS · Prisma · PostgreSQL (Supabase) — hospedado no Render |
| **Dados** | PNCP (Portal Nacional de Contratações Públicas) |

> O backend fica em um repositório separado: **[LicitAcessoBackEnd](https://github.com/Gabrieelgc2/LicitAcessoBackEnd)**.

---

## 🏗️ Arquitetura

Arquitetura em camadas inspirada em **MVVM + Clean Architecture leve**:

```
Telas (app/)            → apresentação pura
   ↓
ViewModels (hooks)      → estado e lógica por feature
   ↓
AppContext              → estado global (sessão, dados do usuário)
   ↓
API Service             → chamadas HTTP ao backend
   ↓
Domain (entities)       → contratos de dados
```

---

## 📂 Estrutura

```
LicitAcesso/
├── app/                  # Rotas (Expo Router — file-based)
│   ├── (auth)/           # Login e cadastro
│   ├── (tabs)/           # Telas principais (dashboard, editais, docs, alertas, perfil)
│   └── _layout.tsx       # Provider global
├── src/
│   ├── domain/           # Entidades e contratos
│   ├── data/             # apiService, authService
│   ├── context/          # AppContext (estado global)
│   └── presentation/     # Componentes, design tokens e ViewModels
├── assets/               # Imagens, ícones, fontes
└── app.json              # Configuração Expo
```

📖 Detalhes completos em [`DOCUMENTACAO_TECNICA.md`](./DOCUMENTACAO_TECNICA.md).

---

## 🚀 Começando

### Pré-requisitos
- Node.js 18+
- Um **development build** para testar o login Google (o módulo nativo **não roda no Expo Go**)
- Backend rodando (local em `localhost:3000` ou o de produção no Render)

### Instalação

```bash
git clone https://github.com/lblima038/LicitAcesso.git
cd LicitAcesso
npm install
```

### Variáveis de ambiente

Crie um `.env` na raiz (veja `.env.example`):

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="<seu-web-client-id>.apps.googleusercontent.com"
EXPO_PUBLIC_API_URL="https://licitacessobackend.onrender.com"
```

> Para apontar a um backend local, ajuste `EXPO_PUBLIC_API_URL` (ex.: `http://10.0.2.2:3000`
> no emulador). Variáveis `EXPO_PUBLIC_*` são embutidas no bundle — reinicie com `npx expo start -c`.

### Rodando

```bash
npx expo start            # dev server
npx expo run:android      # development build no Android (necessário p/ login Google)
```

---

## 📦 Build (EAS)

```bash
npx eas-cli build --platform android --profile preview   # APK interno
npx eas-cli build --platform android --profile production # release
```

---

## 👥 Time

Projeto desenvolvido pela equipe **arll3ssons-team**.

---

<div align="center">
<sub>Feito com 💙 para simplificar o acesso de pequenos negócios às licitações públicas.</sub>
</div>
