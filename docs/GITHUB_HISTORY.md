# Histórico do Repositório GitHub

**Repositório:** [lvpsistemas2026-maker/financeiro](https://github.com/lvpsistemas2026-maker/financeiro)  
**Branch principal:** `main`  
**Última atualização deste documento:** 2026-04-02

---

## Convenção de Commits

O projeto adota a seguinte convenção para mensagens de commit:

| Prefixo | Significado |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Alteração apenas em documentação |
| `style:` | Mudanças de estilo/formatação sem alteração de lógica |
| `refactor:` | Refatoração de código sem nova funcionalidade |
| `chore:` | Tarefas de manutenção (dependências, configurações) |
| `db:` | Alterações no banco de dados ou migrações |

---

## Histórico Completo de Commits

### 2026-04-02

| Hash | Mensagem | Arquivos Principais |
|---|---|---|
| `2207eaa` | `feat: adiciona campo numero_nf em Pagamentos, icone visualizar, migracoes Supabase e categorias v2` | `PagamentosClient.tsx`, `actions/index.ts`, `supabase/schema.sql`, `supabase/seed.sql`, `supabase/migration_add_numero_nf.sql`, `supabase/migration_categorias_v2.sql`, `todo.md` |
| `bd6a326` | `true message` *(checkpoint automático Manus)* | Checkpoint interno |

**Detalhamento do commit `2207eaa`:**

Este commit consolidou as seguintes entregas: adição do campo `numero_nf` no formulário de Pagamentos com ícone de visualização e modal de detalhes; inclusão do parâmetro `numero_nf` nas Server Actions `createPagamento` e `updatePagamento`; atualização do schema SQL com a nova coluna; substituição do seed de categorias (de 127 genéricas para 67 hierárquicas do Plano LVP-Atual); e adição dos scripts de migração para execução no Supabase.

---

### 2026-04-01

| Hash | Mensagem | Arquivos Principais |
|---|---|---|
| `5ae615b` | `Checkpoint: Tema atualizado: fundo preto substituído pelo cinza escuro...` | `globals.css`, `components/layout/Sidebar.tsx`, `tailwind.config.ts` |

**Detalhamento do commit `5ae615b`:**

Ajuste visual global do sistema: o fundo preto puro foi substituído pelo cinza escuro característico do Manus (~`#252525`, equivalente a `oklch 0.18`). Cards, sidebar, inputs e bordas foram ajustados proporcionalmente para manter a hierarquia visual. Este commit também incluiu ajustes nas políticas de acesso RLS do Supabase.

---

### 2026-03-31

| Hash | Mensagem | Arquivos Principais |
|---|---|---|
| `5deb6b5` | `ajustes no banco de dados e politicas de acesso` | `supabase/schema.sql`, `src/lib/supabase.ts` |
| `59f0693` | `Atualização do arquivo.env` | `.env.local`, `.env.example` |
| `198604f` | `Atualização do arquivo.env` | `.env.local` |
| `b996183` | `Add files via upload` | Múltiplos arquivos do projeto |
| `8d410dc` | `Add files via upload` | Múltiplos arquivos do projeto |
| `a3126bd` | `Upload do projeto Next.js para o novo repositório` | Estrutura inicial Next.js |
| `6aaf6b4` | `Checkpoint: Sistema Financeiro LVP v1.0 — Implementação completa` | Todos os módulos do sistema |
| `2106245` | `Initial project bootstrap` | Bootstrap inicial do template Manus |

**Detalhamento do commit `6aaf6b4`:**

Commit de lançamento da versão 1.0 do sistema. Incluiu a implementação completa de todos os módulos: dashboard dark/gold elegante, importação OFX com classificação automática por categorias, gestão de pagamentos e recebimentos por loja (Muzambinho, Guaxupé, Poços de Caldas), pagamentos futuros com recorrência, recebimentos futuros com suporte a cartão/boleto/PIX, 127 categorias do Plano LVP pré-carregadas e 15 testes unitários passando.

---

## Procedimento para Registrar Novos Commits

Sempre que um commit for realizado no repositório, adicione uma entrada neste arquivo seguindo o modelo abaixo:

```
### AAAA-MM-DD

| Hash | Mensagem | Arquivos Principais |
|---|---|---|
| `abc1234` | `tipo: descrição resumida` | `arquivo1.ts`, `arquivo2.tsx` |

**Detalhamento:** Descrição completa do que foi alterado, motivação e impacto.
```

---

## Branches

| Branch | Finalidade | Status |
|---|---|---|
| `main` | Código de produção | Ativo |

Atualmente o projeto utiliza apenas a branch `main`. Para novas funcionalidades de maior porte, recomenda-se criar branches de feature (`feat/nome-da-feature`) e abrir Pull Request para revisão antes do merge.
