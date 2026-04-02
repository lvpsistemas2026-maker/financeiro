import { getPagamentos, getLojas, getCategorias } from '@/actions'
import PagamentosClient from './PagamentosClient'

export const dynamic = 'force-dynamic'

export default async function PagamentosPage() {
  const [pagamentos, lojas, categorias] = await Promise.all([
    getPagamentos({}).catch(() => []),
    getLojas().catch(() => []),
    getCategorias('saida').catch(() => []),
  ])
  return <PagamentosClient pagamentos={pagamentos} lojas={lojas} categorias={categorias} />
}
