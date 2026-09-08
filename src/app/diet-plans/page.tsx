import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'

function calculateMacros(calorieTarget: number, weightKg: number) {
  const proteinG = Math.round(weightKg * 1.6)
  const proteinCals = proteinG * 4

  const fatCals = calorieTarget * 0.25
  const fatG = Math.round(fatCals / 9)

  const carbCals = calorieTarget - proteinCals - fatCals
  const carbG = Math.round(Math.max(carbCals, 0) / 4)

  return { proteinG, fatG, carbG }
}

export default async function DietPlansPage() {
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

  const { data: plans } = await supabase
    .from('diet_plans')
    .select('*, diet_plan_foods(*, foods(name, calories, portion_label))')
    .eq('member_id', user.id)
    .order('created_at', { ascending: false })

  const macros =
    member?.daily_calorie_target && member?.weight_kg
      ? calculateMacros(member.daily_calorie_target, member.weight_kg)
      : null

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6 max-w-2xl mx-auto">
      <Nav backHref="/dashboard" />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-[var(--color-accent)] rounded-full" />
        <h1 className="text-3xl font-bold tracking-tight">Diet Plans</h1>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 mb-6">
        <p className="text-sm text-[var(--color-text-muted)]">Your daily calorie target</p>
        {member?.daily_calorie_target ? (
          <>
            <p className="text-3xl font-bold text-[var(--color-accent)] mt-1">{member.daily_calorie_target} kcal</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Goal: <span className="capitalize">{member.goal?.replace('_', ' ')}</span>
            </p>

            {macros && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="rounded-md bg-[var(--color-bg)] p-3 text-center">
                  <p className="text-lg font-bold text-[var(--color-positive)]">{macros.proteinG}g</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Protein</p>
                </div>
                <div className="rounded-md bg-[var(--color-bg)] p-3 text-center">
                  <p className="text-lg font-bold text-[var(--color-warn)]">{macros.carbG}g</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Carbs</p>
                </div>
                <div className="rounded-md bg-[var(--color-bg)] p-3 text-center">
                  <p className="text-lg font-bold text-[var(--color-accent)]">{macros.fatG}g</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Fat</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm mt-2">
            Not set yet — go to your <a href="/profile" className="underline font-semibold text-[var(--color-accent)]">profile</a> to calculate it.
          </p>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
          Assigned Plans
        </h2>
        <div className="space-y-3">
          {plans?.map((plan) => (
            <div key={plan.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <p className="font-semibold">{plan.title}</p>
              {plan.notes && <p className="text-sm text-[var(--color-text-muted)] mt-1">{plan.notes}</p>}
              <ul className="text-sm text-[var(--color-text-muted)] mt-2 space-y-1">
                {plan.diet_plan_foods?.map((pf: any) => (
                  <li key={pf.id}>
                    {pf.foods?.name} — {pf.quantity} × {pf.foods?.portion_label} ({pf.meal_type})
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {(!plans || plans.length === 0) && (
            <p className="text-sm text-[var(--color-text-muted)]">
              No plan assigned yet — track your own meals from the Food Log in the meantime.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}