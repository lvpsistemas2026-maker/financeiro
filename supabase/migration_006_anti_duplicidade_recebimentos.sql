-- ============================================================
-- Migração 006: Regra anti-duplicidade em Recebimentos
-- Data: 2026-04-02
-- Descrição: Adiciona campo numero_nf na tabela recebimentos e documenta
--            a regra de prevenção de duplicidade implementada na camada de aplicação.
-- ============================================================

-- Adiciona coluna numero_nf na tabela recebimentos (se não existir)
ALTER TABLE recebimentos
  ADD COLUMN IF NOT EXISTS numero_nf VARCHAR(100);

-- Regra implementada em src/actions/index.ts → createRecebimento():
--
-- 1. BOLETO COM Nº NF:
--    Chave = descricao (ilike) + numero_nf (ilike) + loja_id
--    → Impede cadastrar a mesma NF duas vezes para o mesmo cliente/loja.
--    → Permite NFs diferentes do mesmo cliente (parcelas de boleto).
--
-- 2. BOLETO SEM Nº NF ou OUTROS RECEBIMENTOS (PIX, Dinheiro, etc.):
--    Chave = descricao (ilike) + valor + data_recebimento + loja_id
--    → Impede cadastrar o mesmo valor na mesma data para o mesmo cliente.
--
-- Comportamento: exibe aviso inline no modal com opção "Salvar mesmo assim".

COMMENT ON TABLE recebimentos IS
  'Recebimentos realizados por loja. Possui regra anti-duplicidade na camada de aplicação: '
  'boleto+NF bloqueia por cliente+NF; outros recebimentos bloqueiam por cliente+valor+data.';
