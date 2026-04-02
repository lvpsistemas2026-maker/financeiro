import { getDashboardResumo, getResumoPorLoja, getSaldoDiario, getLojas } from '@/actions'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [resumo, resumoPorLoja, saldoDiario, lojas] = await Promise.all([
    getDashboardResumo().catch(() => null),
    getResumoPorLoja().catch(() => []),
    getSaldoDiario(undefined, 30).catch(() => []),
    getLojas().catch(() => []),
  ])

  return (
    <DashboardClient
      resumo={resumo}
      resumoPorLoja={resumoPorLoja}
      saldoDiario={saldoDiario}
      lojas={lojas}
    />
  )
}
