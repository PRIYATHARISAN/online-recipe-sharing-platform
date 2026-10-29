
import { useEffect, useState } from "react";
import "./App.css";

const sampleRecipes = [
  {
    id: 1,
    name: "Creamy Vegetable Pasta",
    category: "Lunch",
    time: "25 min",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRL6wYOAao-XGtkcuMVaA-KXKW2P0A_Oxv5liMtBMEs2MgiGDU9QAy9dBk5&s=10",
    ingredients: ["200g pasta", "1 cup mixed vegetables", "2 tablespoons olive oil", "Salt and pepper", "Grated cheese"],
    instructions: [
      "Boil the pasta until cooked.",
      "Heat oil in a pan and cook the vegetables.",
      "Add pasta, salt, and pepper.",
      "Mix well and serve with grated cheese.",
    ],
  },
  {
    id: 2,
    name: "Fresh Garden Salad",
    category: "Healthy",
    time: "15 min",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiVFufS9xVIctbHHH-etr3oGw3AQ2TEdaVkO3dbKmXMg&s=10",
    ingredients: ["1 cucumber", "2 tomatoes", "1 carrot", "Lettuce leaves", "Lemon juice"],
    instructions: [
      "Wash all the vegetables.",
      "Chop the vegetables into small pieces.",
      "Mix everything in a bowl.",
      "Add lemon juice and serve fresh.",
    ],
  },
  {
    id: 3,
    name: "Homemade Pizza",
    category: "Dinner",
    time: "35 min",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF9PSWYC28Xi6GxBkyOxfleK3GQZbaZZst5_Uy6x4Sky_LcKJ1NdqQFhib&s=10",
    ingredients: ["1 pizza base", "Tomato sauce", "Mozzarella cheese", "Capsicum", "Onion"],
    instructions: [
      "Spread tomato sauce on the pizza base.",
      "Add chopped vegetables and cheese.",
      "Bake until the base is cooked and cheese melts.",
      "Slice and serve.",
    ],
  },
  {
    id: 4,
    name: "Chocolate Cake",
    category: "Dessert",
    time: "45 min",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx6yzqojK-W__xbEXOzh-oOHnqkh5zW1jXVKoWJghkng&s=10",
    ingredients: ["1 cup flour", "2 tablespoons cocoa powder", "Half cup sugar", "Half cup milk", "1 teaspoon baking powder"],
    instructions: [
      "Mix the flour, cocoa powder, sugar, and baking powder.",
      "Add milk and mix into a smooth batter.",
      "Pour into a prepared cake tin.",
      "Bake until cooked through.",
    ],
  },
];

