-- ============================================================
-- MIGRAÇÃO: Atualização das Categorias para o Plano LVP - Atual
-- ============================================================
-- ATENÇÃO: Este script apaga TODAS as categorias existentes e
-- recarrega com a nova estrutura do Plano LVP - Atual.
-- Execute este script no SQL Editor do Supabase.
-- ============================================================

-- Passo 1: Remove vínculos de categorias nas transações existentes
-- (mantém as transações, apenas desvincula a categoria)
UPDATE transacoes SET categoria_id = NULL WHERE categoria_id IS NOT NULL;
UPDATE pagamentos SET categoria_id = NULL WHERE categoria_id IS NOT NULL;
UPDATE recebimentos SET categoria_id = NULL WHERE categoria_id IS NOT NULL;
UPDATE pagamentos_futuros SET categoria_id = NULL WHERE categoria_id IS NOT NULL;
UPDATE recebimentos_futuros SET categoria_id = NULL WHERE categoria_id IS NOT NULL;

-- Passo 2: Limpa a tabela de categorias
TRUNCATE TABLE categorias RESTART IDENTITY;

-- Passo 3: Insere as novas categorias do Plano LVP - Atual
INSERT INTO categorias (codigo, nome, tipo, grupo, palavras_chave, ativa) VALUES

-- ══════════════════════════════════════════════════════════════
-- 1) RECEITA
-- ══════════════════════════════════════════════════════════════

-- 1.1) Receitas Operacionais
('1.1.1',  'Receitas Operacionais',             'entrada', '1.1 Receitas Operacionais',        'receita, venda, operacional',                                         true),
('1.1.3',  'Venda de Aparelhos',                'entrada', '1.1 Receitas Operacionais',        'aparelho, venda aparelho, auditivo, widex, phonak, oticon',           true),
('1.1.4',  'Venda de Acessórios',               'entrada', '1.1 Receitas Operacionais',        'acessório, acessorios, pilha, bateria, cabo',                         true),
('1.1.5',  'Devolução de Vendas',               'entrada', '1.1 Receitas Operacionais',        'devolução, devolucao, estorno, reembolso',                            true),
('1.1.6',  'Receita Assistência Técnica',       'entrada', '1.1 Receitas Operacionais',        'assistência técnica, assistencia tecnica, reparo, manutenção aparelho', true),
('1.1.7',  'Prótese',                           'entrada', '1.1 Receitas Operacionais',        'prótese, protese, implante',                                          true),
('1.1.8',  'Verba Widex Excellence',            'entrada', '1.1 Receitas Operacionais',        'widex excellence, verba widex, bonificação widex',                    true),

-- 1.2.1) Deduções - Impostos Diretos
('1.2.1.1','ISSQN',                             'saida',   '1.2.1 Impostos Diretos',           'issqn, iss, imposto serviço',                                         true),
('1.2.1.2','ICMS',                              'saida',   '1.2.1 Impostos Diretos',           'icms, imposto circulação',                                            true),
('1.2.1.3','Imposto Estadual (DAE)',             'saida',   '1.2.1 Impostos Diretos',           'dae, imposto estadual, taxa estadual',                                true),
('1.2.1.4','Simples Nacional',                  'saida',   '1.2.1 Impostos Diretos',           'simples nacional, das, pgdas, receita federal',                       true),

-- 1.2.2) Deduções - Custos dos Produtos e Serviços
('1.2.2.1','Custo dos Aparelhos',               'saida',   '1.2.2 Custos dos Produtos e Serviços', 'custo aparelho, nf aparelho, nota fiscal aparelho, fornecedor aparelho', true),
('1.2.2.2','Custo dos Acessórios',              'saida',   '1.2.2 Custos dos Produtos e Serviços', 'custo acessório, nf acessório, compra acessório',                 true),
('1.2.2.3','Custo Assistência Técnica',         'saida',   '1.2.2 Custos dos Produtos e Serviços', 'custo assistência, reparo terceiro, conserto',                    true),

-- 1.2.3) Deduções - Comissões e Taxas
('1.2.3.1','Comissões Fono',                    'saida',   '1.2.3 Comissões e Taxas',          'comissão fono, fonoaudióloga, fonoaudiologo',                         true),
('1.2.3.2','Comissões Médicos',                 'saida',   '1.2.3 Comissões e Taxas',          'comissão médico, comissao medico, médico parceiro',                   true),
('1.2.3.3','Taxa Cartão Crédito',               'saida',   '1.2.3 Comissões e Taxas',          'taxa cartão, mdr, cielo, rede, stone, getnet, pagseguro',             true),
('1.2.3.4','Consulta de Crédito',               'saida',   '1.2.3 Comissões e Taxas',          'consulta crédito, serasa, spc, bureau',                               true),
('1.2.3.5','Comissões da Equipe',               'saida',   '1.2.3 Comissões e Taxas',          'comissão equipe, comissão vendas, comissão funcionário',              true),

