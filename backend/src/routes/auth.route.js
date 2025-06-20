const express = require("express");
const route = express.Router();
const AuthController = require("../app/controllers/authController.js");

// route.get("/", AuthController.getAllUsers);
// route.get("/:id", AuthController.getUserById);
// route.put("/:id", AuthController.updateUser);
// route.delete("/:id", AuthController.deleteUser);
route.post("/register", AuthController.register);
route.post("/login", AuthController.login);
// route.post("/logout", AuthController.logout);
route.get("/test", (req, res) => {
  res.status(200).json({ message: "Test route is working!" });
});

module.exports = route;
