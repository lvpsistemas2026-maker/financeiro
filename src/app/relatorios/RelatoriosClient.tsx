'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { formatCurrency, formatDate, getMesAtual } from '@/lib/utils'
import type { Loja, Categoria } from '@/types'
import { Filter, ChevronDown, BarChart3 } from 'lucide-react'

interface Props { transacoes: any[]; lojas: Loja[]; categorias: Categoria[] }

const COLORS = ['#C9A84C', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316']

export default function RelatoriosClient({ transacoes: initial, lojas, categorias }: Props) {
  const mes = getMesAtual()
  const [filtroLoja, setFiltroLoja] = useState('')
  const [filtroInicio, setFiltroInicio] = useState(mes.inicio)
  const [filtroFim, setFiltroFim] = useState(mes.fim)

  const filtradas = useMemo(() => initial.filter(t => {
    if (filtroLoja && String(t.loja_id) !== filtroLoja) return false
    if (filtroInicio && t.data < filtroInicio) return false
    if (filtroFim && t.data > filtroFim) return false
    return true
  }), [initial, filtroLoja, filtroInicio, filtroFim])

  const totalCredito = filtradas.filter(t => t.tipo === 'credito').reduce((a: number, t: any) => a + Number(t.valor), 0)
  const totalDebito = filtradas.filter(t => t.tipo === 'debito').reduce((a: number, t: any) => a + Number(t.valor), 0)

  // Despesas por categoria
  const despesasPorCategoria = useMemo(() => {
    const map: Record<string, number> = {}
    for (const t of filtradas.filter((t: any) => t.tipo === 'debito')) {
      const nome = t.categoria?.nome ?? 'Sem Categoria'
      map[nome] = (map[nome] ?? 0) + Number(t.valor)
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }))
  }, [filtradas])

  // Receitas por categoria
  const receitasPorCategoria = useMemo(() => {
    const map: Record<string, number> = {}
    for (const t of filtradas.filter((t: any) => t.tipo === 'credito')) {
      const nome = t.categoria?.nome ?? 'Sem Categoria'
      map[nome] = (map[nome] ?? 0) + Number(t.valor)
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }))
  }, [filtradas])

  // Por loja
  const porLoja = useMemo(() => {
    const map: Record<string, { credito: number; debito: number }> = {}
    for (const t of filtradas) {
      const nome = t.loja?.nome ?? 'Sem Loja'
      if (!map[nome]) map[nome] = { credito: 0, debito: 0 }
      if (t.tipo === 'credito') map[nome].credito += Number(t.valor)
      else map[nome].debito += Number(t.valor)
    }
    return Object.entries(map).map(([name, { credito, debito }]) => ({ name, Entradas: credito, Saídas: debito, Resultado: credito - debito }))
  }, [filtradas])

  // Por mês
  const porMes = useMemo(() => {
    const map: Record<string, { credito: number; debito: number }> = {}
    for (const t of filtradas) {
      const mes = t.data.substring(0, 7)
      if (!map[mes]) map[mes] = { credito: 0, debito: 0 }
      if (t.tipo === 'credito') map[mes].credito += Number(t.valor)
      else map[mes].debito += Number(t.valor)
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([mes, { credito, debito }]) => ({
      name: mes.substring(5) + '/' + mes.substring(2, 4),
      Entradas: credito, Saídas: debito, Resultado: credito - debito
    }))
  }, [filtradas])

  return (
    <div className="p-6 space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="text-sm text-muted-foreground mt-1">Análise financeira consolidada por período e loja</p>
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3"><Filter className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Filtros</span></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Sel value={filtroLoja} onChange={setFiltroLoja} placeholder="Todas as lojas">{lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}</Sel>
          <input type="date" value={filtroInicio} onChange={e => setFiltroInicio(e.target.value)} className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="date" value={filtroFim} onChange={e => setFiltroFim(e.target.value)} className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Entradas</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalCredito)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Saídas</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalDebito)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Resultado</p>
          <p className={`text-2xl font-bold ${totalCredito - totalDebito >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(totalCredito - totalDebito)}</p>
        </div>
      </div>

      {/* Gráfico por mês */}
      {porMes.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Evolução Mensal</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={porMes} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 26%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(210 10% 58%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(210 10% 58%)' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'hsl(0 0% 18%)', border: '1px solid hsl(0 0% 26%)', borderRadius: '8px' }} formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Entradas" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Saídas" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráficos por categoria */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {despesasPorCategoria.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Despesas por Categoria</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={despesasPorCategoria} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name.substring(0, 12)} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {despesasPorCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: 'hsl(0 0% 18%)', border: '1px solid hsl(0 0% 26%)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {porLoja.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Resultado por Loja</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={porLoja} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 26%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(210 10% 58%)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(210 10% 58%)' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'hsl(0 0% 18%)', border: '1px solid hsl(0 0% 26%)', borderRadius: '8px' }} formatter={(v: number) => formatCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Entradas" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Saídas" fill="#ef4444" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Resultado" fill="#C9A84C" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {filtradas.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Nenhum dado para o período selecionado</p>
          <p className="text-sm mt-1">Ajuste os filtros ou importe transações OFX</p>
        </div>
      )}
    </div>
  )
}

function Sel({ value, onChange, placeholder, children }: { value: string; onChange: (v: string) => void; placeholder: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-primary">
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  )
}
