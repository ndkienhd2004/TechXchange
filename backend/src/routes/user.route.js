const express = require("express");
const route = express.Router();
const UserController = require("../app/controllers/userController.js");

route.get("/", UserController.getAllUsers);
route.get("/:id", UserController.getUserById);
route.put("/:id", UserController.updateUser);
route.delete("/:id", UserController.deleteUser);
// Protected routes example
route.get("/test", (req, res) => {
  res.status(200).json({ message: "Test route is working!" });
});

module.exports = route;
