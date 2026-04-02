-- ============================================================
-- Migração 006: Regra anti-duplicidade em Recebimentos
-- Data: 2026-04-02
-- ============================================================

-- Adiciona coluna numero_nf na tabela recebimentos (se não existir)
ALTER TABLE recebimentos
  ADD COLUMN IF NOT EXISTS numero_nf VARCHAR(100);

-- Regra implementada em src/actions/index.ts → createRecebimento():
-- 1. BOLETO COM Nº NF: chave = cliente + NF + loja
-- 2. OUTROS: chave = cliente + valor + data + loja
-- Comportamento: aviso inline com opção "Salvar mesmo assim".

COMMENT ON TABLE recebimentos IS
  'Recebimentos realizados por loja. Possui regra anti-duplicidade na camada de aplicação: '
  'boleto+NF bloqueia por cliente+NF; outros recebimentos bloqueiam por cliente+valor+data.';
