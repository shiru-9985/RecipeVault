// --- Toggle Show More/Show Less ---
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
  
  // Attach all toggle button event listeners
  document.getElementById("toggle-poultry").addEventListener("click", function() {
    toggleIngredients("poultry", "toggle-poultry");
  });
  document.getElementById("toggle-meat").addEventListener("click", function() {
    toggleIngredients("meat", "toggle-meat");
  });
  document.getElementById("toggle-seafood").addEventListener("click", function() {
    toggleIngredients("seafood", "toggle-seafood");
  });
  document.getElementById("toggle-veg").addEventListener("click", function() {
    toggleIngredients("vegetables", "toggle-veg");
  });
  document.getElementById("toggle-exotic").addEventListener("click", function() {
    toggleIngredients("exotic", "toggle-exotic");
  });
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
  function submit_allergic_Ingredients() {
  const email = localStorage.getItem('email');

  if (!email) {
    alert('User email not found. Please login again.');
    return;
  }

  console.log('Sending ingredients:', selectedIngredients, 'with email:', email);

  fetch('http://localhost:3000/mark-allergic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      ingredients: selectedIngredients
    }),
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert('Allergic ingredients saved successfully!');
    } else {
      alert('Error: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Error sending ingredients:', error);
    alert('Failed to send allergic ingredients. Please try again.');
  });
   setTimeout(() => {
      window.location.href = 'index.html'; // Replace with your page
    }, 1000);
}