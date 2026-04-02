-- Migração: Adicionar coluna numero_nf na tabela pagamentos
-- Data: 2026-04-02
-- Descrição: Adiciona campo para número da Nota Fiscal (aceita letras, números e caracteres especiais)

ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS numero_nf VARCHAR(100);

-- Comentário explicativo
COMMENT ON COLUMN pagamentos.numero_nf IS 'Número da Nota Fiscal (alfanumérico, ex: NF 646690-4, 12345/2026)';
