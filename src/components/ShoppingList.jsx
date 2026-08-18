import { useState, useEffect, useRef } from 'react'

export default function ShoppingList({ selectedRecipes }) {
  const [shoppingList, setShoppingList] = useState([])
  const [showFloatingPopup, setShowFloatingPopup] = useState(false)
  const listRef = useRef(null)

  const consolidateIngredients = (recipes) => {
    const totals = {}
    recipes.forEach((recipe) => {
      recipe.ingredients.forEach(({ name, amount, unit }) => {
        if (!name) return
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

  useEffect(() => {
    setShoppingList(consolidateIngredients(selectedRecipes))
  }, [selectedRecipes])

  // Hide floating popup when full shopping list component is visible in viewport
  useEffect(() => {
    if (selectedRecipes.length === 0) {
      setShowFloatingPopup(false)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingPopup(!entry.isIntersecting)
      },
      { threshold: 0.2 }
    )

    if (listRef.current) observer.observe(listRef.current)
    return () => observer.disconnect()
  }, [selectedRecipes])

  const toggleCheck = (index) => {
    const updated = [...shoppingList]
    updated[index].isChecked = !updated[index].isChecked
    setShoppingList(updated)
  }

  const scrollToShoppingList = () => {
    listRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Floating Sticky Popup Bar */}
      {showFloatingPopup && (
        <div
          onClick={scrollToShoppingList}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e293b',
            color: '#ffffff',
            padding: '0.85rem 1.5rem',
            borderRadius: '999px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            zIndex: 90,
            transition: 'all 0.3s ease',
            border: '1px solid #334155'
          }}
        >
          <span>
            🛒 <strong>{selectedRecipes.length}</strong> Recipe{selectedRecipes.length > 1 ? 's' : ''} Selected ({shoppingList.length} Items)
          </span>
          <span style={{ background: '#2563eb', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 'bold' }}>
            View List ↓
          </span>
        </div>
      )}

      {/* Main Shopping List Section */}
      <div
        ref={listRef}
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: selectedRecipes.length > 0 ? '#f0fdf4' : '#f8fafc',
          border: selectedRecipes.length > 0 ? '1px solid #bbf7d0' : '1px dashed #cbd5e1',
          borderRadius: '12px',
          transition: 'all 0.3s ease'
        }}
      >
        <h2>Shopping List</h2>
        {selectedRecipes.length === 0 ? (
          <p style={{ color: '#64748b' }}>Select one or more recipes above to generate your consolidated grocery list.</p>
        ) : (
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
                  onChange={() => {}}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 'bold' }}>
                  {item.amount > 0 ? item.amount : ''} {item.unit}
                </span>
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}