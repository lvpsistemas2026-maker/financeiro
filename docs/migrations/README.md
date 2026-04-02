# Migrações de Banco de Dados

Este diretório contém cópias documentadas dos scripts SQL de migração do Supabase. Os arquivos originais estão em `supabase/` na raiz do projeto; aqui ficam as versões com anotações adicionais para referência histórica.

## Índice de Migrações

| # | Arquivo | Data | Tabela(s) Afetada(s) | Descrição |
|---|---|---|---|---|
| 001 | `schema.sql` | 2026-03-31 | Todas | Criação do schema completo inicial |
| 002 | `seed.sql` | 2026-03-31 | `lojas`, `categorias` | Dados iniciais: 3 lojas + 127 categorias v1 |
| 003 | `migration_categorias_v2.sql` | 2026-03-31 | `categorias` | Substituição por 67 categorias hierárquicas do Plano LVP-Atual |
| 004 | `migration_add_numero_nf.sql` | 2026-04-02 | `pagamentos` | Adição da coluna `numero_nf VARCHAR(100)` |

## Regras para Novas Migrações

Ao criar uma nova migração, siga estas regras:

1. **Numeração sequencial:** use o próximo número disponível na sequência (005, 006...).
2. **Nome descritivo:** `migration_NNN_descricao_curta.sql`.
3. **Cabeçalho obrigatório:** inclua comentários com data, autor e descrição no início do arquivo.
4. **Idempotência:** sempre que possível, use `IF NOT EXISTS` / `IF EXISTS` para que o script possa ser executado mais de uma vez sem erros.
5. **Rollback:** documente no comentário como reverter a migração, se aplicável.

## Modelo de Script

```sql
-- ============================================================
-- Migração NNN: Título da migração
-- Data: AAAA-MM-DD
-- Autor: Nome do desenvolvedor
-- Descrição: Explicação detalhada do que este script faz
-- Rollback: Comando SQL para reverter (ex: ALTER TABLE ... DROP COLUMN ...)
-- ============================================================

-- Sua alteração aqui
ALTER TABLE nome_tabela ADD COLUMN IF NOT EXISTS nova_coluna TIPO;

-- Documentação interna no banco
COMMENT ON COLUMN nome_tabela.nova_coluna IS 'Descrição do campo';
```

## Como Executar

1. Acesse o **Supabase Dashboard** do projeto `vuqfvujwfwuobxwohsvg`.
2. Navegue até **SQL Editor**.
3. Clique em **New query**.
4. Cole o conteúdo do script de migração.
5. Clique em **Run** e verifique se não houve erros.
6. Atualize a tabela de migrações em `docs/SUPABASE.md` e `docs/GUIA_OPERACIONAL.md`.
