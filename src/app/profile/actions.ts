'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function calculateCalorieTarget({
  age,
  gender,
  heightCm,
  weightKg,
  activityLevel,
  goal,
}: {
  age: number
  gender: string
  heightCm: number
  weightKg: number
  activityLevel: string
  goal: string
}) {
  const bmr =
    gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2)

  const goalAdjustments: Record<string, number> = {
    maintain: 0,
    lose: -500,
    gain: 300,
  }

  return Math.round(tdee + (goalAdjustments[goal] || 0))
}

export async function updateProfile(data: {
  age: number
  gender: string
  heightCm: number
  weightKg: number
  activityLevel: string
  goal: string
  targetWeightKg: number | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const dailyCalorieTarget = calculateCalorieTarget({
    age: data.age,
    gender: data.gender,
    heightCm: data.heightCm,
    weightKg: data.weightKg,
    activityLevel: data.activityLevel,
    goal: data.goal,
  })

  const { error } = await supabase
    .from('members')
    .update({
      age: data.age,
      gender: data.gender,
      height_cm: data.heightCm,
      weight_kg: data.weightKg,
      activity_level: data.activityLevel,
      goal: data.goal,
      target_weight_kg: data.targetWeightKg,
      daily_calorie_target: dailyCalorieTarget,
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  revalidatePath('/food')
  return { success: true, dailyCalorieTarget }
}