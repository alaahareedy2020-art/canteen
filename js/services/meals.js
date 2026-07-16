export const categories = [
  { id: 'all', name: 'All Menu', icon: 'fa-utensils' },
  { id: 'burgers', name: 'Burgers', icon: 'fa-burger' },
  { id: 'pizza', name: 'Pizza', icon: 'fa-pizza-slice' },
  { id: 'sandwiches', name: 'Sandwiches', icon: 'fa-bread-slice' },
  { id: 'chicken', name: 'Chicken', icon: 'fa-drumstick-bite' },
  { id: 'pasta', name: 'Pasta', icon: 'fa-bowl-food' },
  { id: 'salads', name: 'Salads', icon: 'fa-leaf' },
  { id: 'desserts', name: 'Desserts', icon: 'fa-ice-cream' },
  { id: 'drinks', name: 'Drinks', icon: 'fa-mug-hot' }
];

export let meals = [];

export async function fetchMeals() {
  try {
    const res = await fetch('/api/meals');
    const data = await res.json();
    meals.length = 0;
    meals.push(...data);
    return meals;
  } catch (e) {
    console.error('Error fetching meals:', e);
    return [];
  }
}

export async function updateMealPrice(mealId, newPrice) {
  try {
    const res = await fetch(`/api/meals/${mealId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: parseFloat(newPrice) })
    });
    if (res.ok) {
      const index = meals.findIndex(m => m.id === mealId);
      if (index !== -1) {
        const updatedPrice = parseFloat(newPrice);
        meals[index].price = updatedPrice;
        if (meals[index].isOffer && meals[index].oldPrice) {
          meals[index].oldPrice = Math.round(updatedPrice * 1.25);
        }
      }
      return true;
    }
  } catch (e) {
    console.error('Error updating meal price:', e);
  }
  return false;
}

export async function addMeal(mealData) {
  try {
    const res = await fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mealData)
    });
    if (res.ok) {
      const newMeal = await res.json();
      meals.push(newMeal);
      return newMeal;
    }
  } catch (e) {
    console.error('Error adding meal:', e);
  }
  return null;
}

export async function deleteMeal(mealId) {
  try {
    const res = await fetch(`/api/meals/${mealId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const index = meals.findIndex(m => m.id === mealId);
      if (index !== -1) {
        meals.splice(index, 1);
        return true;
      }
    }
  } catch (e) {
    console.error('Error deleting meal:', e);
  }
  return false;
}
