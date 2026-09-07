'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function searchFoods(query: string) {
  const supabase = await createClient()

  if (!query || query.length < 2) return []

  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(15)

  if (error) return []
  return data
}

export async function logFood(foodId: string, quantity: number, mealType: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase.from('food_logs').insert({
    member_id: user.id,
    food_id: foodId,
    quantity,
    meal_type: mealType,
    logged_date: new Date().toISOString().split('T')[0],
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/food')
  return { success: true }
}

export async function deleteFoodLog(logId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('id', logId)
    .eq('member_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/food')
  return { success: true }
}