-- ══════════════════════════════════════════════════════════════
-- 2) DESPESAS
-- ══════════════════════════════════════════════════════════════

-- 2.1.1) Remuneração
('2.1.1.1','Equipe PJ / Terceiros',             'saida',   '2.1.1 Remuneração',                'pj, pessoa jurídica, terceiro, prestador, rpa',                       true),
('2.1.1.2','Salários e Ordenados',              'saida',   '2.1.1 Remuneração',                'salário, salario, folha, pagamento funcionário, clt',                 true),
('2.1.1.3','13º Salário',                       'saida',   '2.1.1 Remuneração',                '13 salário, décimo terceiro, gratificação natal',                     true),
('2.1.1.4','Férias',                            'saida',   '2.1.1 Remuneração',                'férias, ferias, adicional férias, abono férias',                      true),

-- 2.1.2) Encargos Sociais
('2.1.2.1','FGTS',                              'saida',   '2.1.2 Encargos Sociais',           'fgts, fundo garantia',                                                true),
('2.1.2.2','INSS',                              'saida',   '2.1.2 Encargos Sociais',           'inss, previdência, gps, contribuição previdenciária',                 true),
('2.1.2.3','IRRF sobre Salários',               'saida',   '2.1.2 Encargos Sociais',           'irrf, imposto renda retido, ir salário',                              true),

-- 2.1.3) Benefícios
('2.1.3.1','Assistência Médica / Odontológica', 'saida',   '2.1.3 Benefícios',                 'plano saúde, plano médico, plano odonto, unimed, amil',               true),
('2.1.3.2','Cursos e Treinamentos',             'saida',   '2.1.3 Benefícios',                 'curso, treinamento, capacitação, workshop, palestra',                 true),
('2.1.3.3','Vale Alimentação / Refeição',       'saida',   '2.1.3 Benefícios',                 'vale alimentação, vale refeição, vr, va, ticket, sodexo, alelo',      true),
('2.1.3.4','Vale Transporte',                   'saida',   '2.1.3 Benefícios',                 'vale transporte, vt, passagem',                                       true),
('2.1.3.5','Seguro de Vida',                    'saida',   '2.1.3 Benefícios',                 'seguro vida funcionário, seguro coletivo',                            true),

-- 2.1.4) Variáveis e Diversos
('2.1.4.1','Prêmios e Gratificações',           'saida',   '2.1.4 Variáveis e Diversos',       'prêmio, gratificação, bônus, bonificação funcionário',                true),
('2.1.4.2','Exames Médicos',                    'saida',   '2.1.4 Variáveis e Diversos',       'exame médico, exame admissional, exame periódico, aso',               true),
('2.1.4.3','Uniformes',                         'saida',   '2.1.4 Variáveis e Diversos',       'uniforme, camisa, jaleco, farda',                                     true),
('2.1.4.4','Rescisões e Indenizações',          'saida',   '2.1.4 Variáveis e Diversos',       'rescisão, demissão, indenização, aviso prévio',                       true),

-- 2.2.1) Serviços de Terceiros
('2.2.1.1','Contador',                          'saida',   '2.2.1 Serviços de Terceiros',      'contador, contabilidade, escritório contábil, honorário contábil',    true),
('2.2.1.2','Consultorias',                      'saida',   '2.2.1 Serviços de Terceiros',      'consultoria, consultor, assessoria empresarial',                      true),
('2.2.1.3','Assessoria Jurídica',               'saida',   '2.2.1 Serviços de Terceiros',      'advogado, jurídico, assessoria jurídica, advocacia',                  true),

-- 2.2.2) Despesas do Imóvel
('2.2.2.1','Aluguel e IPTU',                    'saida',   '2.2.2 Despesas do Imóvel',         'aluguel, iptu, locação, imóvel',                                      true),
('2.2.2.2','Água e Energia',                    'saida',   '2.2.2 Despesas do Imóvel',         'água, energia, luz, copasa, cemig, saae, conta água, conta luz',      true),
('2.2.2.3','Segurança e Manutenção',            'saida',   '2.2.2 Despesas do Imóvel',         'segurança, manutenção predial, vigilância, alarme, câmera',           true),
('2.2.2.4','Taxas de Funcionamento',            'saida',   '2.2.2 Despesas do Imóvel',         'alvará, taxa funcionamento, licença, vigilância sanitária',           true),

-- 2.2.3) Despesas de Rotina
('2.2.3.1','Internet e Telefonia',              'saida',   '2.2.3 Despesas de Rotina',         'internet, telefone, telefonia, claro, vivo, tim, oi, banda larga',    true),
('2.2.3.2','Sistemas e Softwares',              'saida',   '2.2.3 Despesas de Rotina',         'sistema, software, licença, assinatura, saas, erp, crm',              true),
('2.2.3.3','Material de Escritório e Higiene',  'saida',   '2.2.3 Despesas de Rotina',         'material escritório, papel, caneta, higiene, limpeza, descartável',   true),
('2.2.3.4','Fretes e Logística',                'saida',   '2.2.3 Despesas de Rotina',         'frete, correios, transportadora, logística, entrega, sedex',          true),
('2.2.3.5','Copa, Cozinha e Eventos Internos',  'saida',   '2.2.3 Despesas de Rotina',         'café, copa, cozinha, água galão, evento interno, confraternização',   true),

