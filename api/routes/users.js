import axios from "axios";
import express from "express";
import { Users, MealPlans } from "../../db/mocks.js";

const router = express.Router();

// POST /users/register
router.post("/register", async (req, res) => {
  try {
    const { username, password, preferences } = req.body;
    // console.log(username, password, preferences);

    if (!username || !password || !preferences) {
      return res.status(422).json({
        error: "Must provide both username, password and preferences",
      });
    }
    // Find the username in the User data and try to check if the username already exists
    const isRegistered = Users.find("username", username.toLowerCase());
    if (isRegistered) {
      return res.status(409).json({ error: "Username already registed." });
    }
    // Otherwise generate a random userID using Math.random()
    const userId = Math.random().toString(36).substring(7);
    // Add user to the data
    const newuser = Users.add({
      _id: userId,
      username,
      password,
      preferences: preferences || [],
    });
    // console.log(Users);
    res.json({
      _id: newuser._id,
      username: newuser.username,
      preferences: newuser.preferences,
    });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// POST /users/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Request body received:", req.body);
    // Check if username or password is null

    if (!username || !password) {
      return res
        .status(422)
        .json({ error: "Must provide both username and password" });
    }
    const currentUsers = Users.find("username", username.toLowerCase());

    // Find the username and try to check if the User object is not null or password doesnot match the password provided in the Data
    if (!currentUsers || currentUsers.password !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    // Send the response
    res.json({
      _id: currentUsers._id,
      username: currentUsers.username,
      preferences: currentUsers.preferences,
    });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// GET /users/:id
router.get("/:id", (req, res) => {
  try {
    // Get user_id from headers and convert it into an integer
    const user_id = parseInt(req.headers["user_id"]);
    // Convert the URL parameter id to an integer
    const id = parseInt(req.params.id);
    // Check if the user_id from the header matches the ID in the URL
    if (user_id !== id) {
      return res.status(403).json({ error: "User ID mismatch" });
    }
    // Find the user by id and check if user is found or not
    const user = Users.find("_id", id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch all meal plans for the user by user_id to get all the meal plans that a user have

    const mealPlans = MealPlans.findAll(id);
    if (!mealPlans) {
      return res
        .status(404)
        .json({ error: "Meal plans not found for this user" });
    }

    // Respond with the user's username and associated meal plans
    res.json({ username: user.username, mealPlans });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// PUT /users/:id
router.put("/:id", (req, res) => {
  try {
    // Get user_id from headers as an integer to compare the value from the header and params
    const user_id = parseInt(req.headers["user_id"]);
    // Convert the URL param id to an integer
    const id = parseInt(req.params.id);

    // Get the fields like username, password and preferences to update from the request body
    const { username, password, preferences } = req.body;

    // Check if the user_id from the header matches the ID in the URL
    if (user_id !== id) {
      return res.status(403).json({ error: "User ID mismatch" });
    }

    // Find the user by ID
    const user = Users.find("_id", id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user information if provided in the request body
    if (username) {
      const existingUser = Users.find("username", username);
      if (existingUser && existingUser._id !== id) {
        return res.status(400).json({ error: "Username already exists" });
      }
      user.username = username;
    }

    if (password) {
      // Ideally, the password should be hashed here before saving but for this assignment i did this
      user.password = password;
    }

    if (preferences) {
      // Update dietary preferences
      user.preferences = preferences;
    }

    // Respond with updated user object, excluding password
    res.json({ ...user, password: undefined });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

export default router;
