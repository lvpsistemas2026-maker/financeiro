-- ============================================================
-- Migração 007: Adicionar coluna pago_em na tabela pagamentos
-- Data: 2026-04-02
-- Descrição: Registra o timestamp exato (data e hora) em que
--            o status do pagamento foi alterado para 'pago'.
-- ============================================================

ALTER TABLE pagamentos
  ADD COLUMN IF NOT EXISTS pago_em TIMESTAMPTZ;

COMMENT ON COLUMN pagamentos.pago_em IS
  'Timestamp (com fuso horário) de quando o status foi alterado para pago. '
  'Preenchido automaticamente pela Server Action updatePagamento ao detectar '
  'transição de status para pago.';
