const cors = require('cors'); 
const multer = require('multer');
const dotenv = require("dotenv");
const OpenAI = require("openai"); // for chatbot
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');  //for authenticating using OTP
const app = express(); 
app.use(cors());  
app.use(cors({
  origin: 'http://localhost:3000'  // Allow only your frontend URL
}));
// Mail Authentication
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse form data
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
}
});
const otpStore = new Map(); // email => { otp, expiresAt }

// Function to send OTP Email
function sendOTPEmail(toEmail, otp) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: toEmail,
    subject: 'The OTP for your RecipeVault Account is',
    html: `<p>Your OTP code is: <b>${otp}</b>. It will expire in 5 minutes.</p>`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

// API: Send OTP
app.post("/send-otp", (req, res) => {
  console.log("Received request from:", req.body);
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now

  // Store OTP
  otpStore.set(email, { otp, expiresAt });

  // Send the email
  sendOTPEmail(email, otp);

  res.json({ success: true, message: "OTP sent successfully" });
});
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
 const stored = otpStore.get(email);
 console.log(stored);
if (stored && stored.otp === otp && stored.expiresAt > Date.now()) {
  otpStore.delete(email); // OTP used or expired
  res.json({ verified: true });
} else {
  res.json({ verified: false });
}
});
//password updation during reseting password
app.post('/reset', (req, res) => {
  const { email, password } = req.body;
  bcrypt.hash(password, 10, (err, hashedpassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ message: 'Server error' });
        }
  const query = 'UPDATE account_details SET password = ? WHERE email = ?';

  db.query(query, [hashedpassword,email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Error updating password' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    return res.status(200).json({ message: 'updated' });
  });
});
});


const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Session middleware 
  app.use(session({
  secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,  
        httpOnly: true
    }
}));
// Connect database
db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to RecipeVault database');
});


// Serve signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'signup.html'));
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Serve profile page
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'profile.html'));
});

// Test route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// ================== Signup Route ==================
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        const query = 'INSERT INTO account_details (username, email, password) VALUES (?, ?, ?)';
        db.query(query, [name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Database error' });
            }
            return res.status(200).json({ message: 'Signup successful' });
        });
    });
});

// ================== Login Route ==================
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM account_details WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Email not found' });
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing password:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (isMatch) {
                req.session.userEmail = user.email; // Store the user email in the session
                res.status(200).json({ message: 'Login successful', email: user.email });
            } else {
                res.status(400).json({ message: 'Invalid password' });
            }
        });
    });
});

