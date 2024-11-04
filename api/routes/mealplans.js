import express from "express";
import { MealPlans } from "../../db/mocks.js";

const router = express.Router();

// POST /mealplans
router.post("/", (req, res) => {
  // Extract user_id from the request headers
  const { user_id } = req.headers;
  // Extract meal details and user_id from the request body
  const { week, mealId, name, diets, image, meal_plan_user_id } = req.body;

  // Check if user_id is missing in the header
  if (!user_id) {
    return res.status(401).json({ error: "User ID is required in headers" });
  }

  // Ensure user_id in the body matches the user_id from the headers
  if (parseInt(user_id) !== parseInt(meal_plan_user_id)) {
    return res.status(403).json({
      error:
        "User ID in headers does not match with the Meal Plan User ID in body",
    });
  }

  // Check if the user already has meal plans and get all meal plans for the user using findAll
  const userMealPlans = MealPlans.findAll(parseInt(user_id));

  // Check if the user is not found or has no meal plans
  if (!userMealPlans) {
    return res
      .status(404)
      .json({ error: "User not found or no meal plans available" });
  }

  // Find if there is already a meal with the same mealId in the user's meal plans
  const mealExists = userMealPlans.some((mealPlan) =>
    mealPlan.meals.some((meal) => meal.mealId === mealId)
  );

  if (mealExists) {
    return res
      .status(400)
      .json({ error: `Meal with mealId ${mealId} already exists` });
  }

  // Check if the user has reached the meal limit (e.g., 3 meals per plan) using user_id and week
  const userMealPlanForWeek = MealPlans.find(parseInt(user_id), week);
  if (userMealPlanForWeek && userMealPlanForWeek.meals.length >= 3) {
    return res
      .status(400)
      .json({ error: "Meal plan already contains 3 meals" });
  }

  // Otherwise, Add the new meal to the meal plan
  const newMeal = {
    mealId,
    name,
    diets,
    image,
  };

  // Another condition is If a meal plan exists for the same week, add the meal to it, otherwise create a new meal plan
  let updatedMealPlan;
  if (userMealPlanForWeek) {
    updatedMealPlan = MealPlans.add({ meal: newMeal }, userMealPlanForWeek._id);
  } else {
    updatedMealPlan = MealPlans.add({
      user_id: parseInt(user_id),
      week,
      meal: newMeal,
    });
  }

  // Respond with the updated meal plan
  res.status(201).json(updatedMealPlan);
});

// DELETE /mealplans/:id
router.delete("/:id", (req, res) => {
  // Extract user_id from the request headers
  const { user_id } = req.headers;
  // Extract meal plan _id from the URL params
  const { id } = req.params;

  // Check if the User ID is present in the header
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required in headers" });
  }

  // Using the user_id, check if there are meal plans associated with this user
  const userMealPlans = MealPlans.findAll(parseInt(user_id));
  if (userMealPlans.length === 0) {
    return res.status(404).json({ error: "No meal plans found for this user" });
  }

  // Check if the id in the meal plan matches the user_id from the header
  if (parseInt(id) !== parseInt(user_id)) {
    return res
      .status(403)
      .json({ error: "User ID in headers does not match parameter ID" });
  }
  // Find the specific meal plan by its ID
  const mealPlan = userMealPlans.find((plan) => plan._id === parseInt(id));
  if (!mealPlan) {
    return res.status(404).json({ error: "Meal plan not found" });
  }

  // Delete the meal plan using the MealPlans.delete() method
  const deletedPlanId = MealPlans.delete(mealPlan._id);

  // Respond with the success message and the deleted plan's ID
  res.json({ message: "Meal plan deleted", _id: deletedPlanId });
});

export default router;
