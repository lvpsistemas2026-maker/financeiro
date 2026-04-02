'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2, Edit2, Filter, ChevronDown, X, Loader2, ArrowDownUp } from 'lucide-react'
import { formatCurrency, formatDate, getMesAtual } from '@/lib/utils'
import { createTransacao, updateTransacao, deleteTransacao } from '@/actions'
import type { Transacao, Loja, Categoria } from '@/types'

interface Props {
  transacoes: any[]
  lojas: Loja[]
  categorias: Categoria[]
}

export default function TransacoesClient({ transacoes: initialTransacoes, lojas, categorias }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const mes = getMesAtual()

  // Filtros
  const [filtroLoja, setFiltroLoja] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroInicio, setFiltroInicio] = useState(mes.inicio)
  const [filtroFim, setFiltroFim] = useState(mes.fim)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<any | null>(null)
  const [form, setForm] = useState({
    loja_id: '', categoria_id: '', data: '', descricao: '', valor: '', tipo: 'credito' as 'credito' | 'debito', observacao: ''
  })

  const transacoesFiltradas = useMemo(() => {
    return initialTransacoes.filter(t => {
      if (filtroLoja && String(t.loja_id) !== filtroLoja) return false
      if (filtroTipo && t.tipo !== filtroTipo) return false
      if (filtroCategoria && String(t.categoria_id) !== filtroCategoria) return false
      if (filtroInicio && t.data < filtroInicio) return false
      if (filtroFim && t.data > filtroFim) return false
      return true
    })
  }, [initialTransacoes, filtroLoja, filtroTipo, filtroCategoria, filtroInicio, filtroFim])

  const totalCredito = transacoesFiltradas.filter(t => t.tipo === 'credito').reduce((a: number, t: any) => a + Number(t.valor), 0)
  const totalDebito = transacoesFiltradas.filter(t => t.tipo === 'debito').reduce((a: number, t: any) => a + Number(t.valor), 0)

  const openNovo = () => {
    setEditando(null)
    setForm({ loja_id: '', categoria_id: '', data: new Date().toISOString().split('T')[0], descricao: '', valor: '', tipo: 'credito', observacao: '' })
    setShowModal(true)
  }

  const openEditar = (t: any) => {
    setEditando(t)
    setForm({
      loja_id: String(t.loja_id ?? ''),
      categoria_id: String(t.categoria_id ?? ''),
      data: t.data,
      descricao: t.descricao,
      valor: String(t.valor),
      tipo: t.tipo,
      observacao: t.observacao ?? '',
    })
    setShowModal(true)
  }

  const handleSalvar = () => {
    if (!form.descricao || !form.valor || !form.data) { toast.error('Preencha os campos obrigatórios'); return }
    startTransition(async () => {
      try {
        const data = {
          loja_id: form.loja_id ? Number(form.loja_id) : undefined,
          categoria_id: form.categoria_id ? Number(form.categoria_id) : undefined,
          data: form.data,
          descricao: form.descricao,
          valor: parseFloat(form.valor),
          tipo: form.tipo,
          observacao: form.observacao || undefined,
        }
        if (editando) {
          await updateTransacao(editando.id, data)
          toast.success('Transação atualizada!')
        } else {
          await createTransacao(data)
          toast.success('Transação criada!')
        }
        setShowModal(false)
        router.refresh()
      } catch { toast.error('Erro ao salvar transação') }
    })
  }

  const handleDeletar = (id: number) => {
    if (!confirm('Confirma exclusão desta transação?')) return
    startTransition(async () => {
      try {
        await deleteTransacao(id)
        toast.success('Transação excluída!')
        router.refresh()
      } catch { toast.error('Erro ao excluir') }
    })
  }

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transações</h1>
          <p className="text-sm text-muted-foreground mt-1">Histórico de créditos e débitos por loja</p>
        </div>
        <button onClick={openNovo} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Nova Transação
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filtros</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <SelectField value={filtroLoja} onChange={setFiltroLoja} placeholder="Todas as lojas">
            {lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </SelectField>
          <SelectField value={filtroTipo} onChange={setFiltroTipo} placeholder="Tipo">
            <option value="credito">Crédito</option>
            <option value="debito">Débito</option>
          </SelectField>
          <SelectField value={filtroCategoria} onChange={setFiltroCategoria} placeholder="Categoria">
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </SelectField>
          <input type="date" value={filtroInicio} onChange={e => setFiltroInicio(e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="date" value={filtroFim} onChange={e => setFiltroFim(e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      {/* Totais */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Total Créditos:</span>
          <span className="text-sm font-semibold text-emerald-400">{formatCurrency(totalCredito)}</span>
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Total Débitos:</span>
          <span className="text-sm font-semibold text-red-400">{formatCurrency(totalDebito)}</span>
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Resultado:</span>
          <span className={`text-sm font-semibold ${totalCredito - totalDebito >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(totalCredito - totalDebito)}
          </span>
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{transacoesFiltradas.length} registros</span>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">DATA</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">DESCRIÇÃO</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">LOJA</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">CATEGORIA</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">VALOR</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">TIPO</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {transacoesFiltradas.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  <ArrowDownUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Nenhuma transação encontrada</p>
                </td></tr>
              ) : transacoesFiltradas.map((t: any) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{formatDate(t.data)}</td>
                  <td className="px-4 py-2.5 text-foreground max-w-xs">
                    <span className="truncate block">{t.descricao}</span>
                    {t.observacao && <span className="text-xs text-muted-foreground">{t.observacao}</span>}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{t.loja?.nome ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{t.categoria?.nome ?? '—'}</td>
                  <td className={`px-4 py-2.5 text-right font-medium whitespace-nowrap ${t.tipo === 'credito' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.tipo === 'credito' ? '+' : '-'}{formatCurrency(Number(t.valor))}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={t.tipo === 'credito' ? 'badge-credito' : 'badge-debito'}>
                      {t.tipo === 'credito' ? 'Crédito' : 'Débito'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEditar(t)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeletar(t.id)} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
              <h2 className="text-lg font-semibold text-foreground">{editando ? 'Editar Transação' : 'Nova Transação'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Data *</label>
                  <input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo *</label>
                  <div className="relative">
                    <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as any }))}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="credito">Crédito</option>
                      <option value="debito">Débito</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Descrição *</label>
                <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  placeholder="Descrição da transação"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Valor *</label>
                  <input type="number" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                    placeholder="0,00"
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Loja</label>
                  <div className="relative">
                    <select value={form.loja_id} onChange={e => setForm(f => ({ ...f, loja_id: e.target.value }))}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="">Selecione</option>
                      {lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Categoria</label>
                <div className="relative">
                  <select value={form.categoria_id} onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Sem categoria</option>
                    {categorias.filter(c => c.tipo === (form.tipo === 'credito' ? 'entrada' : 'saida')).map(c =>
                      <option key={c.id} value={c.id}>{c.codigo ? `${c.codigo} - ` : ''}{c.nome}</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Observação</label>
                <input value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
                  placeholder="Opcional"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                Cancelar
              </button>
              <button onClick={handleSalvar} disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SelectField({ value, onChange, placeholder, children }: {
  value: string; onChange: (v: string) => void; placeholder: string; children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-primary">
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  )
}
