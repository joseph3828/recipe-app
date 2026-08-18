import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AddRecipe({ onRecipeAdded }) {
  const [title, setTitle] = useState('')
  const [ingredients, setIngredients] = useState([
    { name: '', amount: '', unit: '' }
  ])
  const [loading, setLoading] = useState(false)

  // Add an empty ingredient row to the form
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }])
  }

  // Update a specific ingredient input line
  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients]
    updated[index][field] = value
    setIngredients(updated)
  }

  // Save the recipe to Supabase
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return alert('Please enter a recipe title.')

    // Filter out completely empty ingredient fields
    const validIngredients = ingredients.filter((i) => i.name.trim() !== '')

    if (validIngredients.length === 0) {
      return alert('Please add at least one ingredient.')
    }

    setLoading(true)

    const { error } = await supabase.from('recipes').insert([
      {
        title: title,
        ingredients: validIngredients
      }
    ])

    setLoading(false)

    if (error) {
      alert('Error saving recipe: ' + error.message)
    } else {
      alert('Recipe saved successfully!')
      setTitle('')
      setIngredients([{ name: '', amount: '', unit: '' }])
      if (onRecipeAdded) onRecipeAdded()
    }
  }

  return (
    <div style={{ background: '#f4f4f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
      <h2>Add New Recipe</h2>
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
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <h3>Ingredients</h3>
        {ingredients.map((ing, index) => (
          <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              placeholder="Item (e.g., Flour)"
              value={ing.name}
              onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
              style={{ flex: '2', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
              type="number"
              placeholder="Qty (e.g., 2)"
              value={ing.amount}
              onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
              style={{ flex: '1', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
              type="text"
              placeholder="Unit (e.g., cups)"
              value={ing.unit}
              onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
              style={{ flex: '1', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddIngredient}
          style={{ background: '#e4e4e7', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', marginBottom: '1rem' }}
        >
          + Add Another Ingredient
        </button>

        <br />

        <button
          type="submit"
          disabled={loading}
          style={{ background: '#16a34a', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Saving...' : 'Save Recipe'}
        </button>
      </form>
    </div>
  )
}