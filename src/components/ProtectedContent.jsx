// components/ProtectedContent.jsx
import { useAuth0 } from "@auth0/auth0-react";

export default function ProtectedContent({ children }) {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();

  if (isLoading) return <p className="text-center text-adinkra-gold">Checking access...</p>;

  if (!isAuthenticated) {
    return (
      <div className="text-center py-10">
        <p className="mb-4 text-adinkra-gold/80 font-semibold">
          Please log in to access this content.
        </p>
        <button
          onClick={() => loginWithRedirect()}
          className="bg-adinkra-highlight px-6 py-3 rounded-full text-adinkra-bg font-semibold hover:bg-adinkra-highlight/80 transition"
        >
          Log In
        </button>
      </div>
    );
  }

  return children;
}
