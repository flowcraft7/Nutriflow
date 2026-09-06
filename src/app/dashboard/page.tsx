import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentClinic } from '@/lib/get-current-clinic'
import Nav from '@/components/Nav'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const clinic = await getCurrentClinic()

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('clinic_id', member?.clinic_id)
    .order('created_at', { ascending: false })
    .limit(5)

  const welcomeName = member?.full_name ? `, ${member.full_name}` : ''

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6 max-w-4xl mx-auto">
      <Nav clinicName={clinic?.name} />

      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-[var(--color-accent)] rounded-full" />
        <h1 className="text-3xl font-bold tracking-tight">Welcome{welcomeName}</h1>
      </div>

      {announcements && announcements.length > 0 && (
        <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h2 className="font-semibold mb-3 text-sm text-[var(--color-text-muted)]">Announcements</h2>
          <div className="space-y-2">
            {announcements.map((a) => (
              <div key={a.id} className="text-sm bg-[var(--color-bg)] rounded-md p-3 border-l-2 border-[var(--color-accent)]">
                <p>{a.message}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {new Date(a.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <a
          href="/food"
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:bg-[#1d1d1b] hover:border-[var(--color-warn)] hover:-translate-y-0.5 transition-all"
        >
          <div className="w-9 h-9 rounded-md bg-[var(--color-warn)]/15 flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-warn)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z" />
              <line x1="6" x2="6" y1="1" y2="4" />
              <line x1="10" x2="10" y1="1" y2="4" />
              <line x1="14" x2="14" y1="1" y2="4" />
            </svg>
          </div>
          <h2 className="font-semibold">Food Log</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Log meals & track daily calories</p>
        </a>

        <a
          href="/diet-plans"
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:bg-[#1d1d1b] hover:border-[var(--color-accent)] hover:-translate-y-0.5 transition-all"
        >
          <div className="w-9 h-9 rounded-md bg-[var(--color-accent)]/15 flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <h2 className="font-semibold">Diet Plans</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Your calorie target & assigned plans</p>
        </a>

        <a
          href="/progress"
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:bg-[#1d1d1b] hover:border-[var(--color-positive)] hover:-translate-y-0.5 transition-all"
        >
          <div className="w-9 h-9 rounded-md bg-[var(--color-positive)]/15 flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-positive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
            </svg>
          </div>
          <h2 className="font-semibold">Progress</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Weight, steps & trend</p>
        </a>

        {member?.role === 'admin' && (
          <a
            href="/admin"
            className="rounded-lg border border-[var(--color-accent)] bg-[var(--color-surface)] p-5 hover:bg-[#1d1d1b] hover:-translate-y-0.5 transition-all"
          >
            <div className="w-9 h-9 rounded-md bg-[var(--color-accent)] flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 className="font-semibold text-[var(--color-accent)]">Admin Panel</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Manage clinic members</p>
          </a>
        )}
      </div>
    </div>
  )
}