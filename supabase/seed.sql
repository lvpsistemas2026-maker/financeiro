-- ============================================================
-- SEED — Lojas e Categorias do Plano LVP
-- ============================================================

-- Lojas
INSERT INTO lojas (nome) VALUES
  ('Muzambinho'),
  ('Guaxupé'),
  ('Poços de Caldas')
ON CONFLICT DO NOTHING;

-- ─── CATEGORIAS DE RECEITAS (Entradas) ───────────────────────
INSERT INTO categorias (codigo, nome, tipo, grupo) VALUES
-- 300 - Receitas Operacionais
('300', 'Receitas Operacionais', 'entrada', 'Receitas Operacionais'),
('301', 'Vendas à Vista', 'entrada', 'Receitas Operacionais'),
('302', 'Vendas a Prazo', 'entrada', 'Receitas Operacionais'),
('303', 'Vendas no Cartão de Crédito', 'entrada', 'Receitas Operacionais'),
('304', 'Vendas no Cartão de Débito', 'entrada', 'Receitas Operacionais'),
('305', 'Vendas via PIX', 'entrada', 'Receitas Operacionais'),
('306', 'Vendas via Boleto', 'entrada', 'Receitas Operacionais'),
('307', 'Vendas via Transferência', 'entrada', 'Receitas Operacionais'),
('308', 'Devoluções de Fornecedores', 'entrada', 'Receitas Operacionais'),
('309', 'Descontos Obtidos', 'entrada', 'Receitas Operacionais'),
('310', 'Bonificações Recebidas', 'entrada', 'Receitas Operacionais'),
-- 311 - Receitas Financeiras
('311', 'Receitas Financeiras', 'entrada', 'Receitas Financeiras'),
('311.1', 'Juros Recebidos', 'entrada', 'Receitas Financeiras'),
('311.2', 'Rendimentos de Aplicações', 'entrada', 'Receitas Financeiras'),
('311.3', 'Variação Cambial Ativa', 'entrada', 'Receitas Financeiras'),
-- 312 - Outras Receitas
('312', 'Outras Receitas', 'entrada', 'Outras Receitas'),
('312.1', 'Receitas Eventuais', 'entrada', 'Outras Receitas'),
('312.2', 'Recuperação de Despesas', 'entrada', 'Outras Receitas'),
('312.3', 'Receitas de Aluguéis', 'entrada', 'Outras Receitas'),
('312.4', 'Indenizações Recebidas', 'entrada', 'Outras Receitas'),
('312.5', 'Receitas Diversas', 'entrada', 'Outras Receitas')
ON CONFLICT DO NOTHING;

