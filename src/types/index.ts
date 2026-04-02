// ============================================================
// TIPOS — Sistema Financeiro LVP
// ============================================================

export interface Loja {
  id: number
  nome: string
  ativa: boolean
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: number
  codigo: string | null
  nome: string
  tipo: 'entrada' | 'saida'
  grupo: string | null
  palavras_chave: string | null
  ativa: boolean
  created_at: string
  updated_at: string
}

export interface Transacao {
  id: number
  loja_id: number | null
  categoria_id: number | null
  data: string
  descricao: string
  valor: number
  tipo: 'credito' | 'debito'
  fit_id: string | null
  origem: 'ofx' | 'manual'
  observacao: string | null
  created_at: string
  updated_at: string
  loja?: Loja
  categoria?: Categoria
}

export interface Pagamento {
  id: number
  loja_id: number | null
  categoria_id: number | null
  descricao: string
  valor: number
  data_pagamento: string
  status: 'pago' | 'pendente' | 'cancelado'
  forma_pagamento: string | null
  observacao: string | null
  created_at: string
  updated_at: string
  loja?: Loja
  categoria?: Categoria
}

export interface Recebimento {
  id: number
  loja_id: number | null
  categoria_id: number | null
  descricao: string
  valor: number
  data_recebimento: string
  status: 'recebido' | 'pendente' | 'cancelado'
  forma_recebimento: string | null
  observacao: string | null
  created_at: string
  updated_at: string
  loja?: Loja
  categoria?: Categoria
}

export interface PagamentoFuturo {
  id: number
  loja_id: number | null
  categoria_id: number | null
  descricao: string
  valor: number
  data_vencimento: string
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado'
  recorrente: boolean
  frequencia: 'mensal' | 'quinzenal' | 'semanal' | 'anual' | null
  observacao: string | null
  created_at: string
  updated_at: string
  loja?: Loja
  categoria?: Categoria
}

export interface RecebimentoFuturo {
  id: number
  loja_id: number | null
  categoria_id: number | null
  descricao: string
  valor: number
  data_prevista: string
  status: 'pendente' | 'recebido' | 'cancelado'
  tipo_recebimento: 'cartao' | 'boleto' | 'pix' | 'dinheiro' | 'transferencia'
  parcela_atual: number
  total_parcelas: number
  numero_documento: string | null
  observacao: string | null
  created_at: string
  updated_at: string
  loja?: Loja
  categoria?: Categoria
}

// ─── Filtros ─────────────────────────────────────────────────
export interface FiltrosTransacao {
  lojaId?: number
  tipo?: 'credito' | 'debito'
  categoriaId?: number
  dataInicio?: string
  dataFim?: string
  origem?: 'ofx' | 'manual'
}

export interface FiltrosPagamento {
  lojaId?: number
  status?: 'pago' | 'pendente' | 'cancelado'
  dataInicio?: string
  dataFim?: string
}

export interface FiltrosRecebimento {
  lojaId?: number
  status?: 'recebido' | 'pendente' | 'cancelado'
  dataInicio?: string
  dataFim?: string
}

export interface FiltrosPagamentoFuturo {
  lojaId?: number
  status?: 'pendente' | 'pago' | 'vencido' | 'cancelado'
  dataInicio?: string
  dataFim?: string
}

export interface FiltrosRecebimentoFuturo {
  lojaId?: number
  status?: 'pendente' | 'recebido' | 'cancelado'
  tipo?: 'cartao' | 'boleto' | 'pix' | 'dinheiro' | 'transferencia'
  dataInicio?: string
  dataFim?: string
}

// ─── Dashboard ───────────────────────────────────────────────
export interface ResumoDashboard {
  saldoTotal: number
  mes: {
    totalCredito: number
    totalDebito: number
    resultado: number
  }
  pagamentosFuturos: {
    total: number
    count: number
    vencidos: number
  }
  recebimentosFuturos: {
    total: number
    count: number
  }
}

export interface ResumoLoja {
  loja: Loja
  totalCredito: number
  totalDebito: number
  saldo: number
}

export interface SaldoDiario {
  data: string
  credito: number
  debito: number
  saldo: number
  saldoAcumulado: number
}

// ─── OFX ─────────────────────────────────────────────────────
export interface TransacaoOFX {
  fitId: string
  data: string
  valor: number
  tipo: 'credito' | 'debito'
  descricao: string
  categoriaId?: number
  categoriaNome?: string
}
