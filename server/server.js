const express = require("express");
const app = express();
const userRoutes = require("./controllers/api/userRoute");
const db = require("./config/connection");
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// import user routes
app.use(userRoutes);

db.once("open", () => {
  app.listen(3000, () => {
    console.log("App listening at port 3000");
  });
});
