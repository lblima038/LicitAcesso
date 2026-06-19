# Documentação Técnica — LicitAcesso Mobile

> Plataforma mobile para MEIs participarem de licitações públicas.  
> Stack: React Native · Expo 54 · TypeScript · Expo Router

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stack e Dependências](#2-stack-e-dependências)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Navegação (Expo Router)](#4-navegação-expo-router)
5. [Arquitetura](#5-arquitetura)
6. [Domínio — Entidades](#6-domínio--entidades)
7. [Camada de Dados — API Service](#7-camada-de-dados--api-service)
8. [Gerenciamento de Estado — AppContext](#8-gerenciamento-de-estado--appcontext)
9. [ViewModels (Hooks)](#9-viewmodels-hooks)
10. [Componentes Reutilizáveis](#10-componentes-reutilizáveis)
11. [Telas](#11-telas)
12. [Configuração do Projeto](#12-configuração-do-projeto)
13. [Como Rodar](#13-como-rodar)

---

## 1. Visão Geral

O LicitAcesso Mobile permite que MEIs (Microempreendedores Individuais) busquem, filtrem e participem de licitações públicas brasileiras. O app consome dados reais do PNCP (Portal Nacional de Contratações Públicas) via backend NestJS.

**Funcionalidades principais:**
- Busca e filtro de editais por período, situação, ramo MEI e município
- Checklist de habilitação por edital (documentos MEI)
- Upload e gestão de documentos pessoais
- Alertas e notificações de prazos
- Favoritos de licitações
- Dashboard com histórico de participações e estatísticas nacionais

---

## 2. Stack e Dependências

### Runtime

| Pacote | Versão | Uso |
|--------|--------|-----|
| `expo` | ~54.0.0 | Framework base |
| `expo-router` | ~6.0.23 | Navegação file-based |
| `react-native` | ^0.81.5 | UI nativa |
| `react` | ^19.1.0 | Biblioteca UI |
| `typescript` | ~5.9.2 | Tipagem estática |
| `@expo/vector-icons` | ^15.1.1 | Ícones (Feather) |
| `@react-native-async-storage/async-storage` | 2.1.0 | Persistência local |
| `@react-native-google-signin/google-signin` | ^14.0.0 | Autenticação Google |
| `react-native-safe-area-context` | ~5.6.0 | Safe areas iOS/Android |
| `react-native-screens` | ~4.16.0 | Otimização de telas nativas |
| `react-native-reanimated` | ~4.1.1 | Animações performáticas |
| `expo-document-picker` | ~13.0.1 | Upload de arquivos |

### Dev

| Pacote | Versão |
|--------|--------|
| `@babel/core` | ^7.25.2 |
| `@types/react` | ~19.1.10 |

### Scripts disponíveis

```bash
npm start          # Expo Go (QR code)
npm run android    # Build e abre no emulador Android
npm run ios        # Build e abre no simulador iOS
npm run web        # Abre no browser
npm run lint       # Linter Expo
```

> ⚠️ O login Google usa um módulo nativo e **não funciona no Expo Go** (`npm start`).
> Use um *development build* (`npm run android` / EAS) para testar a autenticação.

---

## 3. Estrutura de Pastas

> O app vive na **raiz do repositório** (`LicitAcesso/`). Não há mais o nível
> aninhado `LicitAcesso/licitacesso/`.

```
LicitAcesso/                    # raiz do repositório (app na raiz)
├── app/                        # Rotas (Expo Router — file-based)
│   ├── _layout.tsx             # Root layout (AppContextProvider)
│   ├── index.tsx               # Redireciona para login ou dashboard (conforme sessão)
│   ├── onboarding.tsx          # Tela de boas-vindas / login
│   ├── error.tsx               # Boundary de erro global
│   ├── profile.tsx             # Perfil do usuário
│   ├── change-password.tsx     # Alterar senha
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx           # Login com Google / CNPJ
│   │   └── register.tsx        # Cadastro
│   └── (tabs)/
│       ├── _layout.tsx         # Layout com tabs (tabBar oculta — custom BottomTabBar)
│       ├── dashboard.tsx       # Início: estatísticas e histórico
│       ├── alerts.tsx          # Avisos · Calendário
│       ├── checklist.tsx       # Checklist de documentos MEI
│       ├── documents.tsx       # Upload e gestão de documentos
│       ├── chat.tsx            # Suporte / chat
│       ├── profile.tsx         # Perfil (aba)
│       └── editais/
│           ├── _layout.tsx
│           ├── index.tsx       # Lista de editais (Explorar / Salvos) + filtros
│           └── [id].tsx        # Detalhe do edital + checklist inline
│
├── src/
│   ├── domain/
│   │   ├── entities.ts         # Interfaces e tipos de domínio
│   │   └── repositories.ts     # Interfaces de repositório (IBidRepository, IUserRepository)
│   ├── data/
│   │   ├── apiService.ts       # Todas as chamadas HTTP ao backend
│   │   ├── repositories.ts     # MockBidRepository, MockUserRepository
│   │   └── authService.ts      # Google Sign-In wrapper
│   ├── context/
│   │   └── AppContext.tsx      # Estado global da aplicação
│   └── presentation/
│       ├── components.tsx      # Componentes reutilizáveis + design tokens
│       └── viewmodels.ts       # Hooks de estado por funcionalidade
│
├── assets/                     # Imagens, fontes, ícones
├── app.json                    # Configuração Expo
├── tsconfig.json               # Configuração TypeScript
└── package.json
```

---

## 4. Navegação (Expo Router)

O roteamento é **file-based** via Expo Router 6. Cada arquivo em `app/` vira uma rota automaticamente.

### Grupos de rotas

| Grupo | Prefixo URL | Descrição |
|-------|-------------|-----------|
| `(auth)` | nenhum | Stack de autenticação (login, register) |
| `(tabs)` | nenhum | Tabs principais após login |

### Fluxo de navegação

```
index.tsx
  └── firebaseUser?
        ├── Sim → /(tabs)/dashboard
        └── Não → /(auth)/login

/onboarding · /(auth)/login
  └── Login bem-sucedido → /(tabs)/dashboard
  (logout em Perfil → /(auth)/login)

/(tabs) — BottomTabBar customizada com 5 abas:
  ├── /dashboard
  ├── /editais  →  /editais/[id]
  ├── /documents
  ├── /alerts
  └── /profile
```

> **Nota:** a tab bar nativa do Expo está oculta (`tabBarStyle: { display: 'none' }`). A navegação usa o componente `BottomTabBar` customizado de `components.tsx`.

---

## 5. Arquitetura

O projeto segue uma arquitetura em camadas inspirada em **MVVM + Clean Architecture leve**:

```
┌─────────────────────────────────────┐
│            Telas (app/)             │  ← Apresentação pura
├─────────────────────────────────────┤
│      ViewModels (viewmodels.ts)     │  ← Estado e lógica por feature
├─────────────────────────────────────┤
│      AppContext (AppContext.tsx)     │  ← Estado global compartilhado
├─────────────────────────────────────┤
│      API Service (apiService.ts)    │  ← Acesso a dados (HTTP)
├─────────────────────────────────────┤
│      Domain (entities.ts)          │  ← Contratos de dados
└─────────────────────────────────────┘
```

### Fluxo de dados

```
Tela chama useXxxViewModel()
  └── ViewModel chama fetchXxx() de apiService
        └── apiService faz fetch() para o backend (Render em produção;
            EXPO_PUBLIC_API_URL para apontar a outro host no dev)
              └── Resposta atualiza useState no ViewModel
                    └── Tela re-renderiza com dados novos
```

Para dados globais (user, token, alerts, favorites):
```
Tela chama useAppContext()
  └── AppContext carrega do backend via token JWT
        └── Persiste sessão no AsyncStorage
```

---

## 6. Domínio — Entidades

**Arquivo:** `src/domain/entities.ts`

### Interfaces

```typescript
interface Bid {
  id: string;
  title: string;
  description: string;
  organization: string;
  estimatedValue: number;
  deadline: string;
  deadlineTime?: string;
  location: string;
  category: string;
  matchPercentage?: number;
  isUrgent?: boolean;
  requirements?: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  businessInfo?: { sector: string; cnae: string; city: string; uf: string };
}

interface BidDocument {
  id: string;
  title: string;
  status: DocumentStatus;      // 'ok' | 'pending' | 'processing'
  lastUpdated?: string;
  description: string;
  actionUrl?: string;
}

interface UploadedDocument {
  id: string;
  name: string;
  mimeType: string;
  uploadDate: string;
  status: DocumentUploadStatus; // 'aprovado' | 'pendente' | 'rejeitado'
  uri?: string;
  size?: number;
}

interface AppAlert {
  id: string;
  type: AlertType;             // 'novo_edital' | 'prazo_proximo' | 'resultado' | 'atualizacao'
  title: string;
  description: string;
  dateTime: string;            // ISO 8601
  isRead: boolean;
}

interface Proposal {
  id: string;
  name: string;
  organization: string;
  date: string;                // YYYY-MM-DD
  status: ProposalStatus;      // 'em_andamento' | 'ganhou' | 'perdeu' | 'cancelado'
}

interface AppDeadline {
  id: string;
  title: string;
  date: string;                // YYYY-MM-DD
  description?: string;
}
```

### Enums

```typescript
enum DocumentStatus { OK = 'ok', PENDING = 'pending', PROCESSING = 'processing' }
type DocumentUploadStatus = 'aprovado' | 'pendente' | 'rejeitado'
type AlertType = 'novo_edital' | 'prazo_proximo' | 'resultado' | 'atualizacao'
type ProposalStatus = 'em_andamento' | 'ganhou' | 'perdeu' | 'cancelado'
```

---

## 7. Camada de Dados — API Service

**Arquivo:** `src/data/apiService.ts`  
**Base URL:** `https://licitacessobackend.onrender.com` (constante `BASE_URL` no arquivo).

> As telas de login/cadastro e onboarding usam `EXPO_PUBLIC_API_URL` (com fallback
> para a URL do Render) para permitir apontar a um backend local no dev. As demais
> chamadas em `apiService.ts` usam a constante `BASE_URL` fixa.

Todas as rotas protegidas recebem `Authorization: Bearer <token>` via `authHeaders(token)`.

### Editais (público)

| Função | Método | Endpoint | Retorno |
|--------|--------|----------|---------|
| `fetchEditais(params)` | GET | `/editais` | `EditaisResponse` |
| `fetchFiltros()` | GET | `/editais/filtros` | `{ ramos_mei, situacoes }` |
| `fetchEditalById(id)` | GET | `/editais/:id` | `Edital` |

**Parâmetros de `fetchEditais`:**
```typescript
{
  data_inicio?: string;     // YYYYMMDD
  data_fim?: string;        // YYYYMMDD
  ramo_mei?: string;
  situacao_nome?: string;
  municipio_nome?: string;
  pagina?: number;
  tamanho?: number;         // default 20, max 100
}
```

### Oportunidades (público)

| Função | Endpoint |
|--------|----------|
| `fetchPorEstado(uf?)` | `GET /oportunidades/por-estado` |
| `fetchPorAreaServico(ramo?)` | `GET /oportunidades/por-area-servico` |
| `fetchPorSituacao(situacao?)` | `GET /oportunidades/por-situacao` |
| `fetchPorFaixaValor(faixa?)` | `GET /oportunidades/por-faixa-valor` |
| `fetchPorMes(mes, ano)` | `GET /oportunidades/por-mes` |

### Checklist (protegido)

| Função | Método | Endpoint |
|--------|--------|----------|
| `fetchChecklist(bidId, token)` | GET | `/checklist/:bidId` |
| `updateChecklistStatus(bidId, docId, status, token)` | PATCH | `/checklist/:bidId/:docId` |

### Documentos do usuário (protegido)

| Função | Método | Endpoint |
|--------|--------|----------|
| `fetchUserDocuments(token)` | GET | `/documents` |
| `createUserDocument(doc, token)` | POST | `/documents` |
| `deleteUserDocument(id, token)` | DELETE | `/documents/:id` |

### Alertas (protegido)

| Função | Método | Endpoint |
|--------|--------|----------|
| `fetchAlerts(token)` | GET | `/alerts` |
| `createAlert(dto, token)` | POST | `/alerts` |
| `markAlertRead(id, token)` | PATCH | `/alerts/:id/read` |
| `markAllAlertsRead(token)` | PATCH | `/alerts/read-all` |
| `fetchDeadlines(token)` | GET | `/alerts/deadlines` |

**Tipos de alerta válidos:** `novo_edital` · `prazo_proximo` · `resultado` · `atualizacao`

### Favoritos (protegido)

| Função | Método | Endpoint |
|--------|--------|----------|
| `fetchFavorites(token)` | GET | `/favorites` |
| `addFavorite(dto, token)` | POST | `/favorites` |
| `removeFavorite(bidId, token)` | DELETE | `/favorites/:bidId` |

**DTO de `addFavorite`:**
```typescript
{
  bidId: string;
  objeto_compra: string;
  municipio_nome?: string;
  valor_total_estimado?: number;
  situacao_nome?: string;
  ramo_mei?: string;
  modalidade_nome?: string;
  data_publicacao_pncp?: string;
}
```

### Proposals (protegido)

| Função | Método | Endpoint |
|--------|--------|----------|
| `fetchProposals(token)` | GET | `/proposals` |
| `createProposal(dto, token)` | POST | `/proposals` |
| `updateProposal(id, dto, token)` | PATCH | `/proposals/:id` |

---

## 8. Gerenciamento de Estado — AppContext

**Arquivo:** `src/context/AppContext.tsx`

Estado global da aplicação. Envolve toda a árvore de componentes via `AppContextProvider` no `app/_layout.tsx`.

### Estado exposto

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `firebaseUser` | `AppUser \| null` | Usuário autenticado |
| `authLoading` | `boolean` | Carregando sessão do AsyncStorage |
| `token` | `string \| null` | JWT do backend |
| `documents` | `UploadedDocument[]` | Documentos do usuário |
| `alerts` | `AppAlert[]` | Notificações do usuário |
| `deadlines` | `AppDeadline[]` | Prazos do calendário |
| `proposals` | `Proposal[]` | Histórico de participações |
| `favorites` | `ApiFavorite[]` | Editais favoritados (com snapshot) |
| `favoritedIds` | `Set<string>` | Set de bidIds para lookup O(1) |
| `unreadAlerts` | `number` | Contagem de alertas não lidos |

### Métodos

| Método | Descrição |
|--------|-----------|
| `login(user, token?)` | Persiste sessão e carrega dados do backend |
| `logout()` | Limpa sessão, token e todos os estados |
| `addDocument(doc)` | Envia ao backend (fallback: AsyncStorage) |
| `removeDocument(id)` | Remove do backend e do estado local |
| `markAlertAsRead(id)` | Update otimista + sincroniza com backend |
| `markAllAlertsAsRead()` | Marca todos + sincroniza com backend |
| `addProposal(dto)` | Cria proposta no backend e atualiza lista |
| `updateProposalStatus(id, status)` | Update otimista + backend |
| `toggleFavorite(edital)` | Adiciona/remove favorito com update otimista e rollback em caso de erro |
| `refreshAlerts()` | Recarrega alertas e prazos do backend |
| `refreshDocuments()` | Recarrega documentos do backend |
| `refreshProposals()` | Recarrega propostas do backend |
| `refreshFavorites()` | Recarrega favoritos do backend |

### Persistência local (AsyncStorage)

| Chave | Conteúdo |
|-------|----------|
| `@licitacesso:user_v1` | Objeto `AppUser` serializado |
| `@licitacesso:token_v1` | JWT string |
| `@licitacesso:documents_v1` | Array de documentos (fallback offline) |

### Ciclo de vida

```
AppContextProvider monta
  ├── useEffect: lê AsyncStorage → restaura user + token
  └── useEffect([token]): quando token disponível → carrega
        ├── loadAlertsAndDeadlines()
        ├── loadDocuments()
        ├── loadProposals()
        └── loadFavorites()
```

---

## 9. ViewModels (Hooks)

**Arquivo:** `src/presentation/viewmodels.ts`

Cada hook encapsula o estado e a lógica de uma feature específica, mantendo as telas limpas.

### `useDashboardViewModel()`

Busca estatísticas nacionais do mercado de licitações.

```typescript
return {
  statsNacionais: { totalLicitacoes: number; totalValor: number; numEstados: number };
  topEstados: OportunidadePorEstado[];   // top 5 por valor
  topAreas: OportunidadePorArea[];       // top 5 por valor
  loading: boolean;
}
```

### `useMercadoViewModel()`

Dados completos de mercado para exploração (estados e áreas).

```typescript
return {
  tab: 'estados' | 'areas';
  setTab: (tab) => void;
  estados: OportunidadePorEstado[];
  areas: OportunidadePorArea[];
  loading: boolean;
  error: string | null;
}
```

### `useEditaisViewModel()`

Lista paginada de editais com filtros. Cancela requests em flight ao mudar filtros.

```typescript
return {
  editais: Edital[];
  paginacao: { total: number; pagina: number; paginas: number };
  filtros: { ramos_mei: string[]; situacoes: string[] };
  loading: boolean;
  error: string | null;
  // filtros ativos
  periodo: '7' | '30' | '90' | '365';  setPeriodo: (v) => void;
  ramoMei: string;                       setRamoMei: (v) => void;
  situacao: string;                      setSituacao: (v) => void;
  municipio: string;                     setMunicipio: (v) => void;
  pagina: number;                        setPagina: (p) => void;
}
```

> Trocar qualquer filtro reseta `pagina` para 1 automaticamente.

### `useEditalDetalheViewModel(id: string)`

Dados completos de um edital específico.

```typescript
return {
  edital: Edital | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}
```

### `useChecklistViewModel(bidId: string)`

Checklist de habilitação para um edital específico. Cria documentos padrão MEI no backend se for o primeiro acesso.

```typescript
return {
  documents: ChecklistDocument[];
  progress: number;           // 0-100 (% de docs com status 'ok')
  loading: boolean;
  error: string | null;
  updateStatus: (docId: string, status: string) => Promise<void>;
}
```

---

## 10. Componentes Reutilizáveis

**Arquivo:** `src/presentation/components.tsx`

### Design Tokens

```typescript
export const colors = {
  primary: '#003d9b',      // Azul escuro (marca)
  accent: '#0052cc',       // Azul principal
  green: '#006c47',        // Verde (sucesso, aprovado)
  greenLight: '#8af5be',   // Verde claro
  orange: '#ffdcc3',       // Laranja claro (alerta)
  orangeDark: '#6a3600',   // Laranja escuro (texto de alerta)
  background: '#f8f9fb',   // Fundo da tela
  surface: '#ffffff',      // Superfície de cards
  surfaceAlt: '#f3f4f6',   // Superfície alternativa
  border: '#e2e5ec',       // Bordas
  text: '#191c1e',         // Texto principal
  textMuted: '#434654',    // Texto secundário
  danger: '#ba1a1a',       // Vermelho (erro, urgente)
}
```

### Componentes

#### `Button`
Botão com 4 variantes.

| Prop | Tipo | Default |
|------|------|---------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` |
| `onPress` | `() => void` | — |
| `disabled` | `boolean` | `false` |
| `style` | `ViewStyle` | — |

#### `ScreenLayout`
Wrapper de tela completo com `TopBar` + conteúdo + `BottomTabBar`.

```tsx
<ScreenLayout>
  <ScrollView>...</ScrollView>
</ScreenLayout>
```

#### `EditalCard`
Card de listagem de edital com suporte a favorito.

| Prop | Tipo | Obrigatório |
|------|------|-------------|
| `item` | `EditalItem` | ✅ |
| `onPress` | `() => void` | — |
| `isFavorited` | `boolean` | — |
| `onToggleFavorite` | `() => void` | — |

#### `StatCard`
Card de estatística com ícone, título e subtítulo. Usado no dashboard.

#### `EstadoCard` / `AreaCard`
Cards de ranking com barra de progresso proporcional. Recebem `item`, `maxValor` e `rank`.

#### `BidCardSkeleton`
Skeleton loader animado (pulse) para lista de editais.

#### `EmptyState`
Estado vazio com ícone, título e subtítulo.

#### `BottomTabBar`
Barra de navegação inferior customizada com 5 abas: Início · Editais · Docs · Alertas · Perfil. Mostra badge de contagem nos alertas não lidos.

#### `TopBar`
Barra superior minimalista: apenas o nome **LicitAcesso** centralizado. (Menu, avatar e sino foram removidos por serem redundantes com a `BottomTabBar`.)

#### `situacaoStyle(nome?): { bg, fg }`
Mapeia a situação do edital para cores do badge: divulgada → verde, suspensa → âmbar, revogada → vermelho, anulada → roxo, demais → azul. Usado em `EditalCard`, no detalhe e nos favoritos.

#### `formatBRL(value: number): string`
Formata valores monetários abreviados: `R$ 1.2M`, `R$ 450K`, etc.

---

## 11. Telas

### `onboarding.tsx`
Tela inicial de boas-vindas com login via Google e botão de entrada como CNPJ.

### `(auth)/login.tsx`
Login com Google Sign-In (nativo via `@react-native-google-signin`). Após autenticação, troca o `idToken` do Google pelo JWT interno do backend via `POST /auth/google` (o backend valida o token em `GoogleAuthService`, conferindo o `audience` contra `GOOGLE_CLIENT_ID`) e persiste o token no AppContext.

### `(tabs)/dashboard.tsx`
- Cards pessoais: total de participações, em andamento, ganhas, taxa de sucesso
- Estatísticas nacionais: total de licitações, volume total, número de estados
- Gráfico de barras: participações por mês (últimos 4 meses)
- Top 5 estados e áreas por volume

### `(tabs)/editais/index.tsx`
Seletor no topo com duas seções:
- **Explorar:** lista paginada com 4 filtros:
  - **Período:** chips 7d / 30d / 90d / 1 ano
  - **Situação:** chips dinâmicos do backend
  - **Ramo MEI:** chips dinâmicos do backend
  - **Município:** campo de texto com debounce 400ms
  - Botão "Limpar filtros (N)" aparece quando há filtros ativos.
- **Salvos:** editais favoritados (`favorites` do AppContext), com navegação para o detalhe e remoção pelo ícone de marcador. (Antes os favoritos ficavam na aba Alertas.)

### `(tabs)/editais/[id].tsx`
Detalhe do edital com:
- Badge de situação + valor destacado
- **Checklist de habilitação inline** (via `useChecklistViewModel(edital._id)`)
- Informações gerais, área de atuação, datas

### `(tabs)/checklist.tsx`
Checklist independente (bidId fixo `'1'`). Mostra progresso % e status de cada documento MEI com botão "Emitir" para os pendentes.

### `(tabs)/documents.tsx`
- Upload via `expo-document-picker` (PDF e imagens)
- Lista com badge de status (aprovado / pendente / rejeitado)
- Banner de aviso quando há pendências
- Modal de detalhes do documento

### `(tabs)/alerts.tsx`
2 abas em segmento único:

| Aba | Conteúdo |
|-----|----------|
| **Avisos** | Lista de alertas com tipos e leitura individual/coletiva |
| **Calendário** | Calendário mensal com marcadores de prazo; lista de prazos próximos |

> Os **Favoritos** foram movidos para a aba **Editais → Salvos**.

### `(tabs)/dashboard.tsx` (proposals)
Usa `proposals` do AppContext. Gráfico de barras de participações por mês. Lista dos últimos 5 com badge de status colorido.

---

## 12. Configuração do Projeto

### `app.json`

```json
{
  "name": "LicitAcesso",
  "slug": "licitacesso",
  "version": "1.0.0",
  "orientation": "portrait",
  "ios": { "bundleIdentifier": "br.com.licitacesso.app" },
  "android": { "package": "br.com.licitacesso.app" },
  "newArchEnabled": true,
  "plugins": [
    "expo-router",
    "@react-native-google-signin/google-signin"
  ]
}
```

### `tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": { "@/*": ["./*"] }
  }
}
```

### Variáveis de ambiente

| Variável | Uso |
|----------|-----|
| `EXPO_PUBLIC_API_URL` | URL do backend (padrão: `http://localhost:3000`) |

---

## 13. Como Rodar

### Pré-requisitos

- Node.js 18+
- Expo via `npx expo` (não precisa instalar o `expo-cli` global, que está deprecado)
- Para testar o **login Google nativo**: um *development build* (`npx expo run:android` ou EAS) — o módulo nativo **não funciona no Expo Go**
- Backend NestJS rodando (local em `localhost:3000` ou o de produção no Render)

### Instalação

```bash
cd LicitAcesso
npm install
```

### Desenvolvimento

```bash
# Expo Go (scan QR no celular)
npm start

# Android
npm run android

# iOS
npm run ios

# Web (apenas para debug — app é mobile-first)
npm run web
```

### Conexão com backend

Em produção o app usa o backend no **Render** (`https://licitacessobackend.onrender.com`).

Para apontar a um **backend local** no desenvolvimento, defina `EXPO_PUBLIC_API_URL`
no `.env` (usado pelas telas de login/cadastro/onboarding):

| Cenário | `EXPO_PUBLIC_API_URL` |
|---------|------------------------|
| Emulador Android | `http://10.0.2.2:3000` |
| Celular físico (USB) | `http://localhost:3000` + `adb reverse tcp:3000 tcp:3000` |
| Celular físico (Wi-Fi) | `http://SEU_IP:3000` (liberar a porta 3000 no firewall) |
| Navegador (`--web`) | `http://localhost:3000` |

> Variáveis `EXPO_PUBLIC_*` são embutidas no bundle — após alterar o `.env`,
> reinicie com `npx expo start -c`.

### Build (EAS)

```bash
cd LicitAcesso
npx eas-cli build --platform android --profile preview   # APK interno
```

---

*Documentação revisada em 13/06/2026.*
