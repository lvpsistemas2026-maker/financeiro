import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'LVP — Sistema Financeiro',
  description: 'Sistema de gestão financeira para as lojas LVP',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(0 0% 18%)',
              border: '1px solid hsl(0 0% 26%)',
              color: 'hsl(210 20% 94%)',
            },
          }}
        />
      </body>
    </html>
  )
}
