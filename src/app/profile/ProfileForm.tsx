'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from './actions'

export default function ProfileForm({ member }: { member: any }) {
  const [age, setAge] = useState(member?.age?.toString() || '')
  const [gender, setGender] = useState(member?.gender || 'male')
  const [heightCm, setHeightCm] = useState(member?.height_cm?.toString() || '')
  const [weightKg, setWeightKg] = useState(member?.weight_kg?.toString() || '')
  const [activityLevel, setActivityLevel] = useState(member?.activity_level || 'sedentary')
  const [goal, setGoal] = useState(member?.goal || 'maintain')
  const [targetWeightKg, setTargetWeightKg] = useState(member?.target_weight_kg?.toString() || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    const res = await updateProfile({
      age: parseInt(age),
      gender,
      heightCm: parseFloat(heightCm),
      weightKg: parseFloat(weightKg),
      activityLevel,
      goal,
      targetWeightKg: targetWeightKg ? parseFloat(targetWeightKg) : null,
    })

    if (res.error) {
      setError(res.error)
    } else {
      setResult(res.dailyCalorieTarget ?? null)
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--color-text-muted)]">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-text-muted)]">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--color-text-muted)]">Height (cm)</label>
          <input
            type="number"
            step="0.1"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            required
            className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-text-muted)]">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            required
            className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-[var(--color-text-muted)]">Activity Level</label>
        <select
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value)}
          className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
        >
          <option value="sedentary">Sedentary (little/no exercise)</option>
          <option value="light">Light (1-3 days/week)</option>
          <option value="moderate">Moderate (3-5 days/week)</option>
          <option value="active">Active (6-7 days/week)</option>
          <option value="very_active">Very Active (physical job/2x training)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--color-text-muted)]">Goal</label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          >
            <option value="maintain">Maintain Weight</option>
            <option value="lose">Lose Weight</option>
            <option value="gain">Gain Weight</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--color-text-muted)]">Target Weight (kg, optional)</label>
          <input
            type="number"
            step="0.1"
            value={targetWeightKg}
            onChange={(e) => setTargetWeightKg(e.target.value)}
            className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {result && (
        <div className="rounded-md bg-[var(--color-positive)]/10 border border-[var(--color-positive)]/30 p-3">
          <p className="text-sm text-[var(--color-text-muted)]">Your daily calorie target:</p>
          <p className="text-2xl font-bold text-[var(--color-positive)]">{result} kcal/day</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--color-accent)] text-[var(--color-accent-text)] rounded-md py-2.5 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {loading ? 'Calculating...' : 'Save & Calculate'}
      </button>
    </form>
  )
}