'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

function extractJson(raw: string): any {
  let cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim()

  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('No JSON object found in AI response')
  }

  const jsonSlice = cleaned.slice(firstBrace, lastBrace + 1)
  return JSON.parse(jsonSlice)
}

export async function generateAIDietPlan({
  memberId,
  minCalories,
  maxCalories,
  targetProtein,
  weeklyBudgetPkr,
  title,
}: {
  memberId: string
  minCalories: number
  maxCalories: number
  targetProtein: number
  weeklyBudgetPkr: number
  title: string
}) {
  const clinicId = await requireAdminClinicId()
  if (!clinicId) return { error: 'Not authorized' }

  const supabase = await createClient()

  const { data: foods } = await supabase
    .from('foods')
    .select('id, name, category, restaurant_name, portion_label, calories, protein_g, carbs_g, fat_g, price_pkr')
    .limit(200)

  if (!foods || foods.length === 0) {
    return { error: 'No foods in database to build a plan from.' }
  }

  const foodList = foods
    .map((f) => `id:${f.id} | ${f.name}${f.restaurant_name ? ` (${f.restaurant_name})` : ''} | ${f.portion_label} | ${f.calories}kcal | ${f.protein_g}g protein | Rs${f.price_pkr}/portion`)
    .join('\n')

  const dailyBudget = Math.round(weeklyBudgetPkr / 7)

  const prompt = `You are a nutrition planner for a Pakistani diet clinic. Build a 7-day meal plan using ONLY the foods listed below (use their exact "id" values).

Constraints for EACH day:
- Total calories between ${minCalories} and ${maxCalories}
- Approximately ${targetProtein}g protein
- Total food cost should not exceed Rs${dailyBudget} (this is a daily portion of a Rs${weeklyBudgetPkr} weekly budget) — prefer cheaper home_food items over expensive restaurant items to stay within budget, and only use restaurant items occasionally if budget allows.

Vary the foods across days for variety. Each day should have breakfast, lunch, dinner, and optionally a snack.

Available foods (with price per portion in PKR):
${foodList}

Respond with ONLY a raw JSON object. Do not include any explanation, markdown formatting, or code fences — just the JSON itself, starting with { and ending with }. Use this exact structure:
{
  "days": [
    {
      "day_label": "Day 1",
      "items": [
        { "food_id": "<uuid from list above>", "quantity": 1, "meal_type": "breakfast" }
      ]
    }
  ]
}`

  let aiResponse
  try {
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: 'You are a JSON API. You only respond with valid, complete JSON objects. Never include explanations, markdown, or reasoning text outside the JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 4000,
    })
    aiResponse = completion.choices[0]?.message?.content || ''
  } catch (err: any) {
    return { error: `AI generation failed: ${err.message}` }
  }

  if (!aiResponse || aiResponse.trim().length === 0) {
    return { error: 'AI returned an empty response. This can happen with tight constraints — try widening the calorie range or budget, then try again.' }
  }

  let parsed
  try {
    parsed = extractJson(aiResponse)
  } catch {
    return { error: `AI returned invalid format. Raw response started with: "${aiResponse.slice(0, 150)}..." — try again.` }
  }

  const foodMap = new Map(foods.map((f) => [f.id, f]))
  const rows: { diet_plan_id: string; food_id: string; quantity: number; meal_type: string; day_label: string }[] = []

  let totalCost = 0
  let totalCalories = 0

  for (const day of parsed.days || []) {
    for (const item of day.items || []) {
      const food = foodMap.get(item.food_id)
      if (food) {
        const qty = item.quantity || 1
        rows.push({
          diet_plan_id: '',
          food_id: item.food_id,
          quantity: qty,
          meal_type: item.meal_type || 'breakfast',
          day_label: day.day_label || 'Day 1',
        })
        totalCost += (food.price_pkr || 0) * qty
        totalCalories += (food.calories || 0) * qty
      }
    }
  }

  if (rows.length === 0) {
    return { error: 'AI did not return any valid food items. Try again.' }
  }

  const { data: plan, error: planError } = await supabase
    .from('diet_plans')
    .insert({
      member_id: memberId,
      title: title || `AI Plan (${minCalories}-${maxCalories} kcal, Rs${weeklyBudgetPkr}/week)`,
      notes: `Target: ${minCalories}-${maxCalories} kcal/day, ~${targetProtein}g protein, Rs${weeklyBudgetPkr}/week budget. Estimated actual: Rs${totalCost} total, ${totalCalories} kcal total.`,
    })
    .select()
    .single()

  if (planError || !plan) {
    return { error: planError?.message || 'Failed to create plan' }
  }

  const finalRows = rows.map((r) => ({ ...r, diet_plan_id: plan.id }))

  const { error: itemsError } = await supabase.from('diet_plan_foods').insert(finalRows)

  if (itemsError) {
    return { error: itemsError.message }
  }

  revalidatePath(`/admin/${memberId}`)
  revalidatePath('/diet-plans')
  return { success: true, daysGenerated: parsed.days?.length || 0, estimatedWeeklyCost: totalCost }
}