'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'
import type {
  FiltrosTransacao, FiltrosPagamento, FiltrosRecebimento,
  FiltrosPagamentoFuturo, FiltrosRecebimentoFuturo,
} from '@/types'

// ─── LOJAS ───────────────────────────────────────────────────
export async function getLojas() {
  const { data, error } = await supabaseAdmin
    .from('lojas')
    .select('*')
    .eq('ativa', true)
    .order('nome')
  if (error) throw error
  return data ?? []
}

export async function seedDadosIniciais() {
  const { data: lojasExist } = await supabaseAdmin.from('lojas').select('id').limit(1)
  if (lojasExist && lojasExist.length > 0) return { ok: true, message: 'Já inicializado' }

  await supabaseAdmin.from('lojas').insert([
    { nome: 'Muzambinho' },
    { nome: 'Guaxupé' },
    { nome: 'Poços de Caldas' },
  ])
  revalidatePath('/')
  return { ok: true, message: 'Sistema inicializado com sucesso!' }
}

// ─── CATEGORIAS ──────────────────────────────────────────────
export async function getCategorias(tipo?: 'entrada' | 'saida') {
  let query = supabaseAdmin.from('categorias').select('*').eq('ativa', true).order('codigo')
  if (tipo) query = query.eq('tipo', tipo)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createCategoria(data: {
  codigo?: string; nome: string; tipo: 'entrada' | 'saida'; grupo?: string; palavras_chave?: string
}) {
  const { error } = await supabaseAdmin.from('categorias').insert(data)
  if (error) throw error
  revalidatePath('/categorias')
}

export async function updateCategoria(id: number, data: Partial<{
  codigo: string; nome: string; tipo: 'entrada' | 'saida'; grupo: string; palavras_chave: string; ativa: boolean
}>) {
  const { error } = await supabaseAdmin.from('categorias').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
  revalidatePath('/categorias')
}

export async function deleteCategoria(id: number) {
  const { error } = await supabaseAdmin.from('categorias').update({ ativa: false }).eq('id', id)
  if (error) throw error
  revalidatePath('/categorias')
}

// ─── TRANSAÇÕES ──────────────────────────────────────────────
export async function getTransacoes(filtros: FiltrosTransacao = {}) {
  let query = supabaseAdmin
    .from('transacoes')
    .select('*, loja:lojas(*), categoria:categorias(*)')
    .order('data', { ascending: false })
    .order('id', { ascending: false })

  if (filtros.lojaId) query = query.eq('loja_id', filtros.lojaId)
  if (filtros.tipo) query = query.eq('tipo', filtros.tipo)
  if (filtros.categoriaId) query = query.eq('categoria_id', filtros.categoriaId)
  if (filtros.origem) query = query.eq('origem', filtros.origem)
  if (filtros.dataInicio) query = query.gte('data', filtros.dataInicio)
  if (filtros.dataFim) query = query.lte('data', filtros.dataFim)

  const { data, error } = await query.limit(500)
  if (error) throw error
  return data ?? []
}

export async function createTransacao(data: {
  loja_id?: number; categoria_id?: number; data: string; descricao: string;
  valor: number; tipo: 'credito' | 'debito'; fit_id?: string; origem?: 'ofx' | 'manual'; observacao?: string
}) {
  const { error } = await supabaseAdmin.from('transacoes').insert({ ...data, origem: data.origem ?? 'manual' })
  if (error) throw error
  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
}

export async function createTransacoesLote(transacoes: Array<{
  loja_id?: number; categoria_id?: number; data: string; descricao: string;
  valor: number; tipo: 'credito' | 'debito'; fit_id?: string; origem: 'ofx' | 'manual'
}>) {
  const { error } = await supabaseAdmin.from('transacoes').insert(transacoes)
  if (error) throw error
  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
}

export async function updateTransacao(id: number, data: Partial<{
  loja_id: number; categoria_id: number; data: string; descricao: string;
  valor: number; tipo: 'credito' | 'debito'; observacao: string
}>) {
  const { error } = await supabaseAdmin.from('transacoes').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
}

export async function deleteTransacao(id: number) {
  const { error } = await supabaseAdmin.from('transacoes').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
}

// ─── PAGAMENTOS ──────────────────────────────────────────────
export async function getPagamentos(filtros: FiltrosPagamento = {}) {
  let query = supabaseAdmin
    .from('pagamentos')
    .select('*, loja:lojas(*), categoria:categorias(*)')
    .order('data_pagamento', { ascending: false })

  if (filtros.lojaId) query = query.eq('loja_id', filtros.lojaId)
  if (filtros.status) query = query.eq('status', filtros.status)
  if (filtros.dataInicio) query = query.gte('data_pagamento', filtros.dataInicio)
  if (filtros.dataFim) query = query.lte('data_pagamento', filtros.dataFim)

  const { data, error } = await query.limit(500)
  if (error) throw error
  return data ?? []
}

export async function createPagamento(data: {
  loja_id?: number; categoria_id?: number; descricao: string; numero_nf?: string; valor: number;
  data_pagamento: string; status?: 'pago' | 'pendente' | 'cancelado'; forma_pagamento?: string; observacao?: string;
  _ignorar_dup?: boolean
}) {
  // ─── Regra anti-duplicidade ───────────────────────────────────────────────
  // Boleto COM número de NF: bloqueia se já existe mesmo fornecedor + NF
  // Boleto SEM número de NF: bloqueia se já existe mesmo fornecedor + valor + data
  // Outros pagamentos: bloqueia se já existe mesmo fornecedor + valor + data
  // Se o usuário confirmou explicitamente que quer salvar mesmo com duplicidade, pula a verificação
  if (!data._ignorar_dup) {
  const isBoleto = data.forma_pagamento?.toLowerCase() === 'boleto'
  const nfNormalizada = data.numero_nf?.trim().toUpperCase()

  let dupQuery = supabaseAdmin
    .from('pagamentos')
    .select('id, descricao, numero_nf, valor, data_pagamento, forma_pagamento')
    .ilike('descricao', data.descricao.trim())
    .neq('status', 'cancelado')

  if (data.loja_id) dupQuery = dupQuery.eq('loja_id', data.loja_id)

  if (isBoleto && nfNormalizada) {
    // Boleto com NF: chave = fornecedor + NF (ignora data/valor — pode ser parcela diferente)
    dupQuery = dupQuery.ilike('numero_nf', nfNormalizada)
  } else {
    // Sem NF ou não é boleto: chave = fornecedor + valor + data
    dupQuery = dupQuery
      .eq('valor', data.valor)
      .eq('data_pagamento', data.data_pagamento)
  }

  const { data: existentes } = await dupQuery.limit(1)
  if (existentes && existentes.length > 0) {
    const dup = existentes[0]
    const msg = isBoleto && nfNormalizada
      ? `Já existe um pagamento com a NF "${nfNormalizada}" para "${dup.descricao}".`
      : `Já existe um pagamento de R$ ${Number(dup.valor).toFixed(2).replace('.', ',')} para "${dup.descricao}" na data ${dup.data_pagamento}.`
    throw new Error(`DUPLICADO: ${msg}`)
  }
  // ─────────────────────────────────────────────────────────────────────────
  } // fim do bloco de verificação de duplicidade

  // Remove o campo interno antes de inserir
  const { _ignorar_dup: _, ...dadosLimpos } = data
  const { error } = await supabaseAdmin.from('pagamentos').insert(dadosLimpos)
  if (error) throw error
  revalidatePath('/pagamentos')
  revalidatePath('/dashboard')
}

export async function updatePagamento(id: number, data: Partial<{
  loja_id: number; categoria_id: number; descricao: string; numero_nf: string; valor: number;
  data_pagamento: string; status: 'pago' | 'pendente' | 'cancelado'; forma_pagamento: string; observacao: string
}>) {
  const { error } = await supabaseAdmin.from('pagamentos').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
  revalidatePath('/pagamentos')
}

export async function deletePagamento(id: number) {
  const { error } = await supabaseAdmin.from('pagamentos').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/pagamentos')
}

// ─── RECEBIMENTOS ────────────────────────────────────────────
export async function getRecebimentos(filtros: FiltrosRecebimento = {}) {
  let query = supabaseAdmin
    .from('recebimentos')
    .select('*, loja:lojas(*), categoria:categorias(*)')
    .order('data_recebimento', { ascending: false })

  if (filtros.lojaId) query = query.eq('loja_id', filtros.lojaId)
  if (filtros.status) query = query.eq('status', filtros.status)
  if (filtros.dataInicio) query = query.gte('data_recebimento', filtros.dataInicio)
  if (filtros.dataFim) query = query.lte('data_recebimento', filtros.dataFim)

  const { data, error } = await query.limit(500)
  if (error) throw error
  return data ?? []
}

export async function createRecebimento(data: {
  loja_id?: number; categoria_id?: number; descricao: string; valor: number;
  data_recebimento: string; status?: 'recebido' | 'pendente' | 'cancelado'; forma_recebimento?: string; observacao?: string
}) {
  const { error } = await supabaseAdmin.from('recebimentos').insert(data)
  if (error) throw error
  revalidatePath('/recebimentos')
  revalidatePath('/dashboard')
}

export async function updateRecebimento(id: number, data: Partial<{
  loja_id: number; categoria_id: number; descricao: string; valor: number;
  data_recebimento: string; status: 'recebido' | 'pendente' | 'cancelado'; forma_recebimento: string; observacao: string
}>) {
  const { error } = await supabaseAdmin.from('recebimentos').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
  revalidatePath('/recebimentos')
}

export async function deleteRecebimento(id: number) {
  const { error } = await supabaseAdmin.from('recebimentos').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/recebimentos')
}

// ─── PAGAMENTOS FUTUROS ──────────────────────────────────────
export async function getPagamentosFuturos(filtros: FiltrosPagamentoFuturo = {}) {
  let query = supabaseAdmin
    .from('pagamentos_futuros')
    .select('*, loja:lojas(*), categoria:categorias(*)')
    .order('data_vencimento', { ascending: true })

  if (filtros.lojaId) query = query.eq('loja_id', filtros.lojaId)
  if (filtros.status) query = query.eq('status', filtros.status)
  if (filtros.dataInicio) query = query.gte('data_vencimento', filtros.dataInicio)
  if (filtros.dataFim) query = query.lte('data_vencimento', filtros.dataFim)

  const { data, error } = await query.limit(500)
  if (error) throw error
  return data ?? []
}

export async function createPagamentoFuturo(data: {
  loja_id?: number; categoria_id?: number; descricao: string; valor: number;
  data_vencimento: string; status?: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  recorrente?: boolean; frequencia?: 'mensal' | 'quinzenal' | 'semanal' | 'anual'; observacao?: string
}) {
  const { error } = await supabaseAdmin.from('pagamentos_futuros').insert(data)
  if (error) throw error
  revalidatePath('/pagamentos-futuros')
  revalidatePath('/dashboard')
}

export async function updatePagamentoFuturo(id: number, data: Partial<{
  loja_id: number; categoria_id: number; descricao: string; valor: number;
  data_vencimento: string; status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  recorrente: boolean; frequencia: 'mensal' | 'quinzenal' | 'semanal' | 'anual'; observacao: string
}>) {
  const { error } = await supabaseAdmin.from('pagamentos_futuros').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
  revalidatePath('/pagamentos-futuros')
  revalidatePath('/dashboard')
}

export async function deletePagamentoFuturo(id: number) {
  const { error } = await supabaseAdmin.from('pagamentos_futuros').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/pagamentos-futuros')
}

// ─── RECEBIMENTOS FUTUROS ────────────────────────────────────
export async function getRecebimentosFuturos(filtros: FiltrosRecebimentoFuturo = {}) {
  let query = supabaseAdmin
    .from('recebimentos_futuros')
    .select('*, loja:lojas(*), categoria:categorias(*)')
    .order('data_prevista', { ascending: true })

  if (filtros.lojaId) query = query.eq('loja_id', filtros.lojaId)
  if (filtros.status) query = query.eq('status', filtros.status)
  if (filtros.tipo) query = query.eq('tipo_recebimento', filtros.tipo)
  if (filtros.dataInicio) query = query.gte('data_prevista', filtros.dataInicio)
  if (filtros.dataFim) query = query.lte('data_prevista', filtros.dataFim)

  const { data, error } = await query.limit(500)
  if (error) throw error
  return data ?? []
}

export async function createRecebimentoFuturo(data: {
  loja_id?: number; categoria_id?: number; descricao: string; valor: number;
  data_prevista: string; status?: 'pendente' | 'recebido' | 'cancelado';
  tipo_recebimento?: 'cartao' | 'boleto' | 'pix' | 'dinheiro' | 'transferencia';
  parcela_atual?: number; total_parcelas?: number; numero_documento?: string; observacao?: string
}) {
  const { error } = await supabaseAdmin.from('recebimentos_futuros').insert(data)
  if (error) throw error
  revalidatePath('/recebimentos-futuros')
  revalidatePath('/dashboard')
}

export async function updateRecebimentoFuturo(id: number, data: Partial<{
  loja_id: number; categoria_id: number; descricao: string; valor: number;
  data_prevista: string; status: 'pendente' | 'recebido' | 'cancelado';
  tipo_recebimento: 'cartao' | 'boleto' | 'pix' | 'dinheiro' | 'transferencia';
  parcela_atual: number; total_parcelas: number; numero_documento: string; observacao: string
}>) {
  const { error } = await supabaseAdmin.from('recebimentos_futuros').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
  revalidatePath('/recebimentos-futuros')
  revalidatePath('/dashboard')
}

export async function deleteRecebimentoFuturo(id: number) {
  const { error } = await supabaseAdmin.from('recebimentos_futuros').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/recebimentos-futuros')
}

// ─── DASHBOARD ───────────────────────────────────────────────
export async function getDashboardResumo(lojaId?: number) {
  const hoje = new Date().toISOString().split('T')[0]
  const inicioMes = hoje.substring(0, 7) + '-01'

  // Saldo total de transações
  let qSaldo = supabaseAdmin.from('transacoes').select('valor, tipo')
  if (lojaId) qSaldo = qSaldo.eq('loja_id', lojaId)
  const { data: transAll } = await qSaldo
  const saldoTotal = (transAll ?? []).reduce((acc, t) => {
    return acc + (t.tipo === 'credito' ? Number(t.valor) : -Number(t.valor))
  }, 0)

  // Resumo do mês
  let qMes = supabaseAdmin.from('transacoes').select('valor, tipo').gte('data', inicioMes).lte('data', hoje)
  if (lojaId) qMes = qMes.eq('loja_id', lojaId)
  const { data: transMes } = await qMes
  const totalCredito = (transMes ?? []).filter(t => t.tipo === 'credito').reduce((a, t) => a + Number(t.valor), 0)
  const totalDebito = (transMes ?? []).filter(t => t.tipo === 'debito').reduce((a, t) => a + Number(t.valor), 0)

  // Pagamentos futuros pendentes
  let qPagFut = supabaseAdmin.from('pagamentos_futuros').select('valor, data_vencimento').eq('status', 'pendente')
  if (lojaId) qPagFut = qPagFut.eq('loja_id', lojaId)
  const { data: pagFut } = await qPagFut
  const totalPagFut = (pagFut ?? []).reduce((a, p) => a + Number(p.valor), 0)
  const vencidos = (pagFut ?? []).filter(p => p.data_vencimento < hoje).length

  // Recebimentos futuros pendentes
  let qRecFut = supabaseAdmin.from('recebimentos_futuros').select('valor').eq('status', 'pendente')
  if (lojaId) qRecFut = qRecFut.eq('loja_id', lojaId)
  const { data: recFut } = await qRecFut
  const totalRecFut = (recFut ?? []).reduce((a, r) => a + Number(r.valor), 0)

  return {
    saldoTotal,
    mes: { totalCredito, totalDebito, resultado: totalCredito - totalDebito },
    pagamentosFuturos: { total: totalPagFut, count: (pagFut ?? []).length, vencidos },
    recebimentosFuturos: { total: totalRecFut, count: (recFut ?? []).length },
  }
}

export async function getResumoPorLoja() {
  const hoje = new Date().toISOString().split('T')[0]
  const inicioMes = hoje.substring(0, 7) + '-01'

  const { data: lojas } = await supabaseAdmin.from('lojas').select('*').eq('ativa', true).order('nome')
  if (!lojas) return []

  const resultados = await Promise.all(
    lojas.map(async (loja) => {
      const { data: trans } = await supabaseAdmin
        .from('transacoes')
        .select('valor, tipo')
        .eq('loja_id', loja.id)
        .gte('data', inicioMes)
        .lte('data', hoje)

      const totalCredito = (trans ?? []).filter(t => t.tipo === 'credito').reduce((a, t) => a + Number(t.valor), 0)
      const totalDebito = (trans ?? []).filter(t => t.tipo === 'debito').reduce((a, t) => a + Number(t.valor), 0)

      return { loja, totalCredito, totalDebito, saldo: totalCredito - totalDebito }
    })
  )

  return resultados
}

export async function getSaldoDiario(lojaId?: number, dias = 30) {
  const hoje = new Date()
  const inicio = new Date(hoje)
  inicio.setDate(inicio.getDate() - dias)
  const inicioStr = inicio.toISOString().split('T')[0]
  const hojeStr = hoje.toISOString().split('T')[0]

  let query = supabaseAdmin
    .from('transacoes')
    .select('data, valor, tipo')
    .gte('data', inicioStr)
    .lte('data', hojeStr)
    .order('data')

  if (lojaId) query = query.eq('loja_id', lojaId)
  const { data: trans } = await query

  // Agrupar por data
  const porData: Record<string, { credito: number; debito: number }> = {}
  for (const t of trans ?? []) {
    if (!porData[t.data]) porData[t.data] = { credito: 0, debito: 0 }
    if (t.tipo === 'credito') porData[t.data].credito += Number(t.valor)
    else porData[t.data].debito += Number(t.valor)
  }

  // Gerar array com saldo acumulado
  let saldoAcumulado = 0
  return Object.entries(porData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, { credito, debito }]) => {
      saldoAcumulado += credito - debito
      return { data, credito, debito, saldo: credito - debito, saldoAcumulado }
    })
}
