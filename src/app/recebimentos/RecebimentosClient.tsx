'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2, Edit2, Filter, ChevronDown, X, Loader2, TrendingUp, CheckCircle, Eye, AlertTriangle } from 'lucide-react'
import { formatCurrency, formatDate, getMesAtual } from '@/lib/utils'
import { createRecebimento, updateRecebimento, deleteRecebimento } from '@/actions'
import type { Loja, Categoria } from '@/types'

interface Props { recebimentos: any[]; lojas: Loja[]; categorias: Categoria[] }

const STATUS_OPTS = [
  { value: 'pendente', label: 'Pendente', cls: 'badge-pendente' },
  { value: 'recebido', label: 'Recebido', cls: 'badge-recebido' },
  { value: 'cancelado', label: 'Cancelado', cls: 'badge-cancelado' },
]
const FORMAS = ['Dinheiro', 'PIX', 'Transferência', 'Boleto', 'Cartão de Débito', 'Cartão de Crédito']

export default function RecebimentosClient({ recebimentos: initial, lojas, categorias }: Props) {
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
  const [dupAviso, setDupAviso] = useState<string | null>(null)
  const [forcarSalvar, setForcarSalvar] = useState(false)
  const [form, setForm] = useState({
    loja_id: '', categoria_id: '', descricao: '', numero_nf: '', valor: '',
    data_recebimento: new Date().toISOString().split('T')[0],
    status: 'pendente' as string, forma_recebimento: '', observacao: ''
  })

  const filtrados = useMemo(() => initial.filter(r => {
    if (filtroLoja && String(r.loja_id) !== filtroLoja) return false
    if (filtroStatus && r.status !== filtroStatus) return false
    if (filtroInicio && r.data_recebimento < filtroInicio) return false
    if (filtroFim && r.data_recebimento > filtroFim) return false
    if (filtroNF && !(r.numero_nf ?? '').toLowerCase().includes(filtroNF.toLowerCase())) return false
    return true
  }), [initial, filtroLoja, filtroStatus, filtroInicio, filtroFim, filtroNF])

  const totalRecebido = filtrados.filter(r => r.status === 'recebido').reduce((a: number, r: any) => a + Number(r.valor), 0)
  const totalPendente = filtrados.filter(r => r.status === 'pendente').reduce((a: number, r: any) => a + Number(r.valor), 0)

  const openNovo = () => {
    setEditando(null)
    setDupAviso(null)
    setForcarSalvar(false)
    setForm({ loja_id: '', categoria_id: '', descricao: '', numero_nf: '', valor: '', data_recebimento: new Date().toISOString().split('T')[0], status: 'pendente', forma_recebimento: '', observacao: '' })
    setShowModal(true)
  }

  const openEditar = (r: any) => {
    setEditando(r)
    setDupAviso(null)
    setForcarSalvar(false)
    setForm({
      loja_id: String(r.loja_id ?? ''), categoria_id: String(r.categoria_id ?? ''),
      descricao: r.descricao, numero_nf: r.numero_nf ?? '', valor: String(r.valor),
      data_recebimento: r.data_recebimento, status: r.status,
      forma_recebimento: r.forma_recebimento ?? '', observacao: r.observacao ?? ''
    })
    setShowModal(true)
  }

  const openVisualizar = (r: any) => {
    setViewItem(r)
    setShowView(true)
  }

  const handleFormChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    if (['descricao', 'numero_nf', 'valor', 'data_recebimento', 'forma_recebimento', 'loja_id'].includes(field)) {
      setDupAviso(null)
      setForcarSalvar(false)
    }
  }

  const handleSalvar = (ignorarDup = false) => {
    if (!form.descricao || !form.valor || !form.data_recebimento) {
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
          data_recebimento: form.data_recebimento,
          status: form.status as any,
          forma_recebimento: form.forma_recebimento || undefined,
          observacao: form.observacao || undefined,
          _ignorar_dup: ignorarDup,
        }
        if (editando) {
          await updateRecebimento(editando.id, data)
          toast.success('Recebimento atualizado!')
        } else {
          await createRecebimento(data as any)
          toast.success('Recebimento registrado com sucesso!')
        }
        setShowModal(false)
        setDupAviso(null)
        setForcarSalvar(false)
        router.refresh()
      } catch (err: any) {
        const msg: string = err?.message ?? ''
        if (msg.startsWith('DUPLICADO:')) {
          setDupAviso(msg.replace('DUPLICADO: ', ''))
          setForcarSalvar(true)
        } else {
          toast.error('Erro ao salvar recebimento', { description: msg })
        }
      }
    })
  }

  const handleDeletar = (id: number) => {
    if (!confirm('Confirma exclusão?')) return
    startTransition(async () => {
      try { await deleteRecebimento(id); toast.success('Excluído!'); router.refresh() }
      catch { toast.error('Erro ao excluir') }
    })
  }

  const handleMarcarRecebido = (r: any) => {
    startTransition(async () => {
      try { await updateRecebimento(r.id, { status: 'recebido' }); toast.success('Marcado como recebido!'); router.refresh() }
      catch { toast.error('Erro') }
    })
  }

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recebimentos</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de entradas por loja</p>
        </div>
        <button onClick={openNovo} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Novo Recebimento
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
        <Chip label="Total Recebido" value={formatCurrency(totalRecebido)} color="text-emerald-400" />
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
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>Nenhum recebimento encontrado</p>
                </td></tr>
              ) : filtrados.map((r: any) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{formatDate(r.data_recebimento)}</td>
                  <td className="px-4 py-2.5 text-foreground max-w-xs"><span className="truncate block">{r.descricao}</span></td>
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap font-mono text-xs">{r.numero_nf ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{r.loja?.nome ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.categoria?.nome ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.forma_recebimento ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-emerald-400 whitespace-nowrap">{formatCurrency(Number(r.valor))}</td>
                  <td className="px-4 py-2.5">
                    <span className={`badge-${r.status}`}>{STATUS_OPTS.find(s => s.value === r.status)?.label ?? r.status}</span>
                  </td>
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
              <h2 className="text-lg font-semibold text-foreground">Detalhes do Recebimento</h2>
              <button onClick={() => setShowView(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <Row label="Descrição" value={viewItem.descricao} />
              {viewItem.numero_nf && <Row label="Número da NF" value={viewItem.numero_nf} mono />}
              <Row label="Valor" value={formatCurrency(Number(viewItem.valor))} highlight />
              <Row label="Data de Vencimento" value={formatDate(viewItem.data_recebimento)} />
              {viewItem.status === 'recebido' && viewItem.recebido_em && (
                <Row label="Recebido em" value={new Date(viewItem.recebido_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })} highlight />
              )}
              <Row label="Loja" value={viewItem.loja?.nome ?? '—'} />
              <Row label="Categoria" value={viewItem.categoria?.nome ?? '—'} />
              <Row label="Forma de Recebimento" value={viewItem.forma_recebimento ?? '—'} />
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
              <h2 className="text-lg font-semibold text-foreground">{editando ? 'Editar Recebimento' : 'Novo Recebimento'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            {/* Aviso de duplicidade */}
            {dupAviso && (
              <div className="mb-4 flex gap-3 items-start p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-400 mb-1">Possível duplicidade detectada</p>
                  <p className="text-xs text-amber-300/80">{dupAviso}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">Deseja salvar mesmo assim?</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Descrição *</label>
                <input value={form.descricao} onChange={e => handleFormChange('descricao', e.target.value)} placeholder="Descrição do recebimento"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Número da NF
                  {form.forma_recebimento === 'Boleto' && (
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
                  <input type="date" value={form.data_recebimento} onChange={e => handleFormChange('data_recebimento', e.target.value)}
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
                    {categorias.map(c => <option key={c.id} value={c.id}>{(c as any).codigo ? `${(c as any).codigo} - ${c.nome}` : c.nome}</option>)}
                  </Sel>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Forma de Recebimento</label>
                  <Sel value={form.forma_recebimento} onChange={v => handleFormChange('forma_recebimento', v)} placeholder="Selecione">{FORMAS.map(f => <option key={f} value={f}>{f}</option>)}</Sel>
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
