import { getCategorias } from '@/actions'
import CategoriasClient from './CategoriasClient'

export const dynamic = 'force-dynamic'

export default async function CategoriasPage() {
  const categorias = await getCategorias().catch(() => [])
  return <CategoriasClient categorias={categorias} />
}
