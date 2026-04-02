-- Migração 009: Adicionar coluna numero_nf na tabela recebimentos
-- Data: 2026-04-02
-- Descrição: Adiciona o campo numero_nf para registrar o número da Nota Fiscal
--            nos recebimentos. Necessário para a regra anti-duplicidade de boletos
--            e para o filtro por NF na listagem de recebimentos.
-- Executado via Supabase SQL Editor

ALTER TABLE recebimentos ADD COLUMN IF NOT EXISTS numero_nf TEXT;

-- Recarregar o cache de schema do PostgREST para reconhecer a nova coluna
NOTIFY pgrst, 'reload schema';

-- Verificar se a coluna foi criada:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'recebimentos' ORDER BY ordinal_position;
