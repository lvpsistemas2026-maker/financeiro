-- ============================================================
-- Migração 005: Regra anti-duplicidade em Pagamentos
-- Data: 2026-04-02
-- Descrição: Adiciona comentário de documentação sobre a regra de
--            prevenção de duplicidade implementada na camada de aplicação.
-- ============================================================

-- Regra implementada em src/actions/index.ts → createPagamento():
--
-- 1. BOLETO COM Nº NF:
--    Chave = descricao (ilike) + numero_nf (ilike) + loja_id
--    → Impede cadastrar a mesma NF duas vezes para o mesmo fornecedor/loja.
--    → Permite NFs diferentes do mesmo fornecedor (parcelas de boleto).
--
-- 2. BOLETO SEM Nº NF ou OUTROS PAGAMENTOS:
--    Chave = descricao (ilike) + valor + data_pagamento + loja_id
--    → Impede cadastrar o mesmo valor na mesma data para o mesmo fornecedor.
--
-- Comportamento: exibe aviso inline com opção "Salvar mesmo assim".

COMMENT ON TABLE pagamentos IS 
  'Pagamentos realizados por loja. Possui regra anti-duplicidade na camada de aplicação: '
  'boleto+NF bloqueia por fornecedor+NF; outros pagamentos bloqueiam por fornecedor+valor+data.';
