'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Overview', icon: '📊' },
    { href: '/dashboard/reviews', label: 'Reviews', icon: '🔍' },
    { href: '/dashboard/memory', label: 'Memory', icon: '🧠' },
    { href: '/dashboard/digest', label: 'Digest', icon: '📋' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ]

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <aside className="w-56 border-r border-white/10 flex flex-col p-4 gap-1 fixed h-full">
                <div className="flex items-center gap-2 px-2 py-3 mb-6">
                    <span className="text-lg">🤖</span>
                    <span className="font-semibold text-white">PR Review Agent</span>
                </div>

                <nav className="flex flex-col gap-1">
                    {links.map((item) => {
                        const active = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active
                                        ? 'bg-white/10 text-white font-medium'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="text-base">{item.icon}</span>
                                <span>{item.label}</span>
                                {active && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom */}
                <div className="mt-auto px-3 py-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-white/30 text-xs">Agent running</span>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="ml-56 flex-1 p-8 min-h-screen">
                {children}
            </main>
        </div>
    );
}