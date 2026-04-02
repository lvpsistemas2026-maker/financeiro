-- ============================================================
-- Migração 005: Regra anti-duplicidade em Pagamentos
-- Data: 2026-04-02
-- Descrição: Adiciona comentário de documentação sobre a regra de
--            prevenção de duplicidade implementada na camada de aplicação.
--            A verificação é feita via Server Action (Next.js) antes do INSERT.
-- Rollback: Não aplicável (sem alteração estrutural no banco)
-- ============================================================

-- Regra implementada em src/actions/index.ts → createPagamento():
--
-- 1. BOLETO COM Nº NF:
--    Chave de unicidade = descricao (ilike) + numero_nf (ilike) + loja_id
--    → Impede cadastrar a mesma NF duas vezes para o mesmo fornecedor/loja.
--    → Permite NFs diferentes do mesmo fornecedor (parcelas de boleto).
--
-- 2. BOLETO SEM Nº NF ou OUTROS PAGAMENTOS (PIX, Dinheiro, Transferência, etc.):
--    Chave de unicidade = descricao (ilike) + valor + data_pagamento + loja_id
--    → Impede cadastrar o mesmo valor na mesma data para o mesmo fornecedor.
--
-- Comportamento quando duplicidade é detectada:
--    - O sistema NÃO bloqueia definitivamente.
--    - Exibe aviso inline no modal com a descrição do registro existente.
--    - Oferece botão "Salvar mesmo assim" para casos legítimos (ex: parcelas).
--    - O campo _ignorar_dup=true bypassa a verificação quando confirmado.
--
-- Documentação: docs/SUPABASE.md, docs/CHANGELOG.md

-- Adiciona comentário na tabela para documentar a regra
COMMENT ON TABLE pagamentos IS 
  'Pagamentos realizados por loja. Possui regra anti-duplicidade na camada de aplicação: '
  'boleto+NF bloqueia por fornecedor+NF; outros pagamentos bloqueiam por fornecedor+valor+data.';
