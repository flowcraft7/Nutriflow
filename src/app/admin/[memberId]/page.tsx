import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import AssignPlanForm from './AssignPlanForm'
import GenerateAIPlanForm from './GenerateAIPlanForm'

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

  const { data: plans } = await supabase
    .from('diet_plans')
    .select('*, diet_plan_foods(*, foods(name, portion_label))')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6 max-w-4xl mx-auto">
      <Nav backHref="/admin" backLabel="Admin" />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 bg-[var(--color-accent)] rounded-full" />
        <h1 className="text-3xl font-bold tracking-tight">{member?.full_name || 'Client'}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {plans && plans.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
                Existing Plans
              </h2>
              <div className="space-y-2">
                {plans.map((plan) => {
                  const dayGroups: Record<string, any[]> = {}
                  plan.diet_plan_foods?.forEach((pf: any) => {
                    const day = pf.day_label || 'Unassigned'
                    if (!dayGroups[day]) dayGroups[day] = []
                    dayGroups[day].push(pf)
                  })

                  return (
                    <details key={plan.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm group">
                      <summary className="font-semibold cursor-pointer flex items-center justify-between">
                        <span>{plan.title}</span>
                        <span className="text-xs text-[var(--color-text-muted)] font-normal">{plan.diet_plan_foods?.length || 0} items</span>
                      </summary>
                      {plan.notes && <p className="text-xs text-[var(--color-text-muted)] mt-2">{plan.notes}</p>}
                      <div className="mt-3 space-y-3">
                        {Object.entries(dayGroups).map(([day, items]) => (
                          <div key={day}>
                            <p className="text-xs font-semibold text-[var(--color-accent)] mb-1">{day}</p>
                            <ul className="space-y-1">
                              {items.map((pf: any) => (
                                <li key={pf.id} className="text-xs text-[var(--color-text-muted)] flex justify-between">
                                  <span>{pf.foods?.name} ({pf.meal_type})</span>
                                  <span>{pf.quantity} × {pf.foods?.portion_label}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        {(!plan.diet_plan_foods || plan.diet_plan_foods.length === 0) && (
                          <p className="text-xs text-[var(--color-text-muted)]">No items in this plan.</p>
                        )}
                      </div>
                    </details>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <GenerateAIPlanForm memberId={memberId} />
          <AssignPlanForm memberId={memberId} />
        </div>
      </div>
    </div>
  )
}