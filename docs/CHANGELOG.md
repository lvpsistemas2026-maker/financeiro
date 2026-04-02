# CHANGELOG — Sistema Financeiro LVP

Todas as alterações relevantes do projeto são documentadas neste arquivo, seguindo o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

Os tipos de alteração utilizados são:
- **Adicionado** — novas funcionalidades
- **Alterado** — mudanças em funcionalidades existentes
- **Corrigido** — correções de bugs
- **Removido** — funcionalidades removidas
- **Banco de Dados** — alterações no schema ou dados do Supabase
- **Infraestrutura** — mudanças em configuração, deploy ou dependências

---

## [Não lançado]

> Alterações em desenvolvimento que ainda não foram publicadas em produção.

---

## [1.3.0] — 2026-04-02

### Infraestrutura
- Migração completa do servidor Manus: projeto React+Vite+tRPC removido e substituído pelo projeto Next.js 14 como sistema ativo.
- Variáveis de ambiente Supabase configuradas no servidor Manus (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- Dependências instaladas via `npm install` no servidor.

### Adicionado
- **Toast/Snackbar personalizado** (`src/components/ui/toast-custom.tsx`): componente `lvpToast` com variantes `success`, `error`, `warning`, `info`, `loading` e `promise`. Cada variante exibe barra colorida lateral, ícone correspondente e botão de fechar.
- **Estilos CSS globais para toasts** em `globals.css`: seletores `[data-sonner-toast]` com barra lateral colorida por tipo, ícones estilizados, botão de fechar e tipografia consistente.
- **Pasta `docs/`** criada na raiz do projeto para centralizar toda a documentação técnica.

### Banco de Dados
- Coluna `numero_nf VARCHAR(100)` confirmada na tabela `pagamentos` (já existia no Supabase desde sessão anterior).
- Script de migração `supabase/migration_add_numero_nf.sql` adicionado ao repositório.
- Script de migração `supabase/migration_categorias_v2.sql` adicionado ao repositório (67 categorias hierárquicas do Plano LVP-Atual).

### Alterado
- `src/app/layout.tsx`: Toaster movido para `bottom-right`, adicionados `closeButton`, `visibleToasts={5}`, `gap={8}` e estilos refinados.
- `src/app/globals.css`: Google Fonts movido para linha 1 (correção de aviso CSS); estilos globais de toast adicionados.

### GitHub
- Commit `2207eaa`: `feat: adiciona campo numero_nf em Pagamentos, icone visualizar, migracoes Supabase e categorias v2`
- Push realizado para `origin/main` em `https://github.com/lvpsistemas2026-maker/financeiro`

---

## [1.2.0] — 2026-04-01

### Adicionado
- **Campo Número da NF** no formulário de Pagamentos (`src/app/pagamentos/PagamentosClient.tsx`): campo de texto abaixo da descrição, aceita alfanumérico (ex: `NF 646690-4`).
- **Ícone de visualização (Eye)** na lista de Pagamentos: abre modal com todos os detalhes do registro, incluindo o Número da NF.
- **Modal de detalhes** do pagamento com exibição completa: loja, categoria, valor, data, status, forma de pagamento, NF e observações.

### Banco de Dados
- Coluna `numero_nf VARCHAR(100)` adicionada à tabela `pagamentos` via `ALTER TABLE`.
- `COMMENT ON COLUMN pagamentos.numero_nf` adicionado para documentação interna.

### Alterado
- `src/actions/index.ts`: parâmetro `numero_nf` adicionado nas funções `createPagamento` e `updatePagamento`.
- `src/lib/supabase.ts`: fallback para credenciais ausentes (evita erros em ambiente sem `.env.local`).

### Infraestrutura
- Tema visual atualizado: fundo preto substituído pelo cinza escuro característico do Manus (~`#252525`). Cards, sidebar, inputs e bordas ajustados proporcionalmente.

### GitHub
- Commit `5deb6b5`: `ajustes no banco de dados e politicas de acesso`
- Commit `5ae615b`: `Checkpoint: Tema atualizado: fundo preto substituído pelo cinza escuro...`

---

## [1.1.0] — 2026-03-31

### Adicionado
- **Seed v2** com 67 categorias hierárquicas do Plano LVP-Atual (substituindo as 127 categorias genéricas da v1).
- **Script `migration_categorias_v2.sql`**: remove vínculos, limpa tabela e recarrega com estrutura hierárquica.
- **Página de Relatórios** (`src/app/relatorios/`): filtros por período, loja e categoria.
- **Políticas de acesso RLS** no Supabase configuradas para todas as tabelas.

### Banco de Dados
- Tabela `palavras_chave` adicionada ao schema para classificação automática de transações OFX.
- Políticas RLS (`Row Level Security`) habilitadas e configuradas em todas as tabelas.

### GitHub
- Commit `b996183`: `Add files via upload`
- Commit `8d410dc`: `Add files via upload`
- Commit `59f0693`: `Atualização do arquivo.env`
- Commit `198604f`: `Atualização do arquivo.env`

---

## [1.0.0] — 2026-03-31

### Adicionado — Lançamento inicial do sistema

**Banco de Dados (Supabase PostgreSQL)**
- Tabela `lojas`: Muzambinho, Guaxupé e Poços de Caldas.
- Tabela `categorias`: plano de contas com código hierárquico.
- Tabela `transacoes`: lançamentos importados do OFX e manuais.
- Tabela `pagamentos`: débitos por loja com status e forma de pagamento.
- Tabela `recebimentos`: créditos por loja.
- Tabela `pagamentos_futuros`: contas a pagar com vencimento e recorrência.
- Tabela `recebimentos_futuros`: contas a receber (cartão, boleto, PIX) com parcelas.
- Seed inicial: 3 lojas + 127 categorias do Plano LVP (v1).

**Backend (Next.js Server Actions)**
- `src/actions/index.ts`: todas as operações CRUD para lojas, categorias, transações, pagamentos, recebimentos, pagamentos futuros, recebimentos futuros, dashboard e importação OFX.
- Parser OFX: leitura de arquivos `.OFX` do Banco do Brasil, separação crédito/débito, saldo do dia.
- Classificação automática de transações por palavras-chave.

**Frontend**
- Tema dark/gold elegante (fundo `#252525`, dourado `#C9A84C`).
- Sidebar responsiva com 9 módulos organizados em grupos.
- Dashboard com saldo total, entradas/saídas do mês, gráficos de evolução e resultado por loja.
- Página de Importar Extrato: upload OFX, preview de transações, confirmação e classificação.
- Páginas completas: Transações, Pagamentos, Recebimentos, Pag. Futuros, Rec. Futuros, Categorias.
- Badges de status: `pago`, `pendente`, `vencido`, `cancelado`, `recebido`.
- Animações `slide-in` nas páginas.

### GitHub
- Commit `a3126bd`: `Upload do projeto Next.js para o novo repositório`
- Commit `6aaf6b4`: `Checkpoint: Sistema Financeiro LVP v1.0 — Implementação completa`
- Commit `2106245`: `Initial project bootstrap`
