# Documentação do Banco de Dados — Supabase

**Projeto Supabase:** `vuqfvujwfwuobxwohsvg`  
**URL:** `https://vuqfvujwfwuobxwohsvg.supabase.co`  
**Região:** South America (São Paulo)  
**Banco:** PostgreSQL (gerenciado pelo Supabase)  
**Última atualização deste documento:** 2026-04-02

---

## Variáveis de Ambiente

As seguintes variáveis devem estar configuradas no arquivo `.env.local` (desenvolvimento) e nas configurações de ambiente do servidor de produção:

| Variável | Descrição | Onde obter |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública do projeto Supabase | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima (segura para frontend) | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (apenas servidor) | Supabase → Settings → API |

> **Atenção:** A `SUPABASE_SERVICE_ROLE_KEY` nunca deve ser exposta no frontend. Ela é utilizada exclusivamente nas Server Actions do Next.js.

---

## Estrutura das Tabelas

### `lojas`

Armazena as três unidades da rede LVP.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `SERIAL` | PK | Identificador sequencial |
| `nome` | `VARCHAR(100)` | NOT NULL | Nome da loja |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Data de criação |

**Registros fixos:** Muzambinho (id=1), Guaxupé (id=2), Poços de Caldas (id=3).

---

### `categorias`

Plano de contas hierárquico do sistema LVP. Cada categoria pode ter um pai (estrutura em árvore).

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `SERIAL` | PK | Identificador sequencial |
| `nome` | `VARCHAR(150)` | NOT NULL | Nome da categoria |
| `tipo` | `VARCHAR(20)` | NOT NULL | `receita` ou `despesa` |
| `codigo` | `VARCHAR(20)` | | Código do plano de contas (ex: `1.1.01`) |
| `pai_id` | `INTEGER` | FK → categorias.id | Categoria pai (hierarquia) |
| `ativo` | `BOOLEAN` | DEFAULT true | Se a categoria está ativa |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Data de criação |

**Versão atual:** 67 categorias hierárquicas do Plano LVP-Atual (migração v2, 2026-03-31).

---

### `transacoes`

Lançamentos financeiros importados via OFX ou cadastrados manualmente.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `SERIAL` | PK | Identificador sequencial |
| `loja_id` | `INTEGER` | FK → lojas.id | Loja associada |
| `categoria_id` | `INTEGER` | FK → categorias.id | Categoria financeira |
| `descricao` | `TEXT` | NOT NULL | Descrição da transação |
| `valor` | `NUMERIC(12,2)` | NOT NULL | Valor (positivo = crédito, negativo = débito) |
| `tipo` | `VARCHAR(10)` | NOT NULL | `credito` ou `debito` |
| `data` | `DATE` | NOT NULL | Data da transação |
| `origem` | `VARCHAR(20)` | DEFAULT `manual` | `ofx` ou `manual` |
| `ofx_id` | `VARCHAR(100)` | | ID único do OFX (evita duplicatas) |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Data de criação |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | Data de atualização |

---

### `pagamentos`

Débitos realizados por loja (contas pagas).

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `SERIAL` | PK | Identificador sequencial |
| `loja_id` | `INTEGER` | FK → lojas.id | Loja associada |
| `categoria_id` | `INTEGER` | FK → categorias.id | Categoria financeira |
| `descricao` | `TEXT` | NOT NULL | Descrição do pagamento |
| `valor` | `NUMERIC(12,2)` | NOT NULL | Valor pago |
| `data_pagamento` | `DATE` | NOT NULL | Data do pagamento |
| `status` | `VARCHAR(20)` | DEFAULT `pago` | `pago`, `pendente` ou `cancelado` |
| `forma_pagamento` | `VARCHAR(50)` | | Forma de pagamento (PIX, boleto, etc.) |
| `numero_nf` | `VARCHAR(100)` | | Número da Nota Fiscal *(adicionado em 2026-04-02)* |
| `observacao` | `TEXT` | | Observações adicionais |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Data de criação |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | Data de atualização |

---

### `recebimentos`

Créditos recebidos por loja.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `SERIAL` | PK | Identificador sequencial |
| `loja_id` | `INTEGER` | FK → lojas.id | Loja associada |
| `categoria_id` | `INTEGER` | FK → categorias.id | Categoria financeira |
| `descricao` | `TEXT` | NOT NULL | Descrição do recebimento |
| `valor` | `NUMERIC(12,2)` | NOT NULL | Valor recebido |
| `data_recebimento` | `DATE` | NOT NULL | Data do recebimento |
| `status` | `VARCHAR(20)` | DEFAULT `recebido` | `recebido`, `pendente` ou `cancelado` |
| `forma_recebimento` | `VARCHAR(50)` | | Forma de recebimento |
| `observacao` | `TEXT` | | Observações adicionais |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Data de criação |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | Data de atualização |

