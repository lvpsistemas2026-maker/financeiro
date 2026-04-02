import { getTransacoes, getLojas, getCategorias } from '@/actions'
import TransacoesClient from './TransacoesClient'

export const dynamic = 'force-dynamic'

export default async function TransacoesPage() {
  const [transacoes, lojas, categorias] = await Promise.all([
    getTransacoes({}).catch(() => []),
    getLojas().catch(() => []),
    getCategorias().catch(() => []),
  ])
  return <TransacoesClient transacoes={transacoes} lojas={lojas} categorias={categorias} />
}
