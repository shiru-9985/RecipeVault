document.addEventListener('DOMContentLoaded', async () => {
    const email = localStorage.getItem('email');

    if (!email) {
        alert("You are not logged in. Redirecting...");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/get-favorites?email=${email}`);
        const recipes = await response.json();

        const container = document.getElementById('favorites-container');
        container.innerHTML = '';

        if (recipes.length === 0) {
            container.innerHTML = '<p>No favorites added yet.</p>';
            return;
        }

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <img src="${recipe.image}" class="recipe-image">
                <h3>${recipe.name}</h3>
                <p>${recipe.dietery_type} | ${recipe.calories} cal | ${recipe.protein} protein</p>
                <a href="${recipe.youtube_link}" class="youtube_link" target="_blank">Watch Video</a>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching favorites:", error);
        alert("Failed to load favorite recipes.");
    }
});
