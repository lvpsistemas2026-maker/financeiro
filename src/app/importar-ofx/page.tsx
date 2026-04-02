import { getLojas, getCategorias } from '@/actions'
import ImportarOFXClient from './ImportarOFXClient'

export const dynamic = 'force-dynamic'

export default async function ImportarOFXPage() {
  const [lojas, categorias] = await Promise.all([
    getLojas().catch(() => []),
    getCategorias().catch(() => []),
  ])
  return <ImportarOFXClient lojas={lojas} categorias={categorias} />
}
