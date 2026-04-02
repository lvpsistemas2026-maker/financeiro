import { getRecebimentos, getLojas, getCategorias } from '@/actions'
import RecebimentosClient from './RecebimentosClient'

export const dynamic = 'force-dynamic'

export default async function RecebimentosPage() {
  const [recebimentos, lojas, categorias] = await Promise.all([
    getRecebimentos({}).catch(() => []),
    getLojas().catch(() => []),
    getCategorias('entrada').catch(() => []),
  ])
  return <RecebimentosClient recebimentos={recebimentos} lojas={lojas} categorias={categorias} />
}
