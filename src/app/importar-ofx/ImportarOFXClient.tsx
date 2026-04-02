'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, ChevronDown } from 'lucide-react'
import { parseOFX, classificarTransacao, formatCurrency, formatDate } from '@/lib/utils'
import { createTransacoesLote } from '@/actions'
import type { Loja, Categoria, TransacaoOFX } from '@/types'

interface Props {
  lojas: Loja[]
  categorias: Categoria[]
}

export default function ImportarOFXClient({ lojas, categorias }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)
  const [lojaId, setLojaId] = useState<number | ''>('')
  const [transacoes, setTransacoes] = useState<TransacaoOFX[]>([])
  const [fileName, setFileName] = useState('')
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target?.result as string
      const parsed = parseOFX(content)
      const withCategoria = parsed.map(t => {
        const catId = classificarTransacao(t.descricao, categorias, t.tipo)
        const cat = categorias.find(c => c.id === catId)
        return { ...t, categoriaId: catId ?? undefined, categoriaNome: cat?.nome }
      })
      setTransacoes(withCategoria)
      setStep('preview')
    }
    reader.readAsText(file, 'latin1')
  }

  const handleCategoriaChange = (fitId: string, catId: number | '') => {
    setTransacoes(prev => prev.map(t =>
      t.fitId === fitId
        ? { ...t, categoriaId: catId === '' ? undefined : catId, categoriaNome: categorias.find(c => c.id === catId)?.nome }
        : t
    ))
  }

  const handleImportar = () => {
    if (!lojaId) { toast.error('Selecione a loja antes de importar'); return }
    startTransition(async () => {
      try {
        const payload = transacoes.map(t => ({
          loja_id: lojaId as number,
          categoria_id: t.categoriaId,
          data: t.data,
          descricao: t.descricao,
          valor: t.valor,
          tipo: t.tipo,
          fit_id: t.fitId || undefined,
          origem: 'ofx' as const,
        }))
        await createTransacoesLote(payload)
        toast.success(`${transacoes.length} transações importadas com sucesso!`)
        setStep('done')
        setTimeout(() => router.push('/transacoes'), 1500)
      } catch (err: any) {
        toast.error('Erro ao importar: ' + (err?.message ?? 'Tente novamente'))
      }
    })
  }

  const totalCredito = transacoes.filter(t => t.tipo === 'credito').reduce((a, t) => a + t.valor, 0)
  const totalDebito = transacoes.filter(t => t.tipo === 'debito').reduce((a, t) => a + t.valor, 0)
  const semCategoria = transacoes.filter(t => !t.categoriaId).length

  return (
    <div className="p-6 space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Importar Extrato OFX</h1>
        <p className="text-sm text-muted-foreground mt-1">Importe o extrato do Banco do Brasil (.ofx) e classifique as transações</p>
      </div>

      {step === 'upload' && (
        <div className="max-w-xl">
          {/* Seletor de loja */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Loja *</label>
            <div className="relative">
              <select
                value={lojaId}
                onChange={e => setLojaId(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Selecione a loja</option>
                {lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Clique para selecionar o arquivo OFX</p>
            <p className="text-xs text-muted-foreground mt-1">Formato: .ofx do Banco do Brasil</p>
            <input ref={fileRef} type="file" accept=".ofx,.OFX" className="hidden" onChange={handleFile} />
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          {/* Resumo */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2.5">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground font-medium">{fileName}</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <span className="badge-credito">{transacoes.filter(t => t.tipo === 'credito').length} créditos · {formatCurrency(totalCredito)}</span>
              <span className="badge-debito">{transacoes.filter(t => t.tipo === 'debito').length} débitos · {formatCurrency(totalDebito)}</span>
              {semCategoria > 0 && (
                <span className="badge-pendente"><AlertCircle className="w-3 h-3 mr-1" />{semCategoria} sem categoria</span>
              )}
            </div>
          </div>

          {/* Seletor de loja */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={lojaId}
                onChange={e => setLojaId(e.target.value ? Number(e.target.value) : '')}
                className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Selecione a loja *</option>
                {lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <button
              onClick={handleImportar}
              disabled={isPending || !lojaId}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Confirmar Importação
            </button>
            <button
              onClick={() => { setStep('upload'); setTransacoes([]); setFileName('') }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>

          {/* Tabela de preview */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">DATA</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">DESCRIÇÃO</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">VALOR</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">TIPO</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">CATEGORIA</th>
                  </tr>
                </thead>
                <tbody>
                  {transacoes.map((t, i) => (
                    <tr key={t.fitId || i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{formatDate(t.data)}</td>
                      <td className="px-4 py-2.5 text-foreground max-w-xs truncate">{t.descricao}</td>
                      <td className={`px-4 py-2.5 text-right font-medium whitespace-nowrap ${t.tipo === 'credito' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.tipo === 'credito' ? '+' : '-'}{formatCurrency(t.valor)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={t.tipo === 'credito' ? 'badge-credito' : 'badge-debito'}>
                          {t.tipo === 'credito' ? 'Crédito' : 'Débito'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="relative">
                          <select
                            value={t.categoriaId ?? ''}
                            onChange={e => handleCategoriaChange(t.fitId, e.target.value ? Number(e.target.value) : '')}
                            className="bg-input border border-border rounded px-2 py-1 text-xs text-foreground appearance-none pr-6 focus:outline-none focus:ring-1 focus:ring-primary w-44"
                          >
                            <option value="">Sem categoria</option>
                            {categorias
                              .filter(c => c.tipo === (t.tipo === 'credito' ? 'entrada' : 'saida'))
                              .map(c => <option key={c.id} value={c.id}>{c.codigo ? `${c.codigo} - ` : ''}{c.nome}</option>)
                            }
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1.5 w-3 h-3 text-muted-foreground pointer-events-none" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-400 mb-4" />
          <h2 className="text-xl font-bold text-foreground">Importação concluída!</h2>
          <p className="text-muted-foreground mt-2">Redirecionando para Transações...</p>
        </div>
      )}
    </div>
  )
}