function App() {
  const [recipes, setRecipes] = useState(sampleRecipes);
  const [search, setSearch] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newRecipe, setNewRecipe] = useState({
    name: "",
    category: "Lunch",
    time: "",
    image: "",
    ingredients: "",
    instructions: "",
  });

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch("http://localhost:5000/api/recipes");

        if (!response.ok) {
          throw new Error("Could not load recipes from the backend.");
        }

        const data = await response.json();

        const databaseRecipes = data.map((recipe) => ({
          ...recipe,
          id: recipe._id || recipe.id,
          image: recipe.image || "",
          ingredients: Array.isArray(recipe.ingredients)
            ? recipe.ingredients
            : String(recipe.ingredients || "").split(",").filter(Boolean),
          instructions: Array.isArray(recipe.instructions)
            ? recipe.instructions
            : String(recipe.instructions || "").split("\n").filter(Boolean),
        }));

        setRecipes([...databaseRecipes, ...sampleRecipes]);
        setError("");
      } catch {
        setError(
          "Cannot connect to the backend. Showing sample recipes instead."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAddRecipe(event) {
    event.preventDefault();

    const ingredients = newRecipe.ingredients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const instructions = newRecipe.instructions
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (
      !newRecipe.name.trim() ||
      !newRecipe.time.trim() ||
      ingredients.length === 0 ||
      instructions.length === 0
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const recipe = {
      name: newRecipe.name.trim(),
      category: newRecipe.category,
      time: newRecipe.time.trim(),
      image: newRecipe.image,
      ingredients,
      instructions,
    };

    try {
      const response = await fetch("http://localhost:5000/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Could not save the recipe.");
      }

      const result = await response.json();

      setRecipes((previousRecipes) => [
        {
          ...recipe,
          id: result.recipeId || Date.now(),
        },
        ...previousRecipes,
      ]);

      setNewRecipe({
        name: "",
        category: "Lunch",
        time: "",
        image: "",
        ingredients: "",
        instructions: "",
      });

      setShowForm(false);
      alert("Recipe saved successfully!");
    } catch (err) {
      alert(
        "Could not save the recipe to MongoDB. Check that your backend is running. " +
          err.message
      );
    }
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setNewRecipe((previous) => ({
        ...previous,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  }
   
async function handleDeleteRecipe(recipe) {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${recipe.name}"?`
  );

  if (!confirmed) return;

  // Sample recipes are only demo data, not stored in MongoDB.
  if (typeof recipe.id === "number" && recipe.id <= 4) {
    setRecipes((previousRecipes) =>
      previousRecipes.filter((item) => item.id !== recipe.id)
    );
    setSelectedRecipe(null);
    alert("Demo recipe removed from the page.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/recipes/${recipe.id}`,
      { method: "DELETE" }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Could not delete recipe.");
    }

    setRecipes((previousRecipes) =>
      previousRecipes.filter((item) => item.id !== recipe.id)
    );

    setSelectedRecipe(null);
    alert("Recipe deleted successfully!");
  } catch (error) {
    alert(error.message || "Could not connect to the backend.");
  }
}

  return (
    <div className="app">
      <nav className="navbar">
        <a className="logo" href="#home">🍲 RecipeShare</a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#recipes">Recipes</a>
          <a href="#about">About</a>
          <a
            className="share-link"
            href="#share"
            onClick={() => setShowForm(true)}
          >
            Share Recipe +
          </a>
        </div>
      </nav>

      <header className="hero" id="home">
        <div className="hero-content">
          <span className="eyebrow">GOOD FOOD, GOOD MOOD</span>
          <h1>Discover recipes<br />you'll love to cook.</h1>
          <p>
            Find your next favorite meal and share your
            delicious creations with the world.
          </p>

          <div className="search-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search delicious recipes..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="recipes-section" id="recipes">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OUR COLLECTION</span>
            <h2>Explore Recipes</h2>
          </div>
          <p>Simple ingredients, wonderful flavors.</p>
        </div>

        {loading && <p className="status-message">Loading recipes...</p>}
        {error && <p className="status-message">{error}</p>}

        <div className="recipe-grid">
          {filteredRecipes.map((recipe) => (
            <article className="recipe-card" key={recipe.id}>
              {recipe.image ? (
                <img src={recipe.image} alt={recipe.name} />
              ) : (
                <div className="recipe-emoji">🍽️</div>
              )}

              <div className="recipe-info">
                <div className="recipe-meta">
                  <span>{recipe.category}</span>
                  <span>⏱ {recipe.time}</span>
                </div>
                <h3>{recipe.name}</h3>
                
<div className="recipe-actions">
  <button onClick={() => setSelectedRecipe(recipe)}>
    View Recipe →
  </button>

  <button
    className="delete-recipe-button"
    onClick={() => handleDeleteRecipe(recipe)}
  >
    Delete
  </button>
</div>

              </div>
            </article>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <p className="no-results">No recipes found. Try another search.</p>
        )}
      </main>

      {showForm && (
        <div className="modal-overlay">
          <form className="recipe-modal" onSubmit={handleAddRecipe}>
            <button
              type="button"
              className="close-button"
              onClick={() => setShowForm(false)}
            >
              ✕ Close
            </button>

            <h2>Share Your Recipe</h2>
            <p>Enter your recipe details below.</p>

            <label>Recipe Name *</label>
            <input
              className="recipe-input"
              type="text"
              value={newRecipe.name}
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, name: e.target.value })
              }
              required
            />

            <label>Category *</label>
            <select
              className="recipe-input"
              value={newRecipe.category}
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, category: e.target.value })
              }
            >
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Healthy</option>
              <option>Dessert</option>
              <option>Snacks</option>
            </select>

            <label>Cooking Time *</label>
            <input
              className="recipe-input"
              type="text"
              placeholder="Example: 30 minutes"
              value={newRecipe.time}
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, time: e.target.value })
              }
              required
            />

            
             <label>Choose Image From Device (optional, max 2 MB)</label>
               <input
               className="recipe-input"
               type="file"
              accept="image/*"
                onChange={handleImageUpload}
             />

                {newRecipe.image && (
                <div className="image-preview">
                <img src={newRecipe.image} alt="Recipe preview" />

                <button
                 type="button"
               className="remove-photo-button"
                onClick={() => {
                 setNewRecipe((previous) => ({
                   ...previous,
                      image: "",
                     }));
                  }}
                   >
                Remove Photo ✕
                    </button>
                   </div>
                    )}
            <label>Ingredients * (separate with commas)</label>
            <textarea
              className="recipe-input"
              placeholder="Rice, vegetables, salt, spices"
              value={newRecipe.ingredients}
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, ingredients: e.target.value })
              }
              required
            />

            <label>Cooking Instructions * (one step per line)</label>
            <textarea
              className="recipe-input"
              placeholder={"Wash the rice.\nCook the vegetables.\nMix and serve."}
              value={newRecipe.instructions}
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, instructions: e.target.value })
              }
              required
            />

            <button className="close-modal-action" type="submit">
              Add Recipe
            </button>
          </form>
        </div>
      )}

      {selectedRecipe && (
        <div className="modal-overlay">
          <div className="recipe-modal">
            <button
              className="close-button"
              onClick={() => setSelectedRecipe(null)}
            >
              ✕ Close
            </button>

            {selectedRecipe.image && (
              <img src={selectedRecipe.image} alt={selectedRecipe.name} />
            )}

            <h2>{selectedRecipe.name}</h2>
            <p>
              Category: {selectedRecipe.category} | Cooking time:{" "}
              {selectedRecipe.time}
            </p>

            <h3>Ingredients</h3>
            <ul>
              {selectedRecipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>

            <h3>Cooking Instructions</h3>
            <ol>
              {selectedRecipe.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>

            <button
              className="close-modal-action"
              onClick={() => setSelectedRecipe(null)}
            >
              Back to Recipes
            </button>
          </div>
        </div>
      )}

      <section className="share-section" id="share">
        <h2>Have a recipe to share?</h2>
        <p>Your favorite recipe could inspire someone else's next meal.</p>
        <button onClick={() => setShowForm(true)}>
          Share Your Recipe +
        </button>
      </section>

      <footer id="about">
        <h3>🍲 RecipeShare</h3>
        <p>Discover, cook, and share something delicious.</p>
        <p>© 2026 RecipeShare</p>
      </footer>
    </div>
  );
}

export default App;
