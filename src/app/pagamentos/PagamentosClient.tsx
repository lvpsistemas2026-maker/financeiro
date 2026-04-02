'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2, Edit2, Filter, ChevronDown, X, Loader2, TrendingDown, CheckCircle } from 'lucide-react'
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
  const [filtroInicio, setFiltroInicio] = useState(mes.inicio)
  const [filtroFim, setFiltroFim] = useState(mes.fim)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<any | null>(null)
  const [form, setForm] = useState({
    loja_id: '', categoria_id: '', descricao: '', valor: '',
    data_pagamento: new Date().toISOString().split('T')[0],
    status: 'pendente' as string, forma_pagamento: '', observacao: ''
  })

  const filtrados = useMemo(() => initial.filter(p => {
    if (filtroLoja && String(p.loja_id) !== filtroLoja) return false
    if (filtroStatus && p.status !== filtroStatus) return false
    if (filtroInicio && p.data_pagamento < filtroInicio) return false
    if (filtroFim && p.data_pagamento > filtroFim) return false
    return true
  }), [initial, filtroLoja, filtroStatus, filtroInicio, filtroFim])

  const totalPago = filtrados.filter(p => p.status === 'pago').reduce((a: number, p: any) => a + Number(p.valor), 0)
  const totalPendente = filtrados.filter(p => p.status === 'pendente').reduce((a: number, p: any) => a + Number(p.valor), 0)

  const openNovo = () => {
    setEditando(null)
    setForm({ loja_id: '', categoria_id: '', descricao: '', valor: '', data_pagamento: new Date().toISOString().split('T')[0], status: 'pendente', forma_pagamento: '', observacao: '' })
    setShowModal(true)
  }

  const openEditar = (p: any) => {
    setEditando(p)
    setForm({ loja_id: String(p.loja_id ?? ''), categoria_id: String(p.categoria_id ?? ''), descricao: p.descricao, valor: String(p.valor), data_pagamento: p.data_pagamento, status: p.status, forma_pagamento: p.forma_pagamento ?? '', observacao: p.observacao ?? '' })
    setShowModal(true)
  }

  const handleSalvar = () => {
    if (!form.descricao || !form.valor || !form.data_pagamento) { toast.error('Preencha os campos obrigatórios'); return }
    startTransition(async () => {
      try {
        const data = {
          loja_id: form.loja_id ? Number(form.loja_id) : undefined,
          categoria_id: form.categoria_id ? Number(form.categoria_id) : undefined,
          descricao: form.descricao, valor: parseFloat(form.valor),
          data_pagamento: form.data_pagamento, status: form.status as any,
          forma_pagamento: form.forma_pagamento || undefined, observacao: form.observacao || undefined,
        }
        if (editando) { await updatePagamento(editando.id, data); toast.success('Pagamento atualizado!') }
        else { await createPagamento(data); toast.success('Pagamento criado!') }
        setShowModal(false); router.refresh()
      } catch { toast.error('Erro ao salvar pagamento') }
    })
  }

  const handleDeletar = (id: number) => {
    if (!confirm('Confirma exclusão?')) return
    startTransition(async () => { try { await deletePagamento(id); toast.success('Excluído!'); router.refresh() } catch { toast.error('Erro ao excluir') } })
  }

  const handleMarcarPago = (p: any) => {
    startTransition(async () => { try { await updatePagamento(p.id, { status: 'pago' }); toast.success('Marcado como pago!'); router.refresh() } catch { toast.error('Erro') } })
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
                {['DATA', 'DESCRIÇÃO', 'LOJA', 'CATEGORIA', 'FORMA', 'VALOR', 'STATUS', 'AÇÕES'].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-muted-foreground ${h === 'VALOR' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>Nenhum pagamento encontrado</p>
                </td></tr>
              ) : filtrados.map((p: any) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{formatDate(p.data_pagamento)}</td>
                  <td className="px-4 py-2.5 text-foreground max-w-xs"><span className="truncate block">{p.descricao}</span></td>
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{p.loja?.nome ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.categoria?.nome ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.forma_pagamento ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-red-400 whitespace-nowrap">{formatCurrency(Number(p.valor))}</td>
                  <td className="px-4 py-2.5">
                    <span className={`badge-${p.status}`}>{STATUS_OPTS.find(s => s.value === p.status)?.label ?? p.status}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">{editando ? 'Editar Pagamento' : 'Novo Pagamento'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Descrição *</label>
                <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descrição do pagamento"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Valor *</label>
                  <input type="number" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="0,00"
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Data *</label>
                  <input type="date" value={form.data_pagamento} onChange={e => setForm(f => ({ ...f, data_pagamento: e.target.value }))}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Loja</label>
                  <Sel value={form.loja_id} onChange={v => setForm(f => ({ ...f, loja_id: v }))} placeholder="Selecione">{lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}</Sel>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                  <Sel value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} placeholder="">{STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</Sel>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Categoria</label>
                  <Sel value={form.categoria_id} onChange={v => setForm(f => ({ ...f, categoria_id: v }))} placeholder="Sem categoria">{categorias.map(c => <option key={c.id} value={c.id}>{c.codigo ? `${c.codigo} - ` : ''}{c.nome}</option>)}</Sel>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Forma de Pagamento</label>
                  <Sel value={form.forma_pagamento} onChange={v => setForm(f => ({ ...f, forma_pagamento: v }))} placeholder="Selecione">{FORMAS.map(f => <option key={f} value={f}>{f}</option>)}</Sel>
                </div>
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
