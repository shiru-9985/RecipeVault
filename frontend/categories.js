// categories.js

// Function to handle category selection and navigation
function selectCategory(category) {
    // Store the selected category in sessionStorage (optional if needed later)
    sessionStorage.setItem('selectedCategory', category);
  
    // Navigate to the corresponding page based on the category selected
    // Navigate to vegan.html
    if (category === 'Vegetarian') {
      window.location.href = 'veg.html';    // Navigate to veg.html
    } else if (category === 'Non-Vegetarian') {
      window.location.href = 'nv.html';     // Navigate to nv.html
    }
  }
  