-- 2.3.1) Despesas com Veículos
('2.3.1.1','Combustível e Pedágio',             'saida',   '2.3.1 Despesas com Veículos',      'combustível, gasolina, etanol, diesel, pedágio, posto',               true),
('2.3.1.2','Manutenção e Seguro Veículo',       'saida',   '2.3.1 Despesas com Veículos',      'manutenção veículo, seguro veículo, oficina, revisão, pneu',          true),
('2.3.1.3','Impostos e Licenciamento',          'saida',   '2.3.1 Despesas com Veículos',      'ipva, licenciamento, dpvat, seguro obrigatório',                      true),

-- 2.3.2) Viagens e Estadias
('2.3.2.1','Hospedagem e Alimentação',          'saida',   '2.3.2 Viagens e Estadias',         'hotel, hospedagem, pousada, alimentação viagem, restaurante viagem',  true),
('2.3.2.2','Passagens e Deslocamento / App',    'saida',   '2.3.2 Viagens e Estadias',         'passagem, aérea, ônibus, uber, 99, taxi, deslocamento',               true),

-- 2.4.1) Marketing e Publicidade
('2.4.1.1','Agência e Tráfego Pago',            'saida',   '2.4.1 Marketing e Publicidade',    'agência, tráfego pago, google ads, facebook ads, meta ads, instagram ads', true),
('2.4.1.2','Jornais, Rádios e Impressos',       'saida',   '2.4.1 Marketing e Publicidade',    'jornal, rádio, impresso, panfleto, outdoor, mídia',                   true),

-- 2.4.2) Eventos e Relacionamento
('2.4.2.1','Brindes',                           'saida',   '2.4.2 Eventos e Relacionamento',   'brinde, presente, mimo, kit, lembrança',                              true),
('2.4.2.2','Congressos e Eventos',              'saida',   '2.4.2 Eventos e Relacionamento',   'congresso, evento, feira, exposição, inscrição evento',               true),

-- 2.5.1) Retiradas e Encargos Diretoria
('2.5.1.1','Pró-Labore',                        'saida',   '2.5.1 Retiradas e Encargos',       'pró-labore, pro labore, retirada sócio, distribuição lucro',          true),
('2.5.1.2','Seguro Vida Diretoria',             'saida',   '2.5.1 Retiradas e Encargos',       'seguro vida diretoria, seguro sócio, seguro diretor',                 true),
('2.5.1.3','Outras Despesas Diretoria',         'saida',   '2.5.1 Retiradas e Encargos',       'despesa diretoria, despesa sócio, despesa diretor',                   true),

-- ══════════════════════════════════════════════════════════════
-- 3) RESULTADO NÃO OPERACIONAL / INVESTIMENTOS
-- ══════════════════════════════════════════════════════════════

-- 3.1) Resultado Financeiro
('3.1.1',  'Tarifas e Taxas Bancárias',         'saida',   '3.1 Resultado Financeiro',         'tarifa bancária, taxa banco, ted, doc, pix taxa, manutenção conta',   true),
('3.1.2',  'Juros, Encargos e Empréstimos',     'saida',   '3.1 Resultado Financeiro',         'juros, empréstimo, financiamento, encargo financeiro, cheque especial', true),
('3.1.3',  'Rendimentos e Resgates',            'entrada', '3.1 Resultado Financeiro',         'rendimento, resgate, aplicação, cdb, poupança, investimento rendimento', true),

-- 3.2) Investimentos e Imobilizado
('3.2.1',  'Equipamentos e Móveis',             'saida',   '3.2 Investimentos e Imobilizado',  'equipamento, móvel, computador, impressora, notebook, televisão',     true),
('3.2.2',  'Veículos',                          'saida',   '3.2 Investimentos e Imobilizado',  'compra veículo, aquisição veículo, carro novo',                       true),
('3.2.3',  'Reformas e Novas Lojas',            'saida',   '3.2 Investimentos e Imobilizado',  'reforma, obra, construção, nova loja, ampliação',                     true),

-- 3.3) Reposição de Estoque (Compras)
('3.3.1',  'Compra de Aparelhos e Acessórios',  'saida',   '3.3 Reposição de Estoque',         'compra aparelho, estoque aparelho, nf compra, nota fiscal compra',    true),
('3.3.2',  'Compra de Peças e Próteses',        'saida',   '3.3 Reposição de Estoque',         'compra peça, compra prótese, reposição peça, estoque prótese',        true);

-- Confirmação
SELECT COUNT(*) as total_categorias FROM categorias;
