import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'
import Nav from '@/components/Nav'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6 max-w-2xl mx-auto">
      <Nav backHref="/dashboard" />

      <div className="flex items-center gap-3 mb-2">
        <div className="w-1 h-8 bg-[var(--color-accent)] rounded-full" />
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
      </div>
      <p className="text-[var(--color-text-muted)] mb-6 ml-4 text-sm">
        Used to calculate your daily calorie target
      </p>

      {member?.daily_calorie_target && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 mb-6">
          <p className="text-sm text-[var(--color-text-muted)]">Current daily target</p>
          <p className="text-3xl font-bold text-[var(--color-positive)]">{member.daily_calorie_target} kcal</p>
        </div>
      )}

      <ProfileForm member={member} />
    </div>
  )
}