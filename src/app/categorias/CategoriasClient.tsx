'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2, Edit2, ChevronDown, X, Loader2, Tag, Search } from 'lucide-react'
import { createCategoria, updateCategoria, deleteCategoria } from '@/actions'
import type { Categoria } from '@/types'

interface Props { categorias: Categoria[] }

const GRUPOS_ENTRADA = ['Receitas Operacionais', 'Receitas Financeiras', 'Outras Receitas']
const GRUPOS_SAIDA = ['Custo das Mercadorias', 'Despesas com Pessoal', 'Despesas Tributárias', 'Despesas Operacionais', 'Despesas Administrativas', 'Despesas Financeiras', 'Investimentos', 'Outras Despesas']

export default function CategoriasClient({ categorias: initial }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filtroTipo, setFiltroTipo] = useState<'entrada' | 'saida' | ''>('')
  const [busca, setBusca] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [form, setForm] = useState({
    codigo: '', nome: '', tipo: 'saida' as 'entrada' | 'saida', grupo: '', palavras_chave: ''
  })

  const filtradas = useMemo(() => initial.filter(c => {
    if (filtroTipo && c.tipo !== filtroTipo) return false
    if (busca && !c.nome.toLowerCase().includes(busca.toLowerCase()) && !(c.codigo ?? '').includes(busca)) return false
    return true
  }), [initial, filtroTipo, busca])

  const grupos = useMemo(() => {
    const map: Record<string, Categoria[]> = {}
    for (const c of filtradas) {
      const g = c.grupo ?? 'Sem Grupo'
      if (!map[g]) map[g] = []
      map[g].push(c)
    }
    return map
  }, [filtradas])

  const openNovo = () => {
    setEditando(null)
    setForm({ codigo: '', nome: '', tipo: 'saida', grupo: '', palavras_chave: '' })
    setShowModal(true)
  }

  const openEditar = (c: Categoria) => {
    setEditando(c)
    setForm({ codigo: c.codigo ?? '', nome: c.nome, tipo: c.tipo, grupo: c.grupo ?? '', palavras_chave: c.palavras_chave ?? '' })
    setShowModal(true)
  }

  const handleSalvar = () => {
    if (!form.nome) { toast.error('Nome é obrigatório'); return }
    startTransition(async () => {
      try {
        const data = { codigo: form.codigo || undefined, nome: form.nome, tipo: form.tipo, grupo: form.grupo || undefined, palavras_chave: form.palavras_chave || undefined }
        if (editando) { await updateCategoria(editando.id, data); toast.success('Categoria atualizada!') }
        else { await createCategoria(data); toast.success('Categoria criada!') }
        setShowModal(false); router.refresh()
      } catch { toast.error('Erro ao salvar') }
    })
  }

  const handleDeletar = (id: number) => {
    if (!confirm('Confirma exclusão desta categoria?')) return
    startTransition(async () => { try { await deleteCategoria(id); toast.success('Excluída!'); router.refresh() } catch { toast.error('Erro ao excluir') } })
  }

  const gruposOrdenados = useMemo(() => {
    const ordem = filtroTipo === 'entrada' ? GRUPOS_ENTRADA : filtroTipo === 'saida' ? GRUPOS_SAIDA : [...GRUPOS_ENTRADA, ...GRUPOS_SAIDA]
    const resultado: [string, Categoria[]][] = []
    for (const g of ordem) { if (grupos[g]) resultado.push([g, grupos[g]]) }
    for (const [g, cats] of Object.entries(grupos)) { if (!ordem.includes(g)) resultado.push([g, cats]) }
    return resultado
  }, [grupos, filtroTipo])

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <p className="text-sm text-muted-foreground mt-1">{initial.length} categorias · Configure palavras-chave para classificação automática</p>
        </div>
        <button onClick={openNovo} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou código..."
            className="w-full bg-input border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
          {[{ v: '', l: 'Todas' }, { v: 'entrada', l: 'Entradas' }, { v: 'saida', l: 'Saídas' }].map(({ v, l }) => (
            <button key={v} onClick={() => setFiltroTipo(v as any)}
              className={`px-3 py-1.5 rounded text-sm transition-all ${filtroTipo === v ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Grupos */}
      <div className="space-y-4">
        {gruposOrdenados.map(([grupo, cats]) => (
          <div key={grupo} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-secondary/50 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{grupo}</span>
                <span className="text-xs text-muted-foreground">({cats.length})</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${cats[0]?.tipo === 'entrada' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                {cats[0]?.tipo === 'entrada' ? 'Receita' : 'Despesa'}
              </span>
            </div>
            <div className="divide-y divide-border/50">
              {cats.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/30 transition-colors">
                  {c.codigo && <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded flex-shrink-0">{c.codigo}</span>}
                  <span className="text-sm text-foreground flex-1">{c.nome}</span>
                  {c.palavras_chave && (
                    <div className="hidden md:flex flex-wrap gap-1 max-w-xs">
                      {c.palavras_chave.split(',').slice(0, 3).map((p, i) => (
                        <span key={i} className="text-xs bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{p.trim()}</span>
                      ))}
                      {c.palavras_chave.split(',').length > 3 && (
                        <span className="text-xs text-muted-foreground">+{c.palavras_chave.split(',').length - 3}</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => openEditar(c)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeletar(c.id)} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {gruposOrdenados.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>Nenhuma categoria encontrada</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">{editando ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Código</label>
                  <input value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} placeholder="Ex: 451"
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo *</label>
                  <div className="relative">
                    <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as any, grupo: '' }))}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="entrada">Receita (Entrada)</option>
                      <option value="saida">Despesa (Saída)</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nome *</label>
                <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome da categoria"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Grupo</label>
                <div className="relative">
                  <select value={form.grupo} onChange={e => setForm(f => ({ ...f, grupo: e.target.value }))}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Sem grupo</option>
                    {(form.tipo === 'entrada' ? GRUPOS_ENTRADA : GRUPOS_SAIDA).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Palavras-chave (separadas por vírgula)</label>
                <input value={form.palavras_chave} onChange={e => setForm(f => ({ ...f, palavras_chave: e.target.value }))}
                  placeholder="Ex: aluguel, locação, imóvel"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <p className="text-xs text-muted-foreground mt-1">Usadas para classificação automática ao importar OFX</p>
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
