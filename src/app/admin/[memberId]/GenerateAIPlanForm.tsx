'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateAIDietPlan } from './plan-actions'

export default function GenerateAIPlanForm({ memberId }: { memberId: string }) {
  const [title, setTitle] = useState('')
  const [minCalories, setMinCalories] = useState('1800')
  const [maxCalories, setMaxCalories] = useState('2000')
  const [targetProtein, setTargetProtein] = useState('120')
  const [weeklyBudgetPkr, setWeeklyBudgetPkr] = useState('7000')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await generateAIDietPlan({
      memberId,
      minCalories: parseInt(minCalories),
      maxCalories: parseInt(maxCalories),
      targetProtein: parseInt(targetProtein),
      weeklyBudgetPkr: parseInt(weeklyBudgetPkr),
      title,
    })

    if (res.error) {
      setError(res.error)
    } else {
      setSuccess(`✅ Generated a ${res.daysGenerated}-day plan. Estimated weekly cost: Rs${res.estimatedWeeklyCost}`)
      setTitle('')
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="font-semibold mb-1">Generate AI Diet Plan</h2>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">Builds a 7-day plan from Pakistani foods using AI</p>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Plan title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--color-text-muted)]">Min calories/day</label>
            <input
              type="number"
              value={minCalories}
              onChange={(e) => setMinCalories(e.target.value)}
              className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-text-muted)]">Max calories/day</label>
            <input
              type="number"
              value={maxCalories}
              onChange={(e) => setMaxCalories(e.target.value)}
              className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--color-text-muted)]">Target protein (g/day)</label>
            <input
              type="number"
              value={targetProtein}
              onChange={(e) => setTargetProtein(e.target.value)}
              className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-text-muted)]">Weekly budget (Rs)</label>
            <input
              type="number"
              value={weeklyBudgetPkr}
              onChange={(e) => setWeeklyBudgetPkr(e.target.value)}
              className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}
        {success && <p className="text-[var(--color-positive)] text-xs">{success}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-[var(--color-accent)] text-[var(--color-accent-text)] rounded-md py-2.5 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {loading ? 'Generating (this takes ~10-20s)...' : 'Generate 7-Day Plan'}
        </button>
      </div>
    </div>
  )
}