import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import PayPalButton from "../components/PayPalButton";

export default function CartDrawer({ isOpen, onClose, onPurchaseComplete }) {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, clearCart, total } = useCart();

  // Trigger downloads for all tracks in the cart
  const triggerDownloads = () => {
    cartItems.forEach(item => {
      if (item.downloadUrls && item.downloadUrls.length > 0) {
        item.downloadUrls.forEach((url, i) => {
          const link = document.createElement("a");
          link.href = url;
          link.download = `${item.title.replace(/\s+/g, "_")}${i > 0 ? `_${i+1}` : ""}.mp3`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      }
    });
  };

  const handleSuccess = () => {
    // Trigger downloads if needed (optional)
    // triggerDownloads(); // optional: you can skip immediate download if you want users to go to Downloads page

    // Get purchased slugs
    const purchasedSlugs = cartItems.map(item => item.slug);

    // Clear cart
    clearCart();

    // Close drawer
    onClose();

    // Redirect to Downloads page with purchased slugs
    if (onPurchaseComplete) {
      onPurchaseComplete(purchasedSlugs);
    } else {
      navigate(`/downloads?slugs=${purchasedSlugs.join(",")}`);
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 max-w-full bg-adinkra-bg text-adinkra-gold shadow-2xl transform transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Licenses</h2>
          <button
            onClick={onClose}
            className="text-adinkra-highlight hover:opacity-70 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 && (
            <p className="opacity-60">No licenses added yet.</p>
          )}

          {cartItems.map((item) => (
            <div
              key={item.slug}
              className="mb-4 border-b border-adinkra-highlight/20 pb-4"
            >
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm mt-1">
                {item.price === 0 ? "Free" : `$${item.price.toFixed(2)} USD`}
              </p>

              <button
                onClick={() => removeFromCart(item.slug)}
                className="text-red-400 text-xs mt-2 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Total + Checkout */}
        <div className="pt-6 border-t border-adinkra-highlight/20">
          <p className="text-xl font-bold mb-4">
            Total: ${total.toFixed(2)} USD
          </p>

          {cartItems.length > 0 && (
            <div className="mt-6">
              <PayPalButton
                price={total.toFixed(2)}
                title="Adinkra Audio License Bundle"
                onSuccess={handleSuccess}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}