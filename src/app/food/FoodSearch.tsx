'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { searchFoods, logFood } from './actions'

export default function FoodSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [selectedFood, setSelectedFood] = useState<any>(null)
  const [quantity, setQuantity] = useState('1')
  const [mealType, setMealType] = useState('breakfast')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const router = useRouter()

  const handleSearch = async (value: string) => {
    setQuery(value)
    setSelectedFood(null)
    if (value.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    const data = await searchFoods(value)
    setResults(data)
    setSearching(false)
  }

  const handleSelect = (food: any) => {
    setSelectedFood(food)
    setResults([])
    setQuery(food.name)
  }

  const handleLog = async () => {
    if (!selectedFood) return
    setLoading(true)
    await logFood(selectedFood.id, parseFloat(quantity), mealType)
    setSelectedFood(null)
    setQuery('')
    setQuantity('1')
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="font-semibold mb-4">Log a Meal</h2>

      <div className="relative">
        <input
          type="text"
          placeholder="Search food (e.g. Roti, Chicken Karahi)..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
        />

        {results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md max-h-60 overflow-y-auto">
            {results.map((food) => (
              <button
                key={food.id}
                onClick={() => handleSelect(food)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-bg)] flex justify-between items-center border-b border-[var(--color-border)] last:border-0"
              >
                <span>
                  {food.name}
                  {food.restaurant_name && (
                    <span className="text-[var(--color-text-muted)]"> · {food.restaurant_name}</span>
                  )}
                </span>
                <span className="text-[var(--color-text-muted)] text-xs">{food.calories} kcal / {food.portion_label}</span>
              </button>
            ))}
          </div>
        )}

        {searching && <p className="text-xs text-[var(--color-text-muted)] mt-1">Searching...</p>}
      </div>

      {selectedFood && (
        <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="text-xs text-[var(--color-text-muted)]">Quantity ({selectedFood.portion_label})</label>
            <input
              type="number"
              step="0.5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="text-xs text-[var(--color-text-muted)]">Meal</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
          <button
            onClick={handleLog}
            disabled={loading}
            className="bg-[var(--color-accent)] text-[var(--color-accent-text)] rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity w-full sm:w-auto"
          >
            {loading ? 'Logging...' : 'Log It'}
          </button>
        </div>
      )}
    </div>
  )
}