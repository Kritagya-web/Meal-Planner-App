/*
    steps to run:
    1. install dependencies: npm install
    2. start the server with nodemon: npm run dev
*/

import "dotenv/config";
import express from "express";

import users from "./api/routes/users.js";
import meals from "./api/routes/meals.js";
import mealplans from "./api/routes/mealplans.js";

const app = express();
const PORT = 8080;

app.use(express.json());

app.use("/users", users);
app.use("/meals", meals);
app.use("/mealplans", mealplans);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
