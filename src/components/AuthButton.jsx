// components/AuthButton.jsx
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";

export default function AuthButton() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    user,
    isLoading
  } = useAuth0();

  const location = useLocation();

  if (isLoading) {
    return (
      <p className="text-sm text-adinkra-gold/70">
        Loading...
      </p>
    );
  }

  return isAuthenticated ? (
    <div className="flex items-center gap-3">

      <div className="flex flex-col">

        <span className="text-sm text-adinkra-gold">
          {user?.name}
        </span>

        <span className="text-xs text-adinkra-gold/50">
          {user?.email}
        </span>

      </div>

      <button
        onClick={() =>
          logout({
            logoutParams: {
              returnTo: window.location.origin
            }
          })
        }
        className="bg-adinkra-highlight px-4 py-2 rounded-full text-adinkra-bg text-sm font-semibold"
      >
        Log Out
      </button>

    </div>
  ) : (
    <button
      onClick={() =>
        loginWithRedirect({
          appState: {
            returnTo:
              location.pathname +
              location.search
          }
        })
      }
      className="bg-adinkra-highlight px-4 py-2 rounded-full text-adinkra-bg text-sm font-semibold"
    >
      Log In
    </button>
  );
}