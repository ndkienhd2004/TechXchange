const express = require("express");
const route = express.Router();
import * as AuthController from "../app/controllers/authController.js";

export default function authRoute(app) {
  route.get("/", AuthController.getAllUsers);
  route.get("/:id", AuthController.getUserById);
  route.put("/:id", AuthController.updateUser);
  route.delete("/:id", AuthController.deleteUser);

  app.use(route);
}
