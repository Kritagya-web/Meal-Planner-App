import express from "express";
import axios from "axios";

const router = express.Router();

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_API_URL = process.env.SPOONACULAR_API_URL;

// GET /meals/search
router.get("/search", async (req, res) => {
  // Get user_id from headers while requesting
  const { user_id } = req.headers;
  // Get meal and diets from query parameters
  const { meal, diets } = req.query;

  // Check for user_id in the headers, i.e. if no user id return error message
  if (!user_id) {
    return res.status(401).json({ error: "User ID required" });
  }

  // Ensure meal and diets are provided otherwise give an error
  if (!meal || !diets) {
    return res
      .status(400)
      .json({ error: "Meal and diets are required query parameters" });
  }

  try {
    // Make a GET request to Spoonacular API
    const response = await axios.get(SPOONACULAR_API_URL, {
      params: {
        query: meal, // Search by meal
        diet: diets, // Filter by diets
        apiKey: SPOONACULAR_API_KEY, // Include your API key in the request
      },
    });

    // Send back the response from Spoonacular API by results
    res.json(response.data.results);
  } catch (error) {
    // Otherwise provide detailed error information
    console.error("Error fetching data from Spoonacular API:", error.message);

    // If the error is from Spoonacular (e.g., invalid API key)
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      // Handle other errors (e.g., network errors)
      res.status(500).json({ error: "An internal server error occurred" });
    }
  }
});

export default router;
