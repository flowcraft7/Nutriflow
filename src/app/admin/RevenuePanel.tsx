'use client'

import { useState } from 'react'
import { updatePricePerMember } from './member-actions'

export default function RevenuePanel({
  currentPrice,
  activeCount,
}: {
  currentPrice: number
  activeCount: number
}) {
  const [price, setPrice] = useState(currentPrice.toString())
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await updatePricePerMember(parseFloat(price) || 0)
    setSaving(false)
  }

  const monthlyRevenue = (parseFloat(price) || 0) * activeCount

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="font-semibold mb-3">Revenue</h2>
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm text-[var(--color-text-muted)]">Price/client/month:</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-2 py-1 text-sm focus:outline-none focus:border-[var(--color-accent)]"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--color-accent)] text-[var(--color-accent-text)] rounded-md px-3 py-1 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <p className="text-sm text-[var(--color-text-muted)]">Active clients: {activeCount}</p>
      <p className="text-2xl font-bold text-[var(--color-positive)] mt-1">Rs {monthlyRevenue.toLocaleString()}/mo</p>
    </div>
  )
}