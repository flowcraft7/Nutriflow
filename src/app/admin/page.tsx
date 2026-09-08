import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminMemberTable from './AdminMemberTable'
import AddMemberForm from './AddMemberForm'
import AnnouncementBoard from './AnnouncementBoard'
import RevenuePanel from './RevenuePanel'
import Nav from '@/components/Nav'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: currentMember } = await supabase
    .from('members')
    .select('role, clinic_id')
    .eq('id', user.id)
    .single()

  if (!currentMember || currentMember.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', currentMember.clinic_id)
    .single()

  const { data: members } = await supabase
    .from('members')
    .select('id, full_name, role, created_at, subscription_status, subscription_expires_on')
    .eq('clinic_id', currentMember.clinic_id)
    .order('created_at', { ascending: false })

  const { data: recentLogs } = await supabase
    .from('food_logs')
    .select('member_id, logged_date')
    .in('member_id', members?.map((m) => m.id) || [])
    .gte('logged_date', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])

  const activityCount: Record<string, number> = {}
  recentLogs?.forEach((r) => {
    activityCount[r.member_id] = (activityCount[r.member_id] || 0) + 1
  })

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('clinic_id', currentMember.clinic_id)
    .order('created_at', { ascending: false })

  const today = new Date().toISOString().split('T')[0]
  const activeCount =
    members?.filter((m) => {
      if (m.subscription_expires_on && m.subscription_expires_on < today) return false
      return m.subscription_status === 'active'
    }).length || 0

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6 max-w-6xl mx-auto">
      <Nav backHref="/dashboard" />

      <div className="flex items-center gap-3 mb-1">
        <div className="w-1 h-8 bg-[var(--color-accent)] rounded-full" />
        <h1 className="text-3xl font-bold tracking-tight">{clinic?.name} — Admin</h1>
      </div>
      <p className="text-[var(--color-text-muted)] mb-6 ml-4">{members?.length || 0} members</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <RevenuePanel currentPrice={clinic?.price_per_member || 0} activeCount={activeCount} />
        <AddMemberForm />
      </div>

      <AnnouncementBoard announcements={announcements || []} />

      <div className="mt-6">
        <AdminMemberTable members={members || []} activityCount={activityCount} />
      </div>
    </div>
  )
}