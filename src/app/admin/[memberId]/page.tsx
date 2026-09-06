import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ memberId: string }>
}) {
  const { memberId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: currentMember } = await supabase
    .from('members')
    .select('role, clinic_id')
    .eq('id', user.id)
    .single()

  if (!currentMember || currentMember.role !== 'admin') redirect('/dashboard')

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('id', memberId)
    .single()

  const { data: weightLogs } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('member_id', memberId)
    .order('logged_date', { ascending: false })

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6 max-w-4xl mx-auto">
      <Nav backHref="/admin" backLabel="Admin" />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 bg-[var(--color-accent)] rounded-full" />
        <h1 className="text-3xl font-bold tracking-tight">{member?.full_name || 'Member'}</h1>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
          Weight Log
        </h2>
        <div className="space-y-2">
          {weightLogs?.map((log) => (
            <div
              key={log.id}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm flex justify-between"
            >
              <span className="text-[var(--color-text-muted)]">{new Date(log.logged_date).toLocaleDateString()}</span>
              <span>{log.weight_kg} kg</span>
            </div>
          ))}
          {(!weightLogs || weightLogs.length === 0) && (
            <p className="text-[var(--color-text-muted)] text-sm">No logs yet.</p>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-dashed border-[var(--color-border)] p-5 text-sm text-[var(--color-text-muted)]">
        Diet plan assignment coming soon.
      </div>
    </div>
  )
}