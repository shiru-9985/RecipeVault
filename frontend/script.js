function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
  
    if (email && password) {
      alert(`Welcome Logged in with ${email}`);
      // ✅ Redirect to categories.html instead of ingredients.html
      window.location.href = "categories.html";
    } else {
      alert("Please fill all fields.");
    }
  }
  