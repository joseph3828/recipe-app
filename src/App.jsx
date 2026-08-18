import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import AddRecipe from './components/AddRecipe'
import RecipeList from './components/RecipeList'
import ShoppingList from './components/ShoppingList'

const SAMPLE_RECIPES = [
  {
    title: 'Fluffy Pancakes (sample)',
    ingredients: [
      { name: 'Flour', amount: 2, unit: 'cups' },
      { name: 'Milk', amount: 1.5, unit: 'cups' },
      { name: 'Eggs', amount: 2, unit: 'pcs' },
      { name: 'Butter', amount: 2, unit: 'tbsp' }
    ]
  },
  {
    title: 'Spaghetti Carbonara (sample)',
    ingredients: [
      { name: 'Spaghetti', amount: 400, unit: 'g' },
      { name: 'Eggs', amount: 3, unit: 'pcs' },
      { name: 'Parmesan Cheese', amount: 1, unit: 'cup' },
      { name: 'Bacon', amount: 200, unit: 'g' }
    ]
  },
  {
    title: 'Street Tacos (sample)',
    ingredients: [
      { name: 'Tortillas', amount: 8, unit: 'pcs' },
      { name: 'Ground Beef', amount: 1, unit: 'lb' },
      { name: 'Onion', amount: 1, unit: 'pc' },
      { name: 'Cilantro', amount: 0.5, unit: 'cup' }
    ]
  }
]

export default function App() {
  const [session, setSession] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedRecipes, setSelectedRecipes] = useState([])

  // Seed sample recipes if account is brand new
  const seedSampleRecipesIfNeeded = async (userId) => {
    const { data } = await supabase.from('recipes').select('id')
    if (!data || data.length === 0) {
      const recipesToInsert = SAMPLE_RECIPES.map((recipe) => ({
        ...recipe,
        user_id: userId
      }))
      await supabase.from('recipes').insert(recipesToInsert)
      setRefreshKey((prev) => prev + 1)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) seedSampleRecipesIfNeeded(session.user.id)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) seedSampleRecipesIfNeeded(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleToggleSelect = (recipe) => {
    if (selectedRecipes.some((r) => r.id === recipe.id)) {
      setSelectedRecipes(selectedRecipes.filter((r) => r.id !== recipe.id))
    } else {
      setSelectedRecipes([...selectedRecipes, recipe])
    }
  }

  const handleRecipeAddedOrUpdated = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setSelectedRecipes([])
  }

  if (!session) {
    return (
      <div className="app-container">
        <div className="header">
          <h1>🍳 Recipe & Grocery Planner</h1>
          <p>Sign in to manage your personal recipe box and shopping lists.</p>
        </div>
        <Auth />
      </div>
    )
  }

  return (
    <div className="app-container">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ textAlign: 'left', margin: 0 }}>🍳 Recipe & Grocery Planner</h1>
          <p style={{ margin: 0 }}>Logged in as {session.user.email}</p>
        </div>
        <button className="btn-secondary" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <AddRecipe onRecipeAdded={handleRecipeAddedOrUpdated} user={session.user} />
      </div>

      <div className="card">
        <RecipeList
          selectedRecipes={selectedRecipes}
          setSelectedRecipes={setSelectedRecipes}
          onToggleSelect={handleToggleSelect}
          refreshKey={refreshKey}
          onRecipeUpdated={handleRecipeAddedOrUpdated}
        />
      </div>

      <ShoppingList selectedRecipes={selectedRecipes} />
    </div>
  )
}