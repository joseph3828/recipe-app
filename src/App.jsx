import { useState } from 'react'
import AddRecipe from './components/AddRecipe'
import RecipeList from './components/RecipeList'
import ShoppingList from './components/ShoppingList'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedRecipes, setSelectedRecipes] = useState([])

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

  return (
    <div className="app-container">
      <div className="header">
        <h1>🍳 Recipe & Grocery Planner</h1>
        <p>Save recipes, select meals for the week, and auto-generate your consolidated grocery list.</p>
      </div>
      
      <div className="card">
        <AddRecipe onRecipeAdded={handleRecipeAddedOrUpdated} />
      </div>
      
      <div className="card">
        <RecipeList
          selectedRecipes={selectedRecipes}
          onToggleSelect={handleToggleSelect}
          refreshKey={refreshKey}
          onRecipeUpdated={handleRecipeAddedOrUpdated}
        />
      </div>

      <ShoppingList selectedRecipes={selectedRecipes} />
    </div>
  )
}