import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return d.toLocaleDateString('pt-BR')
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getMesAtual(): { inicio: string; fim: string } {
  const hoje = new Date()
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
  return {
    inicio: formatDateISO(inicio),
    fim: formatDateISO(fim),
  }
}

export function getHoje(): string {
  return formatDateISO(new Date())
}

export function isVencido(dataVencimento: string): boolean {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dataVencimento + 'T00:00:00')
  return venc < hoje
}

export function diasParaVencer(dataVencimento: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dataVencimento + 'T00:00:00')
  const diff = venc.getTime() - hoje.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Parser OFX
export function parseOFX(content: string): Array<{
  fitId: string
  data: string
  valor: number
  tipo: 'credito' | 'debito'
  descricao: string
}> {
  const transacoes: Array<{
    fitId: string
    data: string
    valor: number
    tipo: 'credito' | 'debito'
    descricao: string
  }> = []

  const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi
  let match

  while ((match = stmtTrnRegex.exec(content)) !== null) {
    const block = match[1]
    const dtposted = (block.match(/<DTPOSTED>([^<\s]+)/i)?.[1] ?? '').trim().substring(0, 8)
    const trnamt = (block.match(/<TRNAMT>([^<\s]+)/i)?.[1] ?? '').trim().replace(',', '.')
    const memo = (block.match(/<MEMO>([^<]*)/i)?.[1] ?? '').trim()
    const fitId = (block.match(/<FITID>([^<\s]+)/i)?.[1] ?? '').trim()

    if (!dtposted || !trnamt) continue

    const year = dtposted.substring(0, 4)
    const month = dtposted.substring(4, 6)
    const day = dtposted.substring(6, 8)
    const data = `${year}-${month}-${day}`

    const valorNum = parseFloat(trnamt)
    if (isNaN(valorNum)) continue

    const tipo: 'credito' | 'debito' = valorNum >= 0 ? 'credito' : 'debito'
    const valor = Math.abs(valorNum)

    transacoes.push({ fitId, data, descricao: memo || 'Sem descrição', valor, tipo })
  }

  return transacoes
}

// Classificação automática por palavras-chave
export function classificarTransacao(
  descricao: string,
  categorias: Array<{ id: number; nome: string; palavras_chave: string | null; tipo: string }>,
  tipo: 'credito' | 'debito'
): number | null {
  const desc = descricao.toLowerCase()
  const categoriasDoTipo = categorias.filter(
    (c) => c.tipo === (tipo === 'credito' ? 'entrada' : 'saida')
  )

  for (const cat of categoriasDoTipo) {
    if (!cat.palavras_chave) continue
    const palavras = cat.palavras_chave.toLowerCase().split(',').map((p) => p.trim())
    for (const palavra of palavras) {
      if (palavra && desc.includes(palavra)) {
        return cat.id
      }
    }
  }

  return null
}
