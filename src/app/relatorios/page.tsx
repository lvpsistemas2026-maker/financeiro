import { getTransacoes, getLojas, getCategorias } from '@/actions'
import RelatoriosClient from './RelatoriosClient'

export const dynamic = 'force-dynamic'

export default async function RelatoriosPage() {
  const [transacoes, lojas, categorias] = await Promise.all([
    getTransacoes({}).catch(() => []),
    getLojas().catch(() => []),
    getCategorias().catch(() => []),
  ])
  return <RelatoriosClient transacoes={transacoes} lojas={lojas} categorias={categorias} />
}
