import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function RecipeList({ selectedRecipes, setSelectedRecipes, onToggleSelect, refreshKey, onRecipeUpdated }) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingRecipe, setEditingRecipe] = useState(null)

  const fetchRecipes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching recipes:', error)
    else setRecipes(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRecipes()
  }, [refreshKey])

  // Filter recipes based on search input
  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.ingredients.some((ing) => ing.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Select All & Deselect All
  const handleSelectAll = () => setSelectedRecipes(filteredRecipes)
  const handleDeselectAll = () => setSelectedRecipes([])

  // Delete Recipe
  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this recipe?')) return

    const { error } = await supabase.from('recipes').delete().eq('id', id)
    if (error) {
      alert('Error deleting recipe: ' + error.message)
    } else {
      if (onRecipeUpdated) onRecipeUpdated()
      fetchRecipes()
    }
  }

  // Open Edit Modal
  const handleStartEdit = (recipe, e) => {
    e.stopPropagation()
    setEditingRecipe({ ...recipe, ingredients: [...recipe.ingredients] })
  }

  // Save Edits
  const handleSaveEdit = async () => {
    if (!editingRecipe.title.trim()) return alert('Recipe title cannot be empty.')
    
    const { error } = await supabase
      .from('recipes')
      .update({
        title: editingRecipe.title,
        ingredients: editingRecipe.ingredients
      })
      .eq('id', editingRecipe.id)

    if (error) {
      alert('Error updating recipe: ' + error.message)
    } else {
      setEditingRecipe(null)
      if (onRecipeUpdated) onRecipeUpdated()
      fetchRecipes()
    }
  }

  if (loading) return <p>Loading recipes...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Your Saved Recipes</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={handleSelectAll} style={{ fontSize: '0.85rem' }}>
            ✓ Select All
          </button>
          <button className="btn-secondary" onClick={handleDeselectAll} style={{ fontSize: '0.85rem' }}>
            ✕ Clear ({selectedRecipes.length})
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <input
        type="text"
        placeholder="🔍 Search recipes or ingredients..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem', boxSizing: 'border-box' }}
      />

      {filteredRecipes.length === 0 ? (
        <p style={{ color: '#64748b' }}>No recipes matched your search.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredRecipes.map((recipe) => {
            const isSelected = selectedRecipes.some((r) => r.id === recipe.id)

            return (
              <div
                key={recipe.id}
                style={{
                  border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  padding: '1rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => onToggleSelect(recipe)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <h3 style={{ margin: 0 }}>{recipe.title}</h3>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={(e) => handleStartEdit(recipe, e)}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(recipe.id, e)}
                      style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
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
      )}

      {/* Edit Modal */}
      {editingRecipe && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3>Edit Recipe</h3>
            <input
              type="text"
              value={editingRecipe.title}
              onChange={(e) => setEditingRecipe({ ...editingRecipe, title: e.target.value })}
              style={{ width: '100%', marginBottom: '1rem', boxSizing: 'border-box' }}
            />
            <h4>Ingredients</h4>
            {editingRecipe.ingredients.map((ing, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => {
                    const updated = [...editingRecipe.ingredients]
                    updated[idx].name = e.target.value
                    setEditingRecipe({ ...editingRecipe, ingredients: updated })
                  }}
                  style={{ flex: 2 }}
                />
                <input
                  type="number"
                  value={ing.amount}
                  onChange={(e) => {
                    const updated = [...editingRecipe.ingredients]
                    updated[idx].amount = e.target.value
                    setEditingRecipe({ ...editingRecipe, ingredients: updated })
                  }}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  value={ing.unit}
                  onChange={(e) => {
                    const updated = [...editingRecipe.ingredients]
                    updated[idx].unit = e.target.value
                    setEditingRecipe({ ...editingRecipe, ingredients: updated })
                  }}
                  style={{ flex: 1 }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn-primary" onClick={handleSaveEdit}>Save Changes</button>
              <button className="btn-secondary" onClick={() => setEditingRecipe(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}