// ================== Fetch Profile Data ==================
app.get('/profile-data', (req, res) => {
    const email = req.query.email || req.session.userEmail; // Take from session if not provided

    if (!email) {
        return res.status(401).json({ message: 'Not logged in' });
    }

    const query = 'SELECT * FROM account_details WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error fetching profile' });
        }

        if (results.length > 0) {
            const user = results[0];
            res.json({
                username: user.username,
                email: user.email,
                bio: user.bio || '',
                dietary_preference: user.dietary_preference || 'vegetarian',
                cooking_level: user.cooking_level || 'beginner',
                saved_recipes: user.saved_recipes || 0
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});

// ================== Update Dietary Preference ==================
app.post('/update-dietary', (req, res) => {
    const email = req.body.email || req.session.userEmail;
    const { preference } = req.body;
    console.log('Received dietary preference:', email, preference);

    if (!email) {
        return res.status(401).json({ message: 'Not logged in' });
    }

    const query = 'UPDATE account_details SET dietary_preference = ? WHERE email = ?';
    db.query(query, [preference, email], (err, result) => {
        if (err) {
            console.error('Error updating dietary preference:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(200).json({ message: 'Dietary preference updated successfully' });
    });
});
app.post('/update-bio', (req, res) => {
    const email = req.body.email || req.session.userEmail;
    const bio  = req.body.bio;
    console.log('Recived Bio :', email,bio);

    if (!email) {
        return res.status(401).json({ message: 'Not logged in' });
    }

    const query = 'UPDATE account_details SET bio = ? WHERE email = ?';
    db.query(query, [bio, email], (err, result) => {
        if (err) {
            console.error('Error updating Bio:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(200).json({ message: 'Bio updated successfully' });
    });
});
// ================== Update Cooking Level ==================
app.post('/update-skill', (req, res) => {
    const email = req.body.email || req.session.userEmail;
    const { skill } = req.body;
    console.log('Received cooking skill:', email, skill);

    if (!email) {
        return res.status(401).json({ message: 'Not logged in' });
    }

    const query = 'UPDATE account_details SET cooking_skill = ? WHERE email = ?';
    db.query(query, [skill, email], (err, result) => {
        if (err) {
            console.error('Error updating cooking skill:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(200).json({ message: 'Cooking skill updated successfully' });
    });
});

// ================== Delete Account ==================
app.post('/get-recipes', (req, res) => {
    const ingredients = req.body.ingredients; // Array of ingredient names
    const email = req.body.email;

    console.log('Received ingredients:', ingredients);
    console.log('Received email:', email);

    if (!ingredients || ingredients.length === 0) {
        return res.status(400).json({ message: 'Ingredients or email not provided' });
    }

    // Step 1: Get ingredient IDs from selected ingredient names
    const ingredientPlaceholders = ingredients.map(() => '?').join(',');
    const query = `
        SELECT mi.ingredient_id
        FROM main_ingredients mi
        JOIN ingredients i ON i.id = mi.ingredient_id
        WHERE i.name IN (${ingredientPlaceholders})
    `;

    db.query(query, ingredients, (err, results) => {
        if (err) {
            console.error('Error fetching main ingredient IDs:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        const mainIngredientIds = [...new Set(results.map(r => r.ingredient_id))];
        if (mainIngredientIds.length === 0) {
            return res.status(404).json({ message: 'No main ingredients found' });
        }

        // Step 2: Fetch recipes with those main ingredient IDs
        const recipeQuery = `
            SELECT r.image, r.name, r.dietery_type, r.youtube_link, r.calories, r.protein, r.cooking_time, r.cuisine, r.id
            FROM recipes r
            WHERE r.main_ingredient_id IN (${mainIngredientIds.map(() => '?').join(',')})
        `;

        db.query(recipeQuery, mainIngredientIds, (err, recipeResults) => {
            if (err) {
                console.error('Error fetching recipes:', err);
                return res.status(500).json({ message: 'Server error while fetching recipes' });
            }

            if (recipeResults.length === 0) {
                return res.status(404).json({ message: 'No recipes found' });
            }

            const recipeIds = recipeResults.map(r => r.id);
            const recipePlaceholders = recipeIds.map(() => '?').join(',');

            // Step 3: Fetch user's allergic ingredient IDs
            const allergyQuery = `SELECT allergic_ingredient FROM allergy WHERE email = ?`;

            db.query(allergyQuery, [email], (err, allergyResults) => {
                if (err) {
                    console.error('Error fetching allergy data:', err);
                    return res.status(500).json({ message: 'Error fetching user allergy info' });
                }

                const allergicIds = allergyResults.map(a => a.allergic_ingredient);
                if (allergicIds.length === 0) {
                    // No allergies, return all recipes
                    return res.status(200).json({
                        message: 'Recipes found',
                        recipes: recipeResults.map(r => ({
                            image: r.image,
                            name: r.name,
                            dietary_type: r.dietery_type,
                            link: r.youtube_link,
                            calories: r.calories,
                            protein: r.protein,
                            Time: r.cooking_time,
                            Cuisine: r.cuisine,
                            id: r.id
                        }))
                    });
                }

                // Step 4: Check if any recipe has an allergic ingredient
                const recipeIngredientQuery = `
                    SELECT recipe_id
                    FROM recipe_ingredients
                    WHERE ingredient_id IN (${allergicIds.map(() => '?').join(',')})
                    AND recipe_id IN (${recipePlaceholders})
                `;

                db.query(recipeIngredientQuery, [...allergicIds, ...recipeIds], (err, conflictResults) => {
                    if (err) {
                        console.error('Error checking recipe ingredients for allergies:', err);
                        return res.status(500).json({ message: 'Error filtering recipes' });
                    }

                    const conflictingRecipeIds = new Set(conflictResults.map(r => r.recipe_id));
                    const filteredRecipes = recipeResults.filter(r => !conflictingRecipeIds.has(r.id));

                    if (filteredRecipes.length === 0) {
                        return res.status(200).json({ message: 'No safe recipes found', recipes: [] });
                    }

                    res.status(200).json({
                        message: 'Safe recipes found',
                        recipes: filteredRecipes.map(r => ({
                            image: r.image,
                            name: r.name,
                            dietary_type: r.dietery_type,
                            link: r.youtube_link,
                            calories: r.calories,
                            protein: r.protein,
                            Time: r.cooking_time,
                            Cuisine: r.cuisine,
                            id: r.id
                        }))
                    });
                });
            });
        });
    });
});

//getting favorites count
app.post('/get-fav-count', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const favCountQuery = 'SELECT COUNT(*) AS count FROM favorites WHERE email = ?';

  db.query(favCountQuery, [email], (err, countResult) => {
    if (err) {
      console.error('Error getting favorite count:', err);
      return res.status(500).json({ success: false });
    }

    // Log the count
    console.log(`Favorite count for ${email}:`, countResult[0].count);

    res.json({ success: true, count: parseInt(countResult[0].count) });
;
  });
});

app.delete('/delete-account', (req, res) => {
    const { email } = req.body; // Get the email from the request body

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    // Delete user from the database (this is just an example, adjust as needed)
    const query = 'DELETE FROM account_details WHERE email = ?';
    
    db.query(query, [email], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting account.' });
        }

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: 'Account deleted successfully' });
        } else {
            return res.status(404).json({ message: 'Account not found.' });
        }
    });
}); 

// Use body parser to parse JSON data from requests
app.use(bodyParser.json());
app.post('/add-favorite', (req, res) => {
  const { email, recipe_id } = req.body;
  console.log("Received in backend:", { email, recipe_id });

  if (!email || !recipe_id) {
    return res.status(400).json({ error: 'Missing email or recipe_id' });
  }

  // Step 1: Check if favorite already exists
  const checkQuery = 'SELECT * FROM favorites WHERE email = ? AND recipe_id = ?';
  db.query(checkQuery, [email, recipe_id], (err, results) => {
    if (err) {
      console.error('Error checking favorites:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (results.length > 0) {
      // Favorite already exists
      return res.status(409).json({ message: 'Already added to favorites' });
    }

    // Step 2: Insert favorite since it does not exist
    const insertQuery = 'INSERT INTO favorites (email, recipe_id) VALUES (?, ?)';
    db.query(insertQuery, [email, recipe_id], (err2, results2) => {
      if (err2) {
        console.error('Error adding to favorites:', err2);
        return res.status(500).json({ error: 'Database error', details: err2.message });
      }

      res.status(200).json({ message: 'Favorite added successfully' });
    });
  });
});

app.get('/get-favorites', (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const query = `
    SELECT r.*
    FROM recipes r
    JOIN favorites f ON r.id = f.recipe_id
    WHERE f.email = ?
  `;

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error fetching favorites:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    res.json(results);
  });
});

// ================== Start Server ==================



// for allergic
app.post('/mark-allergic', (req, res) => {
  const { email, ingredients } = req.body;

  if (!email) {
    return res.json({ success: false, message: 'User email is required' });
  }

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.json({ success: false, message: 'Ingredients are required' });
  }

  // To keep track of insertion promises
  const insertPromises = [];

  ingredients.forEach((ingredientName) => {
    insertPromises.push(new Promise((resolve, reject) => {
      // Find ingredient id
      db.query('SELECT id FROM ingredients WHERE name = ?', [ingredientName], (err, results) => {
        if (err) {
          console.error(err);
          return reject('Database error');
        }

        if (results.length === 0) {
          return reject(`Ingredient not found: ${ingredientName}`);
        }

        const ingredientId = results[0].id;

        // Insert into allergy table (assuming you have a user_email column)
        db.query(
          'INSERT INTO allergy (email, allergic_ingredient) VALUES (?, ?)',
          [email, ingredientId],
          (err2, result) => {
            if (err2) {
              // For example, if duplicate entry, just resolve silently or reject based on your logic
              if (err2.code === 'ER_DUP_ENTRY') {
                // Ignore duplicate errors for the same user and ingredient
                return resolve();
              }
              console.error(err2);
              return reject('Insert failed');
            }
            resolve();
          }
        );
      });
    }));
  });

  Promise.allSettled(insertPromises)
    .then((results) => {
      const rejected = results.filter(r => r.status === 'rejected');
      if (rejected.length > 0) {
        // Return first error message or custom message
        return res.json({ success: false, message: rejected[0].reason || 'Some inserts failed' });
      }

      res.json({ success: true, message: 'Allergic ingredients saved successfully' });
    })
    .catch((error) => {
      console.error('Unexpected error:', error);
      res.json({ success: false, message: 'Unexpected server error' });
    });
});

// Serve frontend (optional)
app.use(express.static('public')); // if you put HTML in 'public' folder
//for chatBot
dotenv.config();
app.use(bodyParser.json());

// // Initialize OpenAI client
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY, // Make sure your .env file is correct
// });

// app.post("/chat", async (req, res) => {
//   const userMessage = req.body.message;

//   try {
//     const chatCompletion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "system",
//           content: "You are a helpful cooking assistant for the website RecipeVault. Give friendly, clear, and creative answers about recipes and cooking tips.",
//         },
//         {
//           role: "user",
//           content: userMessage,
//         },
//       ],
//     });

//     const reply = chatCompletion.choices[0].message.content;
//     res.json({ reply });

//   } catch (error) {
//     console.error("OpenAI error:", error);
//     res.status(500).json({ reply: "Something went wrong." });
//   }
// });
app.listen(3000,() => {
    console.log('Server is running on port 3000');
    console.log('http://localhost:3000')
});
