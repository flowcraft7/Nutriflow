import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProgressLogger from './ProgressLogger'
import ProgressChart from './ProgressChart'
import Nav from '@/components/Nav'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: logs } = await supabase
    .from('progress_logs')
    .select('*')
    .eq('member_id', user.id)
    .order('logged_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6 max-w-4xl mx-auto">
      <Nav backHref="/dashboard" />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 bg-[var(--color-positive)] rounded-full" />
        <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
      </div>

      <ProgressLogger />

      {logs && logs.length > 0 && (
        <div className="mt-8">
          <ProgressChart logs={logs} />
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
          Weight/Steps History
        </h2>
        <div className="space-y-2">
          {logs?.slice().reverse().map((log) => (
            <div
              key={log.id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm flex justify-between"
            >
              <span className="text-[var(--color-text-muted)]">
                {new Date(log.logged_at).toLocaleDateString()}
              </span>
              <span>
                {log.weight_kg ? `${log.weight_kg} kg` : ''}
                {log.weight_kg && log.steps ? ' · ' : ''}
                {log.steps ? `${log.steps} steps` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}