'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  TrendingUp, TrendingDown, Wallet, CalendarClock, CalendarCheck,
  RefreshCw, Building2, AlertTriangle
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { seedDadosIniciais, getDashboardResumo, getResumoPorLoja, getSaldoDiario } from '@/actions'
import type { ResumoDashboard, ResumoLoja, SaldoDiario, Loja } from '@/types'

interface Props {
  resumo: ResumoDashboard | null
  resumoPorLoja: ResumoLoja[]
  saldoDiario: SaldoDiario[]
  lojas: Loja[]
}

const GOLD = '#C9A84C'
const GREEN = '#10b981'
const RED = '#ef4444'

export default function DashboardClient({ resumo, resumoPorLoja, saldoDiario, lojas }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const handleSeed = () => {
    startTransition(async () => {
      try {
        const result = await seedDadosIniciais()
        toast.success(result.message)
        router.refresh()
      } catch {
        toast.error('Erro ao inicializar o sistema')
      }
    })
  }

  const r = resumo ?? {
    saldoTotal: 0,
    mes: { totalCredito: 0, totalDebito: 0, resultado: 0 },
    pagamentosFuturos: { total: 0, count: 0, vencidos: 0 },
    recebimentosFuturos: { total: 0, count: 0 },
  }

  const chartData = saldoDiario.map(s => ({
    data: formatDate(s.data).substring(0, 5),
    Entradas: s.credito,
    Saídas: s.debito,
    Saldo: s.saldoAcumulado,
  }))

  const lojaData = resumoPorLoja.map(l => ({
    name: l.loja.nome.split(' ')[0],
    Entradas: l.totalCredito,
    Saídas: l.totalDebito,
    Resultado: l.saldo,
  }))

  return (
    <div className="p-6 space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground capitalize">{hoje}</p>
        </div>
        <div className="flex items-center gap-3">
          {lojas.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
              Inicializar Sistema
            </button>
          )}
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Saldo Total"
          value={formatCurrency(r.saldoTotal)}
          sub="Acumulado geral"
          icon={<Wallet className="w-5 h-5" />}
          color="gold"
        />
        <StatCard
          label="Entradas (Mês)"
          value={formatCurrency(r.mes.totalCredito)}
          sub="Créditos no mês atual"
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Saídas (Mês)"
          value={formatCurrency(r.mes.totalDebito)}
          sub="Débitos no mês atual"
          icon={<TrendingDown className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          label="Resultado (Mês)"
          value={formatCurrency(r.mes.resultado)}
          sub="Entradas − Saídas"
          icon={<Wallet className="w-5 h-5" />}
          color={r.mes.resultado >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Cards futuros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <CalendarClock className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Pag. Futuros Pendentes</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{formatCurrency(r.pagamentosFuturos.total)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {r.pagamentosFuturos.count} pagamentos pendentes
              {r.pagamentosFuturos.vencidos > 0 && (
                <span className="ml-2 text-red-400 font-medium">
                  · {r.pagamentosFuturos.vencidos} vencido(s)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Rec. Futuros Pendentes</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{formatCurrency(r.recebimentosFuturos.total)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{r.recebimentosFuturos.count} recebimentos pendentes</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Evolução do saldo */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Evolução do Saldo (últimos 30 dias)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 26%)" />
                <XAxis dataKey="data" tick={{ fontSize: 11, fill: 'hsl(210 10% 58%)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(210 10% 58%)' }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(0 0% 18%)', border: '1px solid hsl(0 0% 26%)', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(210 20% 94%)' }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Area type="monotone" dataKey="Saldo" stroke={GOLD} fill="url(#gradSaldo)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center">
                <Wallet className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Nenhuma transação encontrada</p>
                <p className="text-xs mt-1">Importe um extrato OFX para começar</p>
              </div>
            </div>
          )}
        </div>

        {/* Resultado por loja */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Resultado por Loja (Mês)</h3>
          {lojaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={lojaData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 26%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(210 10% 58%)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(210 10% 58%)' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(0 0% 18%)', border: '1px solid hsl(0 0% 26%)', borderRadius: '8px' }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Entradas" fill={GREEN} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Saídas" fill={RED} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Sem dados por loja</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color }: {
  label: string; value: string; sub: string; icon: React.ReactNode; color: 'gold' | 'green' | 'red'
}) {
  const colorMap = {
    gold: { bg: 'bg-amber-500/10', text: 'text-amber-400', val: 'text-gold' },
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', val: 'text-emerald-400' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', val: 'text-red-400' },
  }
  const c = colorMap[color]
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center ${c.text}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  )
}
