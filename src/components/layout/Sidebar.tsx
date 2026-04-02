'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Upload, ArrowDownUp, CreditCard, TrendingDown,
  TrendingUp, CalendarClock, CalendarCheck, Tag, BarChart3, Menu, X, Building2
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { group: 'PRINCIPAL', items: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/importar-ofx', label: 'Importar Extrato', icon: Upload },
    { href: '/transacoes', label: 'Transações', icon: ArrowDownUp },
  ]},
  { group: 'OPERACIONAL', items: [
    { href: '/pagamentos', label: 'Pagamentos', icon: TrendingDown },
    { href: '/recebimentos', label: 'Recebimentos', icon: TrendingUp },
  ]},
  { group: 'PREVISÃO', items: [
    { href: '/pagamentos-futuros', label: 'Pag. Futuros', icon: CalendarClock },
    { href: '/recebimentos-futuros', label: 'Rec. Futuros', icon: CalendarCheck },
  ]},
  { group: 'CONFIGURAÇÃO', items: [
    { href: '/categorias', label: 'Categorias', icon: Tag },
    { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  ]},
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-black" />
        </div>
        <div>
          <p className="font-bold text-sm text-foreground leading-none">LVP</p>
          <p className="text-xs text-muted-foreground mt-0.5">Sistema Financeiro</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navItems.map(({ group, items }) => (
          <div key={group}>
            <p className="text-[10px] font-semibold text-muted-foreground tracking-wider px-2 mb-1.5">{group}</p>
            <ul className="space-y-0.5">
              {items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150',
                        active
                          ? 'bg-primary/15 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-primary' : '')} />
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground">
          Muzambinho · Guaxupé · Poços de Caldas
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border border-border text-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-56 bg-sidebar border-r border-sidebar-border h-full z-10">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
