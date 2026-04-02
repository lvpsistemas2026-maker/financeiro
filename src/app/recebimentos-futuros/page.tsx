import { getRecebimentosFuturos, getLojas, getCategorias } from '@/actions'
import RecebimentosFuturosClient from './RecebimentosFuturosClient'

export const dynamic = 'force-dynamic'

export default async function RecebimentosFuturosPage() {
  const [recebimentos, lojas, categorias] = await Promise.all([
    getRecebimentosFuturos({}).catch(() => []),
    getLojas().catch(() => []),
    getCategorias('entrada').catch(() => []),
  ])
  return <RecebimentosFuturosClient recebimentos={recebimentos} lojas={lojas} categorias={categorias} />
}
