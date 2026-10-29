
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const MONGO_URL = "mongodb://127.0.0.1:27017";
const client = new MongoClient(MONGO_URL);

let recipesCollection;

async function startServer() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    const database = client.db("RecipeSharing");
    recipesCollection = database.collection("recipes");

    app.get("/", (req, res) => {
      res.send("Recipe Sharing API is running!");
    });

    app.get("/api/recipes", async (req, res) => {
      try {
        const recipes = await recipesCollection.find().toArray();
        res.json(recipes);
      } catch (error) {
        console.error("Failed to fetch recipes:", error.message);
        res.status(500).json({ message: "Failed to fetch recipes" });
      }
    });

    app.post("/api/recipes", async (req, res) => {
      try {
        const { name, category, ingredients, instructions, time } = req.body;

        if (!name || !category || !ingredients || !instructions || !time) {
          return res.status(400).json({
            message: "Please provide all recipe details",
          });
        }

        const recipe = {
          name,
          category,
          ingredients,
          instructions,
          time,
          createdAt: new Date(),
        };

        const result = await recipesCollection.insertOne(recipe);

        res.status(201).json({
          message: "Recipe added successfully!",
          recipeId: result.insertedId,
        });
      } catch (error) {
        console.error("Failed to add recipe:", error.message);
        res.status(500).json({ message: "Failed to add recipe" });
      }
    });

    
app.delete("/api/recipes/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    const result = await recipesCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ message: "Recipe deleted successfully!" });
  } catch (error) {
    console.error("Failed to delete recipe:", error.message);
    res.status(500).json({ message: "Failed to delete recipe" });
  }
});


    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
  }
}

startServer();
