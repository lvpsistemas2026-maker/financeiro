-- ============================================================
-- SISTEMA FINANCEIRO LVP — Schema Supabase
-- ============================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── LOJAS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lojas (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(100) NOT NULL,
  ativa       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CATEGORIAS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
  id            SERIAL PRIMARY KEY,
  codigo        VARCHAR(20),
  nome          VARCHAR(150) NOT NULL,
  tipo          VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  grupo         VARCHAR(100),
  palavras_chave TEXT,
  ativa         BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TRANSAÇÕES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transacoes (
  id            SERIAL PRIMARY KEY,
  loja_id       INTEGER REFERENCES lojas(id) ON DELETE SET NULL,
  categoria_id  INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  data          DATE NOT NULL,
  descricao     TEXT NOT NULL,
  valor         DECIMAL(15,2) NOT NULL,
  tipo          VARCHAR(10) NOT NULL CHECK (tipo IN ('credito', 'debito')),
  fit_id        VARCHAR(100),
  origem        VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (origem IN ('ofx', 'manual')),
  observacao    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PAGAMENTOS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pagamentos (
  id              SERIAL PRIMARY KEY,
  loja_id         INTEGER REFERENCES lojas(id) ON DELETE SET NULL,
  categoria_id    INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  descricao       TEXT NOT NULL,
  valor           DECIMAL(15,2) NOT NULL,
  data_pagamento  DATE NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pago' CHECK (status IN ('pago', 'pendente', 'cancelado')),
  forma_pagamento VARCHAR(30),
  observacao      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RECEBIMENTOS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recebimentos (
  id                  SERIAL PRIMARY KEY,
  loja_id             INTEGER REFERENCES lojas(id) ON DELETE SET NULL,
  categoria_id        INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  descricao           TEXT NOT NULL,
  valor               DECIMAL(15,2) NOT NULL,
  data_recebimento    DATE NOT NULL,
  status              VARCHAR(20) NOT NULL DEFAULT 'recebido' CHECK (status IN ('recebido', 'pendente', 'cancelado')),
  forma_recebimento   VARCHAR(30),
  observacao          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PAGAMENTOS FUTUROS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS pagamentos_futuros (
  id                SERIAL PRIMARY KEY,
  loja_id           INTEGER REFERENCES lojas(id) ON DELETE SET NULL,
  categoria_id      INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  descricao         TEXT NOT NULL,
  valor             DECIMAL(15,2) NOT NULL,
  data_vencimento   DATE NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
  recorrente        BOOLEAN NOT NULL DEFAULT false,
  frequencia        VARCHAR(20) CHECK (frequencia IN ('mensal', 'quinzenal', 'semanal', 'anual')),
  observacao        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RECEBIMENTOS FUTUROS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS recebimentos_futuros (
  id                    SERIAL PRIMARY KEY,
  loja_id               INTEGER REFERENCES lojas(id) ON DELETE SET NULL,
  categoria_id          INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  descricao             TEXT NOT NULL,
  valor                 DECIMAL(15,2) NOT NULL,
  data_prevista         DATE NOT NULL,
  status                VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'recebido', 'cancelado')),
  tipo_recebimento      VARCHAR(20) NOT NULL DEFAULT 'pix' CHECK (tipo_recebimento IN ('cartao', 'boleto', 'pix', 'dinheiro', 'transferencia')),
  parcela_atual         INTEGER DEFAULT 1,
  total_parcelas        INTEGER DEFAULT 1,
  numero_documento      VARCHAR(100),
  observacao            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ÍNDICES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data);
CREATE INDEX IF NOT EXISTS idx_transacoes_loja_id ON transacoes(loja_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON transacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_pagamentos_loja_id ON pagamentos(loja_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data ON pagamentos(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_recebimentos_loja_id ON recebimentos(loja_id);
CREATE INDEX IF NOT EXISTS idx_recebimentos_data ON recebimentos(data_recebimento);
CREATE INDEX IF NOT EXISTS idx_pag_futuros_status ON pagamentos_futuros(status);
CREATE INDEX IF NOT EXISTS idx_pag_futuros_vencimento ON pagamentos_futuros(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_rec_futuros_status ON recebimentos_futuros(status);
CREATE INDEX IF NOT EXISTS idx_rec_futuros_prevista ON recebimentos_futuros(data_prevista);

-- ─── RLS (Row Level Security) ────────────────────────────────
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recebimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos_futuros ENABLE ROW LEVEL SECURITY;
ALTER TABLE recebimentos_futuros ENABLE ROW LEVEL SECURITY;

-- Políticas: acesso total para usuários autenticados
CREATE POLICY "Authenticated full access" ON lojas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON categorias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON transacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON pagamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON recebimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON pagamentos_futuros FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON recebimentos_futuros FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas: acesso de leitura para anon (service role bypassa RLS)
CREATE POLICY "Anon read" ON lojas FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read" ON categorias FOR SELECT TO anon USING (true);