-- ─── CATEGORIAS DE DESPESAS (Saídas) ─────────────────────────
INSERT INTO categorias (codigo, nome, tipo, grupo) VALUES
-- 400 - Custo das Mercadorias
('400', 'Custo das Mercadorias Vendidas', 'saida', 'Custo das Mercadorias'),
('401', 'Compras de Mercadorias', 'saida', 'Custo das Mercadorias'),
('402', 'Fretes sobre Compras', 'saida', 'Custo das Mercadorias'),
('403', 'Devoluções de Compras', 'saida', 'Custo das Mercadorias'),
('404', 'Descontos Concedidos', 'saida', 'Custo das Mercadorias'),
-- 410 - Despesas com Pessoal
('410', 'Despesas com Pessoal', 'saida', 'Despesas com Pessoal'),
('411', 'Salários e Ordenados', 'saida', 'Despesas com Pessoal'),
('412', 'Pró-Labore', 'saida', 'Despesas com Pessoal'),
('413', 'FGTS', 'saida', 'Despesas com Pessoal'),
('414', 'INSS Patronal', 'saida', 'Despesas com Pessoal'),
('415', 'Férias', 'saida', 'Despesas com Pessoal'),
('416', '13º Salário', 'saida', 'Despesas com Pessoal'),
('417', 'Vale Transporte', 'saida', 'Despesas com Pessoal'),
('418', 'Vale Alimentação / Refeição', 'saida', 'Despesas com Pessoal'),
('419', 'Plano de Saúde', 'saida', 'Despesas com Pessoal'),
('420', 'Rescisões Trabalhistas', 'saida', 'Despesas com Pessoal'),
('421', 'Uniformes e EPIs', 'saida', 'Despesas com Pessoal'),
('422', 'Treinamentos e Capacitações', 'saida', 'Despesas com Pessoal'),
('423', 'Comissões de Vendas', 'saida', 'Despesas com Pessoal'),
-- 430 - Despesas Tributárias
('430', 'Despesas Tributárias', 'saida', 'Despesas Tributárias'),
('431', 'Simples Nacional / DAS', 'saida', 'Despesas Tributárias'),
('432', 'ICMS', 'saida', 'Despesas Tributárias'),
('433', 'PIS', 'saida', 'Despesas Tributárias'),
('434', 'COFINS', 'saida', 'Despesas Tributárias'),
('435', 'ISS', 'saida', 'Despesas Tributárias'),
('436', 'IRPJ', 'saida', 'Despesas Tributárias'),
('437', 'CSLL', 'saida', 'Despesas Tributárias'),
('438', 'IOF', 'saida', 'Despesas Tributárias'),
('439', 'IPTU', 'saida', 'Despesas Tributárias'),
('440', 'IPVA', 'saida', 'Despesas Tributárias'),
('441', 'Taxas e Licenças', 'saida', 'Despesas Tributárias'),
-- 450 - Despesas Operacionais
('450', 'Despesas Operacionais', 'saida', 'Despesas Operacionais'),
('451', 'Aluguel', 'saida', 'Despesas Operacionais'),
('452', 'Condomínio', 'saida', 'Despesas Operacionais'),
('453', 'Energia Elétrica', 'saida', 'Despesas Operacionais'),
('454', 'Água e Esgoto', 'saida', 'Despesas Operacionais'),
('455', 'Telefone e Internet', 'saida', 'Despesas Operacionais'),
('456', 'Materiais de Limpeza', 'saida', 'Despesas Operacionais'),
('457', 'Materiais de Escritório', 'saida', 'Despesas Operacionais'),
('458', 'Embalagens', 'saida', 'Despesas Operacionais'),
('459', 'Manutenção e Reparos', 'saida', 'Despesas Operacionais'),
('460', 'Seguros', 'saida', 'Despesas Operacionais'),
('461', 'Vigilância e Segurança', 'saida', 'Despesas Operacionais'),
('462', 'Limpeza e Conservação', 'saida', 'Despesas Operacionais'),
('463', 'Combustível e Lubrificantes', 'saida', 'Despesas Operacionais'),
('464', 'Fretes e Entregas', 'saida', 'Despesas Operacionais'),
('465', 'Estacionamento e Pedágios', 'saida', 'Despesas Operacionais'),
-- 470 - Despesas Administrativas
('470', 'Despesas Administrativas', 'saida', 'Despesas Administrativas'),
('471', 'Honorários Contábeis', 'saida', 'Despesas Administrativas'),
('472', 'Honorários Advocatícios', 'saida', 'Despesas Administrativas'),
('473', 'Consultoria e Assessoria', 'saida', 'Despesas Administrativas'),
('474', 'Serviços de TI / Software', 'saida', 'Despesas Administrativas'),
('475', 'Assinaturas e Licenças de Software', 'saida', 'Despesas Administrativas'),
('476', 'Correios e Malotes', 'saida', 'Despesas Administrativas'),
('477', 'Cartório e Reconhecimentos', 'saida', 'Despesas Administrativas'),
('478', 'Publicidade e Marketing', 'saida', 'Despesas Administrativas'),
('479', 'Brindes e Amostras', 'saida', 'Despesas Administrativas'),
('480', 'Viagens e Hospedagens', 'saida', 'Despesas Administrativas'),
('481', 'Alimentação e Refeições (Adm)', 'saida', 'Despesas Administrativas'),
('482', 'Representação Comercial', 'saida', 'Despesas Administrativas'),
-- 490 - Despesas Financeiras
('490', 'Despesas Financeiras', 'saida', 'Despesas Financeiras'),
('491', 'Juros Pagos', 'saida', 'Despesas Financeiras'),
('492', 'Tarifas Bancárias', 'saida', 'Despesas Financeiras'),
('493', 'IOF sobre Operações', 'saida', 'Despesas Financeiras'),
('494', 'Multas e Juros de Mora', 'saida', 'Despesas Financeiras'),
('495', 'Descontos Concedidos (Fin)', 'saida', 'Despesas Financeiras'),
('496', 'Taxas de Cartão de Crédito', 'saida', 'Despesas Financeiras'),
('497', 'Taxas de Boleto', 'saida', 'Despesas Financeiras'),
('498', 'Taxas de PIX', 'saida', 'Despesas Financeiras'),
('499', 'Variação Cambial Passiva', 'saida', 'Despesas Financeiras'),
-- 500 - Investimentos e Imobilizado
('500', 'Investimentos e Imobilizado', 'saida', 'Investimentos'),
('501', 'Aquisição de Equipamentos', 'saida', 'Investimentos'),
('502', 'Aquisição de Móveis e Utensílios', 'saida', 'Investimentos'),
('503', 'Aquisição de Veículos', 'saida', 'Investimentos'),
('504', 'Reformas e Benfeitorias', 'saida', 'Investimentos'),
('505', 'Depreciação', 'saida', 'Investimentos'),
-- 510 - Outras Despesas
('510', 'Outras Despesas', 'saida', 'Outras Despesas'),
('511', 'Despesas Eventuais', 'saida', 'Outras Despesas'),
('511.1', 'Doações e Contribuições', 'saida', 'Outras Despesas'),
('511.2', 'Multas Diversas', 'saida', 'Outras Despesas'),
('511.3', 'Perdas e Sinistros', 'saida', 'Outras Despesas'),
('511.4', 'Despesas Diversas', 'saida', 'Outras Despesas')
ON CONFLICT DO NOTHING;
