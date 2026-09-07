import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FoodSearch from './FoodSearch'
import Nav from '@/components/Nav'
import { deleteFoodLog } from './actions'

export default async function FoodPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: member } = await supabase
    .from('members')
    .select('daily_calorie_target')
    .eq('id', user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]

  const { data: logs } = await supabase
    .from('food_logs')
    .select('*, foods(name, calories, protein_g, portion_label, restaurant_name)')
    .eq('member_id', user.id)
    .eq('logged_date', today)
    .order('created_at', { ascending: false })

  const totalCalories = logs?.reduce((sum, log) => sum + (log.foods?.calories || 0) * log.quantity, 0) || 0
  const totalProtein = logs?.reduce((sum, log) => sum + (log.foods?.protein_g || 0) * log.quantity, 0) || 0
  const target = member?.daily_calorie_target || 0
  const remaining = target - totalCalories

  const mealGroups: Record<string, any[]> = { breakfast: [], lunch: [], dinner: [], snack: [] }
  logs?.forEach((log) => {
    if (mealGroups[log.meal_type]) mealGroups[log.meal_type].push(log)
  })

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6 max-w-2xl mx-auto">
      <Nav backHref="/dashboard" />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-[var(--color-warn)] rounded-full" />
        <h1 className="text-3xl font-bold tracking-tight">Today's Food</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-xs text-[var(--color-text-muted)]">Calories eaten</p>
          <p className="text-2xl font-bold">{Math.round(totalCalories)}</p>
          {target > 0 && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {remaining >= 0 ? `${Math.round(remaining)} left` : `${Math.round(-remaining)} over`} of {target}
            </p>
          )}
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-xs text-[var(--color-text-muted)]">Protein</p>
          <p className="text-2xl font-bold">{Math.round(totalProtein)}g</p>
        </div>
      </div>

      {!target && (
        <div className="rounded-md bg-[var(--color-warn)]/10 border border-[var(--color-warn)]/30 p-3 mb-6 text-sm">
          Set your <a href="/profile" className="underline font-semibold">profile</a> to see your daily calorie target.
        </div>
      )}

      <FoodSearch />

      <div className="mt-6 space-y-4">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((meal) => (
          mealGroups[meal].length > 0 && (
            <div key={meal}>
              <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2 capitalize">
                {meal}
              </h3>
              <div className="space-y-2">
                {mealGroups[meal].map((log) => (
                  <div key={log.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm flex justify-between items-center">
                    <div>
                      <p>{log.foods?.name} {log.quantity !== 1 && `× ${log.quantity}`}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {Math.round((log.foods?.calories || 0) * log.quantity)} kcal
                      </p>
                    </div>
                    <form action={async () => {
                      'use server'
                      await deleteFoodLog(log.id)
                    }}>
                      <button type="submit" className="text-red-400 text-xs hover:underline">Remove</button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
        {(!logs || logs.length === 0) && (
          <p className="text-sm text-[var(--color-text-muted)]">No food logged today yet.</p>
        )}
      </div>
    </div>
  )
}