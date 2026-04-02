# Sistema Financeiro LVP - TODO (Next.js 14 + Supabase)

## Banco de Dados (Supabase PostgreSQL)
- [x] Schema: tabela lojas
- [x] Schema: tabela categorias (com campo codigo do plano de contas)
- [x] Schema: tabela transacoes
- [x] Schema: tabela pagamentos
- [x] Schema: tabela recebimentos
- [x] Schema: tabela pagamentos_futuros
- [x] Schema: tabela recebimentos_futuros
- [x] Schema: tabela palavras_chave
- [x] Seed inicial: 3 lojas + 67 categorias do Plano LVP-Atual
- [x] Migracao categorias v2 (67 categorias hierarquicas)
- [ ] Migracao: adicionar coluna numero_nf na tabela pagamentos

## Backend (Next.js Server Actions)
- [x] Actions: lojas (getLojas)
- [x] Actions: categorias (getCategorias, createCategoria, updateCategoria, deleteCategoria)
- [x] Actions: transacoes (getTransacoes, createTransacao, updateTransacao, deleteTransacao)
- [x] Actions: pagamentos (getPagamentos, createPagamento, updatePagamento, deletePagamento)
- [x] Actions: recebimentos (getRecebimentos, createRecebimento, updateRecebimento, deleteRecebimento)
- [x] Actions: pagamentos_futuros (CRUD + vencimentos + recorrencia)
- [x] Actions: recebimentos_futuros (CRUD + cartao/boleto/pix + parcelas)
- [x] Actions: dashboard (resumo, saldo diario, por loja)
- [x] Actions: importacao OFX (parse + classificacao automatica)
- [x] campo numero_nf adicionado em createPagamento e updatePagamento

## Frontend - Layout e Design
- [x] Tema dark/gold elegante (fundo #252525)
- [x] Badges de status (pago, pendente, cancelado)
- [x] Animacao slide-in para paginas
- [x] Sidebar responsiva com todos os modulos

## Frontend - Paginas
- [x] Dashboard (saldo do dia, entradas/saidas, por loja)
- [x] Importar Extrato (upload OFX, preview, confirmar, classificacao automatica)
- [x] Transacoes (lista com filtros: data, loja, tipo, categoria)
- [x] Pagamentos (lista + cadastro manual por loja + campo NF + icone visualizar)
- [x] Recebimentos (lista + cadastro manual por loja)
- [x] Pagamentos Futuros (lista + cadastro + controle vencimento + recorrencia)
- [x] Recebimentos Futuros (lista + cadastro + parcelas cartao/boleto/pix)
- [x] Categorias (CRUD + regras de palavras-chave + plano de contas)
- [x] Relatorios (filtros periodo, loja, categoria)

## Configuracao
- [x] Projeto migrado de React+Vite+tRPC para Next.js 14 + Supabase
- [x] Configurar variaveis de ambiente SUPABASE no servidor Manus
- [x] Instalar dependencias npm
- [x] Iniciar servidor Next.js
- [x] Criar pasta docs/ com documentacao completa (CHANGELOG, SUPABASE, ARQUITETURA, GUIA_OPERACIONAL, GITHUB_HISTORY, migrations/)
- [x] Regra anti-duplicidade em Pagamentos: boleto (NF+parcela), outros (descricao+valor+data)
- [x] Migracao 005: documentacao da regra anti-duplicidade (camada de aplicacao)
- [x] Regra anti-duplicidade em Recebimentos: boleto (NF+parcela), outros (descricao+valor+data)
- [x] Migracao 006: adiciona numero_nf em recebimentos + documentacao da regra anti-duplicidade
- [x] Filtro por Numero da NF em Pagamentos e Recebimentos
- [x] Renomear coluna DATA para DATA VENCIMENTO em Pagamentos (tabela e formulario)
- [x] Adicionar coluna pago_em (timestamp) na tabela pagamentos no Supabase
- [x] Exibir data/hora de pagamento no modal Detalhes quando status for Pago
- [x] Gravar pago_em automaticamente ao marcar pagamento como Pago
- [x] Adicionar coluna recebido_em (timestamp) na tabela recebimentos no Supabase
- [x] Renomear coluna DATA para DATA VENCIMENTO em Recebimentos
- [x] Exibir data/hora de recebimento no modal Detalhes quando status for Recebido
- [x] Gravar recebido_em automaticamente ao marcar recebimento como Recebido
- [x] Adicionar coluna confirmado_em (TIMESTAMPTZ) em pagamentos_futuros no Supabase
- [x] Adicionar coluna confirmado_em (TIMESTAMPTZ) em recebimentos_futuros no Supabase
- [x] Exibir confirmado_em no modal de detalhes de Pagamentos Futuros
- [x] Exibir confirmado_em no modal de detalhes de Recebimentos Futuros
- [x] Gravar confirmado_em ao marcar Pagamento Futuro como pago
- [x] Gravar confirmado_em ao marcar Recebimento Futuro como recebido
- [x] Secao Datas Futuras no formulario de Pagamentos (novo e edicao)
- [x] Secao Datas Futuras no formulario de Recebimentos (novo e edicao)
- [x] Server Action createPagamento: criar registros em pagamentos_futuros ao salvar com datas futuras
- [x] Server Action createRecebimento: criar registros em recebimentos_futuros ao salvar com datas futuras
