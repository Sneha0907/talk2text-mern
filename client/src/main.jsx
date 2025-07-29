{/*The file you shared is the main entry point of your React application. It tells React where to render the app on the webpage (inside the root div in index.html) 
and sets up client-side routing using React Router. By defining different routes like / and /reset-password, it allows seamless navigation between components 
without refreshing the page. It also wraps the app in React.StrictMode to highlight potential issues during development and imports global CSS styles from index.css. 
Overall, this file initializes and configures the core structure of your React app.*/}


import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import ResetPassword from "./ResetPassword";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
