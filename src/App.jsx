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

  const handleRecipeAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', fontFamily: 'sans-serif', padding: '0 1rem' }}>
      <h1>Recipe Saver & Shopping List</h1>
      
      <AddRecipe onRecipeAdded={handleRecipeAdded} />
      
      <RecipeList
        selectedRecipes={selectedRecipes}
        onToggleSelect={handleToggleSelect}
        refreshKey={refreshKey}
      />

      <ShoppingList selectedRecipes={selectedRecipes} />
    </div>
  )
}