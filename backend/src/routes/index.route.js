const AuthRoute = require("./auth.route.js");

function route(app) {
  app.use("/auth", AuthRoute);
}

module.exports = route;
