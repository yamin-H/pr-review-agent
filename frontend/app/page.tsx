import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
    const GITHUB_APP_INSTALL_URL = `https://github.com/apps/pr-review-agent/installations/new`;
    const GITHUB_OAUTH_URL = `https://pr-review-agent-9q1e.onrender.com/auth/github`;

    return (
        <main className="min-h-screen bg-black text-white">
            {/* Nav */}
            <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <span className="font-semibold text-lg">PR Review Agent</span>
                </div>
                <a href={GITHUB_OAUTH_URL}>
                    <Button variant="outline" className="border-white/20 text-black hover:bg-white/10 cursor-pointer hover:text-gray-200 transition-all duration-200">
                        Sign in with GitHub
                    </Button>
                </a>
            </nav>

            {/* Hero */}
            <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/60 mb-8">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Now in beta
                </div>

                <h1 className="text-5xl font-bold leading-tight mb-6">
                    Your team's collective<br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">
                        code review knowledge,
                    </span>
                    <br />automated.
                </h1>

                <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
                    A GitHub App that reviews every Pull Request using your team's own history as context.
                    Not generic best practices — your team's actual decisions.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <a href={GITHUB_APP_INSTALL_URL}>
                        <Button size="lg" className="bg-white text-black hover:bg-white/90 font-semibold px-8">
                            Install on GitHub
                        </Button>
                    </a>
                    <Link href="/dashboard">
                        <Button size="lg" variant="outline" className="border-white/20 text-black hover:bg-white/10 cursor-pointer hover:text-gray-200 transition-all duration-200">
                            View Dashboard
                        </Button>
                    </Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16">
                <h2 className="text-2xl font-semibold text-center mb-12">How it works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            step: '01',
                            title: 'Install the GitHub App',
                            desc: 'Connect your repos. The agent analyzes 6 months of PR history to build your team\'s memory.'
                        },
                        {
                            step: '02',
                            title: 'Agent reviews every PR',
                            desc: 'When a PR opens, the agent searches past decisions and gives feedback specific to your team.'
                        },
                        {
                            step: '03',
                            title: 'Gets smarter over time',
                            desc: 'Every approve or dismiss trains the agent. Weekly digest shows what it learned.'
                        }
                    ].map((item) => (
                        <div key={item.step} className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="text-4xl font-bold text-white/10 mb-3">{item.step}</div>
                            <h3 className="font-semibold mb-2">{item.title}</h3>
                            <p className="text-white/50 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-6 py-16">
                <h2 className="text-2xl font-semibold text-center mb-10">Why not CodeRabbit?</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-3 text-sm font-medium border-b border-white/10">
                        <div className="px-6 py-3 text-white/40"></div>
                        <div className="px-6 py-3 text-white/40 text-center">CodeRabbit</div>
                        <div className="px-6 py-3 text-center text-blue-400">PR Review Agent</div>
                    </div>
                    {[
                        ['Memory of past decisions', false, true],
                        ['Team-specific feedback', false, true],
                        ['Learns from dismissals', false, true],
                        ['Weekly digest', false, true],
                        ['Generic best practices', true, true],
                    ].map(([label, cr, pra]) => (
                        <div key={String(label)} className="grid grid-cols-3 border-b border-white/5 text-sm">
                            <div className="px-6 py-3 text-white/70">{String(label)}</div>
                            <div className="px-6 py-3 text-center">{cr ? '✓' : '✗'}</div>
                            <div className="px-6 py-3 text-center text-blue-400">{pra ? '✓' : '✗'}</div>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="border-t border-white/10 px-6 py-8 text-center text-white/30 text-sm">
                PR Review Agent — Built with LangGraph + pgvector
            </footer>
        </main>
    );
}