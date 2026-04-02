'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2, Edit2, Filter, ChevronDown, X, Loader2, TrendingDown, CheckCircle, Eye, AlertTriangle } from 'lucide-react'
import { formatCurrency, formatDate, getMesAtual } from '@/lib/utils'
import { createPagamento, updatePagamento, deletePagamento } from '@/actions'
import type { Loja, Categoria } from '@/types'

interface Props { pagamentos: any[]; lojas: Loja[]; categorias: Categoria[] }

const STATUS_OPTS = [
  { value: 'pendente', label: 'Pendente', cls: 'badge-pendente' },
  { value: 'pago', label: 'Pago', cls: 'badge-pago' },
  { value: 'cancelado', label: 'Cancelado', cls: 'badge-cancelado' },
]

const FORMAS = ['Dinheiro', 'PIX', 'Transferência', 'Boleto', 'Cartão de Débito', 'Cartão de Crédito', 'Cheque']

export default function PagamentosClient({ pagamentos: initial, lojas, categorias }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const mes = getMesAtual()

  const [filtroLoja, setFiltroLoja] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroNF, setFiltroNF] = useState('')
  const [filtroInicio, setFiltroInicio] = useState(mes.inicio)
  const [filtroFim, setFiltroFim] = useState(mes.fim)
  const [showModal, setShowModal] = useState(false)
  const [showView, setShowView] = useState(false)
  const [viewItem, setViewItem] = useState<any | null>(null)
  const [editando, setEditando] = useState<any | null>(null)
  const [dupAviso, setDupAviso] = useState<string | null>(null)   // mensagem de duplicidade
  const [forcarSalvar, setForcarSalvar] = useState(false)          // flag para forçar mesmo duplicado
  const [form, setForm] = useState({
    loja_id: '', categoria_id: '', descricao: '', numero_nf: '', valor: '',
    data_pagamento: new Date().toISOString().split('T')[0],
    status: 'pendente' as string, forma_pagamento: '', observacao: ''
  })

  const filtrados = useMemo(() => initial.filter(p => {
    if (filtroLoja && String(p.loja_id) !== filtroLoja) return false
    if (filtroStatus && p.status !== filtroStatus) return false
    if (filtroInicio && p.data_pagamento < filtroInicio) return false
    if (filtroFim && p.data_pagamento > filtroFim) return false
    if (filtroNF && !(p.numero_nf ?? '').toLowerCase().includes(filtroNF.toLowerCase())) return false
    return true
  }), [initial, filtroLoja, filtroStatus, filtroInicio, filtroFim, filtroNF])

  const totalPago = filtrados.filter(p => p.status === 'pago').reduce((a: number, p: any) => a + Number(p.valor), 0)
  const totalPendente = filtrados.filter(p => p.status === 'pendente').reduce((a: number, p: any) => a + Number(p.valor), 0)

  const openNovo = () => {
    setEditando(null)
    setDupAviso(null)
    setForcarSalvar(false)
    setForm({ loja_id: '', categoria_id: '', descricao: '', numero_nf: '', valor: '', data_pagamento: new Date().toISOString().split('T')[0], status: 'pendente', forma_pagamento: '', observacao: '' })
    setShowModal(true)
  }

  const openEditar = (p: any) => {
    setEditando(p)
    setDupAviso(null)
    setForcarSalvar(false)
    setForm({
      loja_id: String(p.loja_id ?? ''), categoria_id: String(p.categoria_id ?? ''),
      descricao: p.descricao, numero_nf: p.numero_nf ?? '', valor: String(p.valor),
      data_pagamento: p.data_pagamento, status: p.status,
      forma_pagamento: p.forma_pagamento ?? '', observacao: p.observacao ?? ''
    })
    setShowModal(true)
  }

  const openVisualizar = (p: any) => {
    setViewItem(p)
    setShowView(true)
  }

  // Limpa aviso de duplicidade quando o usuário altera campos relevantes
  const handleFormChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    if (['descricao', 'numero_nf', 'valor', 'data_pagamento', 'forma_pagamento', 'loja_id'].includes(field)) {
      setDupAviso(null)
      setForcarSalvar(false)
    }
  }

  const handleSalvar = (ignorarDup = false) => {
    if (!form.descricao || !form.valor || !form.data_pagamento) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    startTransition(async () => {
      try {
        const data = {
          loja_id: form.loja_id ? Number(form.loja_id) : undefined,
          categoria_id: form.categoria_id ? Number(form.categoria_id) : undefined,
          descricao: form.descricao,
          numero_nf: form.numero_nf || undefined,
          valor: parseFloat(form.valor),
          data_pagamento: form.data_pagamento,
          status: form.status as any,
          forma_pagamento: form.forma_pagamento || undefined,
          observacao: form.observacao || undefined,
          _ignorar_dup: ignorarDup,   // flag passada para a action
        }
        if (editando) {
          await updatePagamento(editando.id, data)
          toast.success('Pagamento atualizado!')
        } else {
          await createPagamento(data as any)
          toast.success('Pagamento registrado com sucesso!')
        }
        setShowModal(false)
        setDupAviso(null)
        setForcarSalvar(false)
        router.refresh()
      } catch (err: any) {
        const msg: string = err?.message ?? ''
        if (msg.startsWith('DUPLICADO:')) {
          // Exibe aviso inline no modal em vez de fechar
          setDupAviso(msg.replace('DUPLICADO: ', ''))
          setForcarSalvar(true)
        } else {
          toast.error('Erro ao salvar pagamento', { description: msg })
        }
      }
    })
  }

  const handleDeletar = (id: number) => {
    if (!confirm('Confirma exclusão?')) return
    startTransition(async () => {
      try { await deletePagamento(id); toast.success('Excluído!'); router.refresh() }
      catch { toast.error('Erro ao excluir') }
    })
  }

  const handleMarcarPago = (p: any) => {
    startTransition(async () => {
      try { await updatePagamento(p.id, { status: 'pago' }); toast.success('Marcado como pago!'); router.refresh() }
      catch { toast.error('Erro') }
    })
  }

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pagamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de saídas por loja</p>
        </div>
        <button onClick={openNovo} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Novo Pagamento
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3"><Filter className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Filtros</span></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Sel value={filtroLoja} onChange={setFiltroLoja} placeholder="Todas as lojas">{lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}</Sel>
          <Sel value={filtroStatus} onChange={setFiltroStatus} placeholder="Todos os status">{STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</Sel>
          <input type="date" value={filtroInicio} onChange={e => setFiltroInicio(e.target.value)} className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="date" value={filtroFim} onChange={e => setFiltroFim(e.target.value)} className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="mt-3">
          <input
            type="text"
            value={filtroNF}
            onChange={e => setFiltroNF(e.target.value)}
            placeholder="Buscar por Nº NF (ex: 661184-2, NF 646690...)" 
            className="w-full md:w-80 bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono placeholder:font-sans focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Totais */}
      <div className="flex flex-wrap gap-3">
        <Chip label="Total Pago" value={formatCurrency(totalPago)} color="text-emerald-400" />
        <Chip label="Total Pendente" value={formatCurrency(totalPendente)} color="text-amber-400" />
        <Chip label="Registros" value={String(filtrados.length)} color="text-muted-foreground" />
      </div>

      {/* Tabela */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {['DATA VENCIMENTO', 'DESCRIÇÃO', 'Nº NF', 'LOJA', 'CATEGORIA', 'FORMA', 'VALOR', 'STATUS', 'AÇÕES'].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-muted-foreground ${h === 'VALOR' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                  <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>Nenhum pagamento encontrado</p>
                </td></tr>
              ) : filtrados.map((p: any) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{formatDate(p.data_pagamento)}</td>
                  <td className="px-4 py-2.5 text-foreground max-w-xs"><span className="truncate block">{p.descricao}</span></td>
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap font-mono text-xs">{p.numero_nf ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{p.loja?.nome ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.categoria?.nome ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.forma_pagamento ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-red-400 whitespace-nowrap">{formatCurrency(Number(p.valor))}</td>
                  <td className="px-4 py-2.5">
                    <span className={`badge-${p.status}`}>{STATUS_OPTS.find(s => s.value === p.status)?.label ?? p.status}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openVisualizar(p)} title="Visualizar" className="p-1.5 rounded hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {p.status === 'pendente' && (
                        <button onClick={() => handleMarcarPago(p)} title="Marcar como pago" className="p-1.5 rounded hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => openEditar(p)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeletar(p.id)} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Visualizar */}
      {showView && viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowView(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Detalhes do Pagamento</h2>
              <button onClick={() => setShowView(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <Row label="Descrição" value={viewItem.descricao} />
              {viewItem.numero_nf && <Row label="Número da NF" value={viewItem.numero_nf} mono />}
              <Row label="Valor" value={formatCurrency(Number(viewItem.valor))} highlight />
              <Row label="Data de Vencimento" value={formatDate(viewItem.data_pagamento)} />
              {viewItem.status === 'pago' && viewItem.pago_em && (
                <Row label="Pago em" value={new Date(viewItem.pago_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })} highlight />
              )}
              <Row label="Loja" value={viewItem.loja?.nome ?? '—'} />
              <Row label="Categoria" value={viewItem.categoria?.nome ?? '—'} />
              <Row label="Forma de Pagamento" value={viewItem.forma_pagamento ?? '—'} />
              <Row label="Status" value={STATUS_OPTS.find(s => s.value === viewItem.status)?.label ?? viewItem.status} />
              {viewItem.observacao && <Row label="Observação" value={viewItem.observacao} />}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => { setShowView(false); openEditar(viewItem) }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <Edit2 className="w-4 h-4" /> Editar
              </button>
              <button onClick={() => setShowView(false)} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">{editando ? 'Editar Pagamento' : 'Novo Pagamento'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            {/* Aviso de duplicidade */}
            {dupAviso && (
              <div className="mb-4 flex gap-3 items-start p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-400 mb-1">Possível duplicidade detectada</p>
                  <p className="text-xs text-amber-300/80">{dupAviso}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">Deseja salvar mesmo assim? (ex: parcela diferente)</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Descrição *</label>
                <input value={form.descricao} onChange={e => handleFormChange('descricao', e.target.value)} placeholder="Descrição do pagamento"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Número da NF
                  {form.forma_pagamento === 'Boleto' && (
                    <span className="ml-2 text-amber-400 font-normal">(recomendado para boletos)</span>
                  )}
                </label>
                <input
                  value={form.numero_nf}
                  onChange={e => handleFormChange('numero_nf', e.target.value)}
                  placeholder="Ex: NF 646690-4, 12345/2026..."
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Valor *</label>
                  <input type="number" step="0.01" value={form.valor} onChange={e => handleFormChange('valor', e.target.value)} placeholder="0,00"
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Data de Vencimento *</label>
                  <input type="date" value={form.data_pagamento} onChange={e => handleFormChange('data_pagamento', e.target.value)}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Loja</label>
                  <Sel value={form.loja_id} onChange={v => handleFormChange('loja_id', v)} placeholder="Selecione">{lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}</Sel>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                  <Sel value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} placeholder="">{STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</Sel>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Categoria</label>
                  <Sel value={form.categoria_id} onChange={v => setForm(f => ({ ...f, categoria_id: v }))} placeholder="Sem categoria">
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.codigo ? `${c.codigo} - ${c.nome}` : c.nome}</option>)}
                  </Sel>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Forma de Pagamento</label>
                  <Sel value={form.forma_pagamento} onChange={v => handleFormChange('forma_pagamento', v)} placeholder="Selecione">{FORMAS.map(f => <option key={f} value={f}>{f}</option>)}</Sel>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Observação</label>
                <input value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))} placeholder="Opcional"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                Cancelar
              </button>
              {forcarSalvar ? (
                // Quando há duplicidade detectada: mostra dois botões
                <>
                  <button
                    onClick={() => { setDupAviso(null); setForcarSalvar(false) }}
                    className="flex-1 px-4 py-2 rounded-lg border border-amber-500/40 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
                  >
                    Revisar
                  </button>
                  <button
                    onClick={() => handleSalvar(true)}
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-medium hover:bg-amber-400 transition-colors disabled:opacity-50"
                  >
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Salvar mesmo assim
                  </button>
                </>
              ) : (
                <button onClick={() => handleSalvar(false)} disabled={isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Salvar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm text-right max-w-[60%] break-words ${highlight ? 'font-bold text-primary' : 'text-foreground'} ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function Sel({ value, onChange, placeholder, children }: { value: string; onChange: (v: string) => void; placeholder: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-primary">
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  )
}

function Chip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  )
}
