const express = require("express");
const route = express.Router();
const AuthController = require("../app/controllers/authController.js");

// route.get("/", AuthController.getAllUsers);
// route.get("/:id", AuthController.getUserById);
// route.put("/:id", AuthController.updateUser);
// route.delete("/:id", AuthController.deleteUser);

route.post("/login", AuthController.login);
route.post("/register", AuthController.register);
route.post("/logout", AuthController.logout);

// New forgot password routes
route.post("/forgot-password", AuthController.forgotPassword);
route.post("/verify-reset-code", AuthController.verifyResetCode);
route.post("/reset-password", AuthController.resetPassword);

// Protected routes example
route.get("/test", (req, res) => {
  res.status(200).json({ message: "Test route is working!" });
});

module.exports = route;
