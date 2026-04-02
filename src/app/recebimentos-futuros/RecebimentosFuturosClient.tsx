'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2, Edit2, Filter, ChevronDown, X, Loader2, CalendarCheck, CheckCircle, CreditCard, FileText, Smartphone, DollarSign, ArrowRightLeft, Eye } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createRecebimentoFuturo, updateRecebimentoFuturo, deleteRecebimentoFuturo } from '@/actions'
import type { Loja, Categoria } from '@/types'

interface Props { recebimentos: any[]; lojas: Loja[]; categorias: Categoria[] }

const STATUS_OPTS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'recebido', label: 'Recebido' },
  { value: 'cancelado', label: 'Cancelado' },
]
const TIPOS = [
  { value: 'cartao', label: 'Cartão', icon: CreditCard },
  { value: 'boleto', label: 'Boleto', icon: FileText },
  { value: 'pix', label: 'PIX', icon: Smartphone },
  { value: 'dinheiro', label: 'Dinheiro', icon: DollarSign },
  { value: 'transferencia', label: 'Transferência', icon: ArrowRightLeft },
]

export default function RecebimentosFuturosClient({ recebimentos: initial, lojas, categorias }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filtroLoja, setFiltroLoja] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('pendente')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showView, setShowView] = useState(false)
  const [viewItem, setViewItem] = useState<any | null>(null)
  const [editando, setEditando] = useState<any | null>(null)
  const [form, setForm] = useState({
    loja_id: '', categoria_id: '', descricao: '', valor: '',
    data_prevista: new Date().toISOString().split('T')[0],
    status: 'pendente' as string, tipo_recebimento: 'pix' as string,
    parcela_atual: '1', total_parcelas: '1', numero_documento: '', observacao: ''
  })

  const filtrados = useMemo(() => initial.filter(r => {
    if (filtroLoja && String(r.loja_id) !== filtroLoja) return false
    if (filtroStatus && r.status !== filtroStatus) return false
    if (filtroTipo && r.tipo_recebimento !== filtroTipo) return false
    return true
  }), [initial, filtroLoja, filtroStatus, filtroTipo])

  const totalPendente = filtrados.filter(r => r.status === 'pendente').reduce((a: number, r: any) => a + Number(r.valor), 0)

  const openNovo = () => {
    setEditando(null)
    setForm({ loja_id: '', categoria_id: '', descricao: '', valor: '', data_prevista: new Date().toISOString().split('T')[0], status: 'pendente', tipo_recebimento: 'pix', parcela_atual: '1', total_parcelas: '1', numero_documento: '', observacao: '' })
    setShowModal(true)
  }

  const openEditar = (r: any) => {
    setEditando(r)
    setForm({ loja_id: String(r.loja_id ?? ''), categoria_id: String(r.categoria_id ?? ''), descricao: r.descricao, valor: String(r.valor), data_prevista: r.data_prevista, status: r.status, tipo_recebimento: r.tipo_recebimento ?? 'pix', parcela_atual: String(r.parcela_atual ?? 1), total_parcelas: String(r.total_parcelas ?? 1), numero_documento: r.numero_documento ?? '', observacao: r.observacao ?? '' })
    setShowModal(true)
  }

  const handleSalvar = () => {
    if (!form.descricao || !form.valor || !form.data_prevista) { toast.error('Preencha os campos obrigatórios'); return }
    startTransition(async () => {
      try {
        const data = {
          loja_id: form.loja_id ? Number(form.loja_id) : undefined,
          categoria_id: form.categoria_id ? Number(form.categoria_id) : undefined,
          descricao: form.descricao, valor: parseFloat(form.valor),
          data_prevista: form.data_prevista, status: form.status as any,
          tipo_recebimento: form.tipo_recebimento as any,
          parcela_atual: parseInt(form.parcela_atual) || 1,
          total_parcelas: parseInt(form.total_parcelas) || 1,
          numero_documento: form.numero_documento || undefined,
          observacao: form.observacao || undefined,
        }
        if (editando) { await updateRecebimentoFuturo(editando.id, data); toast.success('Atualizado!') }
        else { await createRecebimentoFuturo(data); toast.success('Criado!') }
        setShowModal(false); router.refresh()
      } catch { toast.error('Erro ao salvar') }
    })
  }

  const handleDeletar = (id: number) => {
    if (!confirm('Confirma exclusão?')) return
    startTransition(async () => { try { await deleteRecebimentoFuturo(id); toast.success('Excluído!'); router.refresh() } catch { toast.error('Erro') } })
  }

  const handleMarcarRecebido = (r: any) => {
    startTransition(async () => { try { await updateRecebimentoFuturo(r.id, { status: 'recebido' }); toast.success('Marcado como recebido!'); router.refresh() } catch { toast.error('Erro') } })
  }

  const openVisualizar = (r: any) => { setViewItem(r); setShowView(true) }

  const getTipoIcon = (tipo: string) => {
    const t = TIPOS.find(t => t.value === tipo)
    if (!t) return null
    const Icon = t.icon
    return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Icon className="w-3 h-3" />{t.label}</span>
  }

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recebimentos Futuros</h1>
          <p className="text-sm text-muted-foreground mt-1">Cartão, boleto, PIX e parcelas a receber</p>
        </div>
        <button onClick={openNovo} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Novo Recebimento
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3"><Filter className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Filtros</span></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Sel value={filtroLoja} onChange={setFiltroLoja} placeholder="Todas as lojas">{lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}</Sel>
          <Sel value={filtroStatus} onChange={setFiltroStatus} placeholder="Todos os status">{STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</Sel>
          <Sel value={filtroTipo} onChange={setFiltroTipo} placeholder="Todos os tipos">{TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</Sel>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Total Pendente:</span>
          <span className="text-sm font-semibold text-emerald-400">{formatCurrency(totalPendente)}</span>
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
                {['DATA PREV.', 'DESCRIÇÃO', 'LOJA', 'TIPO', 'PARCELAS', 'DOC.', 'VALOR', 'STATUS', 'AÇÕES'].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-muted-foreground ${h === 'VALOR' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                  <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>Nenhum recebimento futuro encontrado</p>
                </td></tr>
              ) : filtrados.map((r: any) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{formatDate(r.data_prevista)}</td>
                  <td className="px-4 py-2.5 text-foreground max-w-xs"><span className="truncate block">{r.descricao}</span></td>
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{r.loja?.nome ?? '—'}</td>
                  <td className="px-4 py-2.5">{getTipoIcon(r.tipo_recebimento)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">
                    {r.total_parcelas > 1 ? `${r.parcela_atual}/${r.total_parcelas}` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{r.numero_documento ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-emerald-400 whitespace-nowrap">{formatCurrency(Number(r.valor))}</td>
                  <td className="px-4 py-2.5"><span className={`badge-${r.status}`}>{STATUS_OPTS.find(s => s.value === r.status)?.label ?? r.status}</span></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openVisualizar(r)} title="Visualizar" className="p-1.5 rounded hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {r.status === 'pendente' && (
                        <button onClick={() => handleMarcarRecebido(r)} title="Marcar como recebido" className="p-1.5 rounded hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => openEditar(r)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeletar(r.id)} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
              <h2 className="text-lg font-semibold text-foreground">Detalhes do Recebimento Futuro</h2>
              <button onClick={() => setShowView(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <Row label="Descrição" value={viewItem.descricao} />
              <Row label="Valor" value={formatCurrency(Number(viewItem.valor))} highlight />
              <Row label="Data Prevista" value={formatDate(viewItem.data_prevista)} />
              {viewItem.status === 'recebido' && viewItem.confirmado_em && (
                <Row label="Confirmado em" value={new Date(viewItem.confirmado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })} highlight />
              )}
              <Row label="Loja" value={viewItem.loja?.nome ?? '—'} />
              <Row label="Tipo" value={TIPOS.find(t => t.value === viewItem.tipo_recebimento)?.label ?? viewItem.tipo_recebimento} />
              {viewItem.total_parcelas > 1 && <Row label="Parcelas" value={`${viewItem.parcela_atual}/${viewItem.total_parcelas}`} />}
              {viewItem.numero_documento && <Row label="Nº Documento" value={viewItem.numero_documento} mono />}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">{editando ? 'Editar' : 'Novo'} Recebimento Futuro</h2>
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
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Data Prevista *</label>
                  <input type="date" value={form.data_prevista} onChange={e => setForm(f => ({ ...f, data_prevista: e.target.value }))}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Loja</label><Sel value={form.loja_id} onChange={v => setForm(f => ({ ...f, loja_id: v }))} placeholder="Selecione">{lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}</Sel></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label><Sel value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} placeholder="">{STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</Sel></div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo de Recebimento</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {TIPOS.map(t => {
                    const Icon = t.icon
                    return (
                      <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, tipo_recebimento: t.value }))}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${form.tipo_recebimento === t.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                        <Icon className="w-4 h-4" />{t.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Parcela Atual</label>
                  <input type="number" min="1" value={form.parcela_atual} onChange={e => setForm(f => ({ ...f, parcela_atual: e.target.value }))}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Total de Parcelas</label>
                  <input type="number" min="1" value={form.total_parcelas} onChange={e => setForm(f => ({ ...f, total_parcelas: e.target.value }))}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Categoria</label><Sel value={form.categoria_id} onChange={v => setForm(f => ({ ...f, categoria_id: v }))} placeholder="Sem categoria">{categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</Sel></div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nº do Documento</label>
                <input value={form.numero_documento} onChange={e => setForm(f => ({ ...f, numero_documento: e.target.value }))} placeholder="Opcional"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
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
