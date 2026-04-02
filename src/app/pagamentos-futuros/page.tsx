import { getPagamentosFuturos, getLojas, getCategorias } from '@/actions'
import PagamentosFuturosClient from './PagamentosFuturosClient'

export const dynamic = 'force-dynamic'

export default async function PagamentosFuturosPage() {
  const [pagamentos, lojas, categorias] = await Promise.all([
    getPagamentosFuturos({}).catch(() => []),
    getLojas().catch(() => []),
    getCategorias('saida').catch(() => []),
  ])
  return <PagamentosFuturosClient pagamentos={pagamentos} lojas={lojas} categorias={categorias} />
}
