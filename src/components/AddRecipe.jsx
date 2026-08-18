import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AddRecipe({ onRecipeAdded }) {
  const [title, setTitle] = useState('')
  const [ingredients, setIngredients] = useState([
    { name: '', amount: '', unit: '' }
  ])
  const [loading, setLoading] = useState(false)

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }])
  }

  // Delete a specific ingredient row
  const handleRemoveIngredient = (index) => {
    if (ingredients.length === 1) return // Keep at least one row
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients]
    updated[index][field] = value
    setIngredients(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return alert('Please enter a recipe title.')

    const validIngredients = ingredients.filter((i) => i.name.trim() !== '')
    if (validIngredients.length === 0) {
      return alert('Please add at least one ingredient.')
    }

    setLoading(true)
    const { error } = await supabase.from('recipes').insert([
      { title, ingredients: validIngredients }
    ])
    setLoading(false)

    if (error) {
      alert('Error saving recipe: ' + error.message)
    } else {
      setTitle('')
      setIngredients([{ name: '', amount: '', unit: '' }])
      if (onRecipeAdded) onRecipeAdded()
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Add New Recipe</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Recipe Title
          </label>
          <input
            type="text"
            placeholder="e.g., Pancakes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <h3>Ingredients</h3>
        {ingredients.map((ing, index) => (
          <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Item (e.g., Flour)"
              value={ing.name}
              onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
              style={{ flex: '2' }}
            />
            <input
              type="number"
              placeholder="Qty (e.g., 2)"
              value={ing.amount}
              onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
              style={{ flex: '1' }}
            />
            <input
              type="text"
              placeholder="Unit (e.g., cups)"
              value={ing.unit}
              onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
              style={{ flex: '1' }}
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveIngredient(index)}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.55rem 0.75rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                title="Remove ingredient"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button type="button" className="btn-secondary" onClick={handleAddIngredient}>
            + Add Ingredient
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Recipe'}
          </button>
        </div>
      </form>
    </div>
  )
}