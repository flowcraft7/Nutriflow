'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { assignDietPlan, searchFoodsForPlan } from './plan-actions'

type PlanItem = {
  foodId: string
  name: string
  portionLabel: string
  quantity: number
  mealType: string
}

export default function AssignPlanForm({ memberId }: { memberId: string }) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [items, setItems] = useState<PlanItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSearch = async (value: string) => {
    setQuery(value)
    if (value.length < 2) {
      setResults([])
      return
    }
    const data = await searchFoodsForPlan(value)
    setResults(data)
  }

  const addItem = (food: any) => {
    setItems([
      ...items,
      {
        foodId: food.id,
        name: food.name,
        portionLabel: food.portion_label,
        quantity: 1,
        mealType: 'breakfast',
      },
    ])
    setQuery('')
    setResults([])
  }

  const updateItem = (index: number, field: 'quantity' | 'mealType', value: string | number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!title || items.length === 0) {
      setError('Add a title and at least one food item.')
      return
    }
    setSaving(true)
    setError('')

    const res = await assignDietPlan({
      memberId,
      title,
      notes,
      items: items.map((i) => ({ foodId: i.foodId, quantity: i.quantity, mealType: i.mealType })),
    })

    if (res.error) {
      setError(res.error)
    } else {
      setTitle('')
      setNotes('')
      setItems([])
      router.refresh()
    }

    setSaving(false)
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="font-semibold mb-4">Assign Diet Plan</h2>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Plan title (e.g. Week 1 - Fat Loss)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
        />
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
        />

        <div className="relative">
          <input
            type="text"
            placeholder="Search food to add..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
          {results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md max-h-48 overflow-y-auto">
              {results.map((food) => (
                <button
                  key={food.id}
                  onClick={() => addItem(food)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-bg)] border-b border-[var(--color-border)] last:border-0"
                >
                  {food.name} <span className="text-[var(--color-text-muted)]">({food.portion_label})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 bg-[var(--color-bg)] rounded-md p-2 text-sm">
                <span className="flex-1 min-w-[120px]">{item.name}</span>
                <input
                  type="number"
                  step="0.5"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value))}
                  className="w-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-2 py-1 text-xs"
                />
                <span className="text-xs text-[var(--color-text-muted)]">{item.portionLabel}</span>
                <select
                  value={item.mealType}
                  onChange={(e) => updateItem(i, 'mealType', e.target.value)}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-2 py-1 text-xs"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
                <button onClick={() => removeItem(i)} className="text-red-400 text-xs hover:underline">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[var(--color-accent)] text-[var(--color-accent-text)] rounded-md py-2.5 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {saving ? 'Saving...' : 'Save Plan'}
        </button>
      </div>
    </div>
  )
}