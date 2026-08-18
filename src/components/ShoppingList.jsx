import { useState, useEffect } from 'react'

export default function ShoppingList({ selectedRecipes }) {
  const [shoppingList, setShoppingList] = useState([])

  // Consolidate matching ingredients across selected recipes
  const consolidateIngredients = (recipes) => {
    const totals = {}

    recipes.forEach((recipe) => {
      recipe.ingredients.forEach(({ name, amount, unit }) => {
        if (!name) return
        
        // Group by combined name + unit (e.g., "flour_cups")
        const cleanName = name.trim().toLowerCase()
        const cleanUnit = (unit || '').trim().toLowerCase()
        const key = `${cleanName}_${cleanUnit}`
        const parsedAmount = parseFloat(amount) || 0

        if (totals[key]) {
          totals[key].amount += parsedAmount
        } else {
          totals[key] = {
            name: name.trim(),
            amount: parsedAmount,
            unit: unit ? unit.trim() : '',
            isChecked: false
          }
        }
      })
    })

    return Object.values(totals)
  }

  // Recalculate whenever selected recipes change
  useEffect(() => {
    const consolidated = consolidateIngredients(selectedRecipes)
    setShoppingList(consolidated)
  }, [selectedRecipes])

  // Toggle strikethrough checkmark on items
  const toggleCheck = (index) => {
    const updated = [...shoppingList]
    updated[index].isChecked = !updated[index].isChecked
    setShoppingList(updated)
  }

  if (selectedRecipes.length === 0) {
    return (
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
        <h3>Shopping List</h3>
        <p style={{ color: '#64748b' }}>Select one or more recipes above to generate your consolidated grocery list.</p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
      <h2>
        Generated Shopping List ({selectedRecipes.length} recipe{selectedRecipes.length > 1 ? 's' : ''} selected)
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
        {shoppingList.map((item, idx) => (
          <li
            key={idx}
            onClick={() => toggleCheck(idx)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.6rem 0',
              borderBottom: '1px solid #e2e8f0',
              cursor: 'pointer',
              textDecoration: item.isChecked ? 'line-through' : 'none',
              color: item.isChecked ? '#94a3b8' : '#0f172a'
            }}
          >
            <input
              type="checkbox"
              checked={item.isChecked}
              onChange={() => {}} // Handled by list item click
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontWeight: 'bold' }}>
              {item.amount > 0 ? item.amount : ''} {item.unit}
            </span>
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}