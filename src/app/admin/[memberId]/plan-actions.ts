'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function searchFoodsForPlan(query: string) {
  const supabase = await createClient()

  if (!query || query.length < 2) return []

  const { data } = await supabase
    .from('foods')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(10)

  return data || []
}

async function requireAdminClinicId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('members')
    .select('role, clinic_id')
    .eq('id', user.id)
    .single()

  if (!member || member.role !== 'admin') return null
  return member.clinic_id
}

export async function assignDietPlan({
  memberId,
  title,
  notes,
  items,
}: {
  memberId: string
  title: string
  notes: string
  items: { foodId: string; quantity: number; mealType: string }[]
}) {
  const clinicId = await requireAdminClinicId()
  if (!clinicId) return { error: 'Not authorized' }

  const supabase = await createClient()

  const { data: plan, error: planError } = await supabase
    .from('diet_plans')
    .insert({ member_id: memberId, title, notes })
    .select()
    .single()

  if (planError || !plan) {
    return { error: planError?.message || 'Failed to create plan' }
  }

  const rows = items.map((item) => ({
    diet_plan_id: plan.id,
    food_id: item.foodId,
    quantity: item.quantity,
    meal_type: item.mealType,
  }))

  const { error: itemsError } = await supabase.from('diet_plan_foods').insert(rows)

  if (itemsError) {
    return { error: itemsError.message }
  }

  revalidatePath(`/admin/${memberId}`)
  revalidatePath('/diet-plans')
  return { success: true }
}