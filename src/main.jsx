import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App.jsx";
import AppProviders from "./app/AppProviders.jsx";
import "./index.css";
import "tailwindcss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
