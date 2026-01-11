// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

import App from "./App";
import "./index.css";

// Auth0 configuration
const domain = "dev-sbalk02vrxvon3hk.us.auth0.com";
const clientId = "qmDe5Vg04bSBdDj5fIuYYKX5XsEaLTpK";

// ✅ Wrapper to handle redirect after login
function Auth0ProviderWithNavigate({ children }) {
  const navigate = useNavigate();

  const onRedirectCallback = (appState) => {
    // Navigate to the page user was on before login, or fallback to /news
    navigate(appState?.returnTo || "/news");
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: window.location.origin }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <App />
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </React.StrictMode>
);