---

### `pagamentos_futuros`

Contas a pagar (previsão de débitos).

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `SERIAL` | PK | Identificador sequencial |
| `loja_id` | `INTEGER` | FK → lojas.id | Loja associada |
| `categoria_id` | `INTEGER` | FK → categorias.id | Categoria financeira |
| `descricao` | `TEXT` | NOT NULL | Descrição |
| `valor` | `NUMERIC(12,2)` | NOT NULL | Valor previsto |
| `data_vencimento` | `DATE` | NOT NULL | Data de vencimento |
| `status` | `VARCHAR(20)` | DEFAULT `pendente` | `pendente`, `pago`, `vencido` ou `cancelado` |
| `recorrente` | `BOOLEAN` | DEFAULT false | Se é um lançamento recorrente |
| `periodicidade` | `VARCHAR(20)` | | `mensal`, `semanal`, `anual` |
| `observacao` | `TEXT` | | Observações adicionais |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Data de criação |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | Data de atualização |

---

### `recebimentos_futuros`

Contas a receber (previsão de créditos) — cartão, boleto e PIX.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `SERIAL` | PK | Identificador sequencial |
| `loja_id` | `INTEGER` | FK → lojas.id | Loja associada |
| `categoria_id` | `INTEGER` | FK → categorias.id | Categoria financeira |
| `descricao` | `TEXT` | NOT NULL | Descrição |
| `valor` | `NUMERIC(12,2)` | NOT NULL | Valor total |
| `data_prevista` | `DATE` | NOT NULL | Data prevista de recebimento |
| `status` | `VARCHAR(20)` | DEFAULT `pendente` | `pendente`, `recebido` ou `cancelado` |
| `tipo_recebimento` | `VARCHAR(20)` | | `cartao`, `boleto` ou `pix` |
| `parcelas` | `INTEGER` | DEFAULT 1 | Número de parcelas |
| `parcela_atual` | `INTEGER` | DEFAULT 1 | Parcela atual |
| `observacao` | `TEXT` | | Observações adicionais |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Data de criação |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | Data de atualização |

---

### `palavras_chave`

Regras de classificação automática para transações importadas via OFX.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `SERIAL` | PK | Identificador sequencial |
| `categoria_id` | `INTEGER` | FK → categorias.id NOT NULL | Categoria que será atribuída |
| `palavra` | `VARCHAR(100)` | NOT NULL | Palavra-chave a buscar na descrição |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Data de criação |

---

## Histórico de Migrações

| # | Arquivo | Data | Descrição |
|---|---|---|---|
| 001 | `schema.sql` | 2026-03-31 | Schema inicial completo (todas as tabelas) |
| 002 | `seed.sql` | 2026-03-31 | Seed v1: 3 lojas + 127 categorias genéricas |
| 003 | `migration_categorias_v2.sql` | 2026-03-31 | Substitui categorias por 67 hierárquicas do Plano LVP-Atual |
| 004 | `migration_add_numero_nf.sql` | 2026-04-02 | Adiciona coluna `numero_nf VARCHAR(100)` na tabela `pagamentos` |
| 005 | `migration_005_anti_duplicidade.sql` | 2026-04-02 | Documenta regra anti-duplicidade (camada de aplicação) + COMMENT na tabela `pagamentos` |
| 006 | `migration_006_anti_duplicidade_recebimentos.sql` | 2026-04-02 | Adiciona `numero_nf` em `recebimentos` + regra anti-duplicidade (camada de aplicação) |

> Os scripts de migração estão disponíveis em `supabase/` e também em `docs/migrations/` com documentação adicional.

---

## Row Level Security (RLS)

O Supabase tem RLS habilitado em todas as tabelas. As políticas configuradas permitem acesso público de leitura e escrita (sistema interno sem autenticação de usuários por enquanto). Caso seja necessário restringir o acesso no futuro, as políticas deverão ser revisadas.

---

## Procedimento para Executar Migrações

1. Acesse o **Supabase Dashboard** → **SQL Editor**.
2. Abra o arquivo de migração correspondente em `supabase/` ou `docs/migrations/`.
3. Cole o conteúdo SQL no editor e clique em **Run**.
4. Verifique se não houve erros na execução.
5. Atualize este documento (`SUPABASE.md`) com a nova entrada na tabela de migrações.
6. Registre a alteração no `CHANGELOG.md`.
