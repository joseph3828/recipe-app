import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import AddRecipe from './components/AddRecipe'
import RecipeList from './components/RecipeList'
import ShoppingList from './components/ShoppingList'

export default function App() {
  const [session, setSession] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedRecipes, setSelectedRecipes] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
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