# Arquitetura do Sistema — LVP Financeiro

**Versão:** 1.3.0  
**Última atualização:** 2026-04-02

---

## Visão Geral

O Sistema Financeiro LVP é uma aplicação web interna desenvolvida em **Next.js 14** com **App Router**, utilizando **Supabase** como banco de dados PostgreSQL gerenciado. O sistema centraliza a gestão financeira das três lojas da rede LVP: Muzambinho, Guaxupé e Poços de Caldas.

---

## Stack Tecnológica

| Camada | Tecnologia | Versão | Finalidade |
|---|---|---|---|
| Framework | Next.js | 14.2.5 | App Router, Server Actions, SSR |
| Linguagem | TypeScript | 5.6 | Tipagem estática |
| Banco de Dados | Supabase (PostgreSQL) | — | Persistência de dados |
| Estilização | Tailwind CSS | 3.4 | Utilitários CSS |
| Componentes | Radix UI | — | Primitivos acessíveis |
| Formulários | React Hook Form + Zod | — | Validação e controle |
| Gráficos | Recharts | 2.12 | Visualizações no dashboard |
| Notificações | Sonner | 1.5 | Toast/Snackbar |
| Ícones | Lucide React | 0.453 | Ícones SVG |
| Datas | date-fns | 3.6 | Manipulação de datas |
| Testes | Vitest | 2.1 | Testes unitários |

---

## Estrutura de Diretórios

```
projeto-financeiro/
├── docs/                        ← Documentação técnica (este diretório)
│   ├── README.md
│   ├── CHANGELOG.md
│   ├── GITHUB_HISTORY.md
│   ├── SUPABASE.md
│   ├── ARQUITETURA.md
│   ├── GUIA_OPERACIONAL.md
│   └── migrations/              ← Cópias documentadas dos scripts SQL
├── src/
│   ├── actions/
│   │   └── index.ts             ← Todas as Server Actions (CRUD + OFX)
│   ├── app/
│   │   ├── layout.tsx           ← Layout raiz (Toaster, fontes)
│   │   ├── globals.css          ← Estilos globais + tokens de design
│   │   ├── page.tsx             ← Redireciona para /dashboard
│   │   ├── dashboard/           ← Dashboard principal
│   │   ├── importar-ofx/        ← Upload e processamento de extratos
│   │   ├── transacoes/          ← Lançamentos financeiros
│   │   ├── pagamentos/          ← Débitos por loja
│   │   ├── recebimentos/        ← Créditos por loja
│   │   ├── pagamentos-futuros/  ← Contas a pagar
│   │   ├── recebimentos-futuros/← Contas a receber
│   │   ├── categorias/          ← Plano de contas
│   │   └── relatorios/          ← Relatórios com filtros
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx      ← Navegação lateral responsiva
│   │   └── ui/
│   │       ├── toast-custom.tsx ← Sistema de toast personalizado (lvpToast)
│   │       └── [shadcn components]
│   ├── lib/
│   │   └── supabase.ts          ← Cliente Supabase (server + client)
│   └── types/
│       └── index.ts             ← Tipos TypeScript compartilhados
├── supabase/
│   ├── schema.sql               ← Schema completo do banco
│   ├── seed.sql                 ← Dados iniciais (lojas + categorias)
│   ├── migration_categorias_v2.sql
│   └── migration_add_numero_nf.sql
├── public/                      ← Assets estáticos
├── .env.local                   ← Variáveis de ambiente (não versionado)
├── .env.example                 ← Modelo de variáveis de ambiente
├── next.config.ts               ← Configuração do Next.js
├── tailwind.config.ts           ← Configuração do Tailwind
├── tsconfig.json                ← Configuração do TypeScript
├── package.json                 ← Dependências e scripts
└── todo.md                      ← Rastreamento de tarefas
```

---

## Fluxo de Dados

O sistema segue o padrão **Server Actions** do Next.js 14, onde toda a comunicação com o banco de dados ocorre exclusivamente no servidor:

1. O usuário interage com um componente React no navegador (`*Client.tsx`).
2. O componente chama uma **Server Action** definida em `src/actions/index.ts`.
3. A Server Action utiliza o cliente Supabase com a `SUPABASE_SERVICE_ROLE_KEY` para executar a operação no banco.
4. O resultado retorna ao componente, que atualiza a UI via `router.refresh()` ou estado local.

Este padrão garante que as credenciais do banco nunca sejam expostas ao cliente.

---

## Módulos do Sistema

| Módulo | Rota | Funcionalidades |
|---|---|---|
| Dashboard | `/dashboard` | Saldo total, entradas/saídas do mês, gráficos de evolução e resultado por loja |
| Importar Extrato | `/importar-ofx` | Upload de arquivo `.OFX` do Banco do Brasil, preview, classificação automática e confirmação |
| Transações | `/transacoes` | Listagem com filtros por data, loja, tipo e categoria; cadastro manual |
| Pagamentos | `/pagamentos` | Débitos por loja com campo Nº NF, status, forma de pagamento e ícone de visualização |
| Recebimentos | `/recebimentos` | Créditos por loja com status e forma de recebimento |
| Pag. Futuros | `/pagamentos-futuros` | Contas a pagar com vencimento, recorrência e controle de status |
| Rec. Futuros | `/recebimentos-futuros` | Contas a receber com suporte a cartão (parcelas), boleto e PIX |
| Categorias | `/categorias` | CRUD do plano de contas hierárquico com palavras-chave para classificação automática |
| Relatórios | `/relatorios` | Filtros por período, loja e categoria |

---

## Sistema de Toast (Feedback Visual)

O sistema utiliza a biblioteca **Sonner** com um wrapper personalizado `lvpToast` definido em `src/components/ui/toast-custom.tsx`. As variantes disponíveis são:

| Método | Cor da barra | Ícone | Duração |
|---|---|---|---|
| `lvpToast.success(título, descrição?)` | Verde `#10b981` | CheckCircle2 | 4 segundos |
| `lvpToast.error(título, descrição?)` | Vermelho `#ef4444` | XCircle | 6 segundos |
| `lvpToast.warning(título, descrição?)` | Âmbar `#f59e0b` | AlertTriangle | 6 segundos |
| `lvpToast.info(título, descrição?)` | Dourado `#C9A84C` | Info | 4 segundos |
| `lvpToast.loading(título, descrição?)` | Dourado `#C9A84C` | Loader2 (spin) | Infinito |
| `lvpToast.promise(promise, msgs)` | Automático | Automático | Automático |

Os toasts são exibidos no canto inferior direito (`bottom-right`) com até 5 visíveis simultaneamente.

---

## Design System

O sistema adota um tema **dark/gold** consistente:

| Token | Valor | Uso |
|---|---|---|
| Background | `hsl(0 0% 15%)` ≈ `#252525` | Fundo da aplicação |
| Card | `hsl(0 0% 18%)` | Cards e painéis |
| Sidebar | `hsl(0 0% 17%)` | Navegação lateral |
| Primary (Gold) | `hsl(43 60% 55%)` ≈ `#C9A84C` | Botões, destaques, ícones ativos |
| Border | `hsl(0 0% 26%)` | Bordas e divisores |
| Foreground | `hsl(210 20% 94%)` | Texto principal |
| Muted | `hsl(210 10% 58%)` | Texto secundário |
| Fonte | Inter (Google Fonts) | Toda a aplicação |
