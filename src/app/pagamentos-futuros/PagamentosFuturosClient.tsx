'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2, Edit2, Filter, ChevronDown, X, Loader2, CalendarClock, CheckCircle, AlertTriangle, RefreshCw, Eye } from 'lucide-react'
import { formatCurrency, formatDate, isVencido, diasParaVencer } from '@/lib/utils'
import { createPagamentoFuturo, updatePagamentoFuturo, deletePagamentoFuturo } from '@/actions'
import type { Loja, Categoria } from '@/types'

interface Props { pagamentos: any[]; lojas: Loja[]; categorias: Categoria[] }

const STATUS_OPTS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'cancelado', label: 'Cancelado' },
]
const FREQ_OPTS = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'quinzenal', label: 'Quinzenal' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'anual', label: 'Anual' },
]
const FORMAS = ['Dinheiro', 'PIX', 'Transferência', 'Boleto', 'Cartão de Débito', 'Cartão de Crédito', 'Cheque']

export default function PagamentosFuturosClient({ pagamentos: initial, lojas, categorias }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filtroLoja, setFiltroLoja] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('pendente')
  const [showModal, setShowModal] = useState(false)
  const [showView, setShowView] = useState(false)
  const [viewItem, setViewItem] = useState<any | null>(null)
  const [editando, setEditando] = useState<any | null>(null)
  const [form, setForm] = useState({
    loja_id: '', categoria_id: '', descricao: '', valor: '',
    data_vencimento: new Date().toISOString().split('T')[0],
    status: 'pendente' as string, recorrente: false, frequencia: 'mensal' as string, observacao: ''
  })

  const filtrados = useMemo(() => initial.filter(p => {
    if (filtroLoja && String(p.loja_id) !== filtroLoja) return false
    if (filtroStatus && p.status !== filtroStatus) return false
    return true
  }), [initial, filtroLoja, filtroStatus])

  const totalPendente = filtrados.filter(p => p.status === 'pendente').reduce((a: number, p: any) => a + Number(p.valor), 0)
  const countVencidos = filtrados.filter(p => p.status === 'pendente' && isVencido(p.data_vencimento)).length

  const openNovo = () => {
    setEditando(null)
    setForm({ loja_id: '', categoria_id: '', descricao: '', valor: '', data_vencimento: new Date().toISOString().split('T')[0], status: 'pendente', recorrente: false, frequencia: 'mensal', observacao: '' })
    setShowModal(true)
  }

  const openEditar = (p: any) => {
    setEditando(p)
    setForm({ loja_id: String(p.loja_id ?? ''), categoria_id: String(p.categoria_id ?? ''), descricao: p.descricao, valor: String(p.valor), data_vencimento: p.data_vencimento, status: p.status, recorrente: p.recorrente ?? false, frequencia: p.frequencia ?? 'mensal', observacao: p.observacao ?? '' })
    setShowModal(true)
  }

  const handleSalvar = () => {
    if (!form.descricao || !form.valor || !form.data_vencimento) { toast.error('Preencha os campos obrigatórios'); return }
    startTransition(async () => {
      try {
        const data = {
          loja_id: form.loja_id ? Number(form.loja_id) : undefined,
          categoria_id: form.categoria_id ? Number(form.categoria_id) : undefined,
          descricao: form.descricao, valor: parseFloat(form.valor),
          data_vencimento: form.data_vencimento, status: form.status as any,
          recorrente: form.recorrente, frequencia: form.recorrente ? form.frequencia as any : undefined,
          observacao: form.observacao || undefined,
        }
        if (editando) { await updatePagamentoFuturo(editando.id, data); toast.success('Atualizado!') }
        else { await createPagamentoFuturo(data); toast.success('Criado!') }
        setShowModal(false); router.refresh()
      } catch { toast.error('Erro ao salvar') }
    })
  }

  const handleDeletar = (id: number) => {
    if (!confirm('Confirma exclusão?')) return
    startTransition(async () => { try { await deletePagamentoFuturo(id); toast.success('Excluído!'); router.refresh() } catch { toast.error('Erro') } })
  }

  const handleMarcarPago = (p: any) => {
    startTransition(async () => { try { await updatePagamentoFuturo(p.id, { status: 'pago' }); toast.success('Marcado como pago!'); router.refresh() } catch { toast.error('Erro') } })
  }

  const openVisualizar = (p: any) => { setViewItem(p); setShowView(true) }

  const getStatusBadge = (p: any) => {
    if (p.status === 'pago') return <span className="badge-pago">Pago</span>
    if (p.status === 'cancelado') return <span className="badge-cancelado">Cancelado</span>
    if (p.status === 'vencido' || isVencido(p.data_vencimento)) return <span className="badge-vencido">Vencido</span>
    const dias = diasParaVencer(p.data_vencimento)
    if (dias <= 7) return <span className="badge-pendente text-orange-400">Vence em {dias}d</span>
    return <span className="badge-pendente">Pendente</span>
  }

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pagamentos Futuros</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de vencimentos e recorrências</p>
        </div>
        <button onClick={openNovo} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Novo Pagamento
        </button>
      </div>

      {countVencidos > 0 && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400 font-medium">{countVencidos} pagamento(s) vencido(s) — regularize o quanto antes</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3"><Filter className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Filtros</span></div>
        <div className="grid grid-cols-2 gap-3">
          <Sel value={filtroLoja} onChange={setFiltroLoja} placeholder="Todas as lojas">{lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}</Sel>
          <Sel value={filtroStatus} onChange={setFiltroStatus} placeholder="Todos os status">{STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</Sel>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Total Pendente:</span>
          <span className="text-sm font-semibold text-amber-400">{formatCurrency(totalPendente)}</span>
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Registros:</span>
          <span className="text-sm font-semibold text-muted-foreground">{filtrados.length}</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {['VENCIMENTO', 'DESCRIÇÃO', 'LOJA', 'CATEGORIA', 'VALOR', 'RECORRÊNCIA', 'STATUS', 'AÇÕES'].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-muted-foreground ${h === 'VALOR' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  <CalendarClock className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>Nenhum pagamento futuro encontrado</p>
                </td></tr>
              ) : filtrados.map((p: any) => (
                <tr key={p.id} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${p.status === 'pendente' && isVencido(p.data_vencimento) ? 'bg-red-500/5' : ''}`}>
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{formatDate(p.data_vencimento)}</td>
                  <td className="px-4 py-2.5 text-foreground max-w-xs"><span className="truncate block">{p.descricao}</span></td>
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{p.loja?.nome ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.categoria?.nome ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-red-400 whitespace-nowrap">{formatCurrency(Number(p.valor))}</td>
                  <td className="px-4 py-2.5">
                    {p.recorrente ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary"><RefreshCw className="w-3 h-3" />{FREQ_OPTS.find(f => f.value === p.frequencia)?.label ?? p.frequencia}</span>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className="px-4 py-2.5">{getStatusBadge(p)}</td>
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
              <h2 className="text-lg font-semibold text-foreground">Detalhes do Pagamento Futuro</h2>
              <button onClick={() => setShowView(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <Row label="Descrição" value={viewItem.descricao} />
              <Row label="Valor" value={formatCurrency(Number(viewItem.valor))} highlight />
              <Row label="Vencimento" value={formatDate(viewItem.data_vencimento)} />
              {viewItem.status === 'pago' && viewItem.confirmado_em && (
                <Row label="Confirmado em" value={new Date(viewItem.confirmado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })} highlight />
              )}
              <Row label="Loja" value={viewItem.loja?.nome ?? '—'} />
              <Row label="Categoria" value={viewItem.categoria?.nome ?? '—'} />
              <Row label="Status" value={STATUS_OPTS.find(s => s.value === viewItem.status)?.label ?? viewItem.status} />
              {viewItem.recorrente && <Row label="Recorrência" value={FREQ_OPTS.find(f => f.value === viewItem.frequencia)?.label ?? viewItem.frequencia} />}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">{editando ? 'Editar' : 'Novo'} Pagamento Futuro</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Descrição *</label>
                <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descrição"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Valor *</label>
                  <input type="number" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="0,00"
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Vencimento *</label>
                  <input type="date" value={form.data_vencimento} onChange={e => setForm(f => ({ ...f, data_vencimento: e.target.value }))}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Loja</label><Sel value={form.loja_id} onChange={v => setForm(f => ({ ...f, loja_id: v }))} placeholder="Selecione">{lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}</Sel></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label><Sel value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} placeholder="">{STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</Sel></div>
              </div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Categoria</label><Sel value={form.categoria_id} onChange={v => setForm(f => ({ ...f, categoria_id: v }))} placeholder="Sem categoria">{categorias.map(c => <option key={c.id} value={c.id}>{c.codigo ? `${c.codigo} - ` : ''}{c.nome}</option>)}</Sel></div>
              
              {/* Recorrência */}
              <div className="bg-secondary/50 rounded-lg p-3 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.recorrente} onChange={e => setForm(f => ({ ...f, recorrente: e.target.checked }))}
                    className="w-4 h-4 rounded border-border accent-primary" />
                  <span className="text-sm font-medium text-foreground">Pagamento Recorrente</span>
                  <RefreshCw className="w-4 h-4 text-primary" />
                </label>
                {form.recorrente && (
                  <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Frequência</label><Sel value={form.frequencia} onChange={v => setForm(f => ({ ...f, frequencia: v }))} placeholder="">{FREQ_OPTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</Sel></div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Observação</label>
                <input value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))} placeholder="Opcional"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">Cancelar</button>
              <button onClick={handleSalvar} disabled={isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Salvar
              </button>
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
