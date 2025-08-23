

// Function to ensure the hidden ingredients are not visible by default
document.addEventListener('DOMContentLoaded', () => {
  const hiddenElements = document.querySelectorAll('.ingredient.extra');
  hiddenElements.forEach(element => {
    element.classList.add('hidden');
  });
});

function toggleIngredients(categoryId, buttonId) {
  const category = document.getElementById(categoryId);
  const button = document.getElementById(buttonId);
  const extraIngredients = category.querySelectorAll(".extra");
  const toggleBtnContainer = category.querySelector(".toggle-btn-container");

  if (button.innerText === "Show More") {
    extraIngredients.forEach(ingredient => {
      ingredient.style.display = "block";
    });
    button.innerText = "Show Less";
    category.appendChild(toggleBtnContainer);
  } else {
    extraIngredients.forEach(ingredient => {
      ingredient.style.display = "none";
    });
    button.innerText = "Show More";
  }
}
document.getElementById('toggle-veg').addEventListener('click', () => toggleIngredients('vegetables', 'toggle-veg'));
document.getElementById("toggle-greens").addEventListener("click", function() {
  toggleIngredients("greens", "toggle-greens");
});
document.getElementById("toggle-fruits").addEventListener("click", function() {
  toggleIngredients("fruits", "toggle-fruits");
});
document.getElementById("toggle-legumes").addEventListener("click", function() {
  toggleIngredients("legumes", "toggle-legumes");
});
document.getElementById("toggle-grains").addEventListener("click", function() {
  toggleIngredients("grains", "toggle-grains");
});
document.getElementById("toggle-spices").addEventListener("click", function() {
  toggleIngredients("spices", "toggle-spices");
});
document.getElementById("toggle-oils").addEventListener("click", function() {
  toggleIngredients("oils", "toggle-oils");
});
document.getElementById("toggle-dairy").addEventListener("click", function() {
  toggleIngredients("dairy", "toggle-dairy");
});
document.getElementById("toggle-flour").addEventListener("click", function() {
  toggleIngredients("flour", "toggle-flour");
});
document.getElementById("toggle-sweeteners").addEventListener("click", function() {
  toggleIngredients("sweeteners", "toggle-sweeteners");
});
document.getElementById("toggle-nutrients").addEventListener("click", function() {
  toggleIngredients("nutrients", "toggle-nutrients");
});

let selectedIngredients = []; // Global array

// --- Ingredient Button Clicks ---
document.querySelectorAll('.ingredient, .ingredient-extra').forEach(button => {
  button.addEventListener('click', (e) => {
    const ingredient = e.target.getAttribute('data-ingredient');
    e.target.classList.toggle('selected');

    if (e.target.classList.contains('selected')) {
      if (!selectedIngredients.includes(ingredient)) {
        selectedIngredients.push(ingredient);
      }
    } else {
      selectedIngredients = selectedIngredients.filter(item => item !== ingredient);
    }

    console.log('Selected Ingredients:', selectedIngredients);
  });
});

// --- Submit Button Click ---
function submitIngredients() {
    if (selectedIngredients.length === 0) {
      alert("Please select at least one ingredient.");
      return; // Stop further execution
    }
    const email = localStorage.getItem('email');
  console.log('Sending ingredients:', selectedIngredients);
  console.log('Sending email:', email);

  // Fetching the recipes from the backend
  fetch('http://localhost:3000/get-recipes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ingredients: selectedIngredients,email: email}),
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Recipes found') {
      localStorage.setItem('recipes', JSON.stringify(data.recipes));
    } else {
      localStorage.setItem('recipes', JSON.stringify([])); // Store empty array
    }
    window.location.href = 'recommendations.html'; // Redirect in both cases
  })
  
  .catch(error => {
    console.error('Error sending ingredients:', error);
  });
}


// --- Display Recipes ---
function displayRecipes(recipes) {
  const recipesContainer = document.getElementById('recipes-container');
  recipesContainer.innerHTML = ''; // Clear any previous recipes

  if (recipes.length > 0) {
    localStorage.setItem('recipes', JSON.stringify(recipes));
    recipes.forEach(recipe => {
      const recipeElement = document.createElement('div');
      recipeElement.classList.add('recipe');
      recipeElement.innerHTML = `
       <img src="${recipe.image}" alt="${recipe.name}" style="width: 100%; max-width: 300px; border-radius: 10px; margin-bottom: 10px;">
        <h3>${recipe.name}</h3>
        <p>Dietery Type: ${recipe.dietary_type}</p>
        <p>Link : ${recipe.link}</p>
        <p>Calories :${recipe.calories}</p>
        <p>Protein : ${recipe.protein}</p>
        <p>Time: ${recipe.Time}</p>
        <p>Cuisine : ${recipe.Cuisine}</p>
      `;
      recipesContainer.appendChild(recipeElement);
    });
  } else {
    recipesContainer.innerHTML = '<p>No matching recipes found.</p>';
  }
}
