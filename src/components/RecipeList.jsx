import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function RecipeList({ selectedRecipes, onToggleSelect, refreshKey }) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch all recipes from Supabase
  const fetchRecipes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching recipes:', error)
    } else {
      setRecipes(data || [])
    }
    setLoading(false)
  }

  // Re-fetch recipes whenever refreshKey changes (e.g. after adding a new recipe)
  useEffect(() => {
    fetchRecipes()
  }, [refreshKey])

  if (loading) return <p>Loading recipes...</p>
  if (recipes.length === 0) return <p>No recipes saved yet. Add one above!</p>

  return (
    <div>
      <h2>Your Saved Recipes</h2>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        Select recipes to generate your grocery list.
      </p>

      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {recipes.map((recipe) => {
          const isSelected = selectedRecipes.some((r) => r.id === recipe.id)

          return (
            <div
              key={recipe.id}
              style={{
                border: isSelected ? '2px solid #2563eb' : '1px solid #e4e4e7',
                background: isSelected ? '#eff6ff' : '#ffffff',
                padding: '1rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => onToggleSelect(recipe)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}} // Handled by parent div click
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <h3 style={{ margin: 0 }}>{recipe.title}</h3>
              </div>

              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', color: '#374151' }}>
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx}>
                    {ing.amount} {ing.unit} {ing.name}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}