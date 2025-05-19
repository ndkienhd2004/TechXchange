import React from "react";
import "./App.css";
import createRoutes from "./routes/routes";
import Navbar from "./components/NavBar/NavBar";

function App() {
  const routes = createRoutes();
  return (
    <div className="App">
      <Navbar />
      {routes}
    </div>
  );
}

export default App;
