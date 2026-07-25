import { useCart } from "../context/CartContext";
import PaddleButton from "../components/PaddleButton";

export default function CartDrawer({
  isOpen,
  onClose,
}) {
  const {
    cartItems,
    removeFromCart,
    total,
  } = useCart();

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 max-w-full bg-adinkra-bg text-adinkra-gold shadow-2xl transform transition-transform duration-300 z-50 ${
        isOpen
          ? "translate-x-0"
          : "translate-x-full"
      }`}
    >
      <div className="p-6 h-full flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Your Licenses
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-adinkra-highlight hover:opacity-70 text-xl transition"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">

          {cartItems.length === 0 ? (
            <p className="opacity-60">
              No licenses added yet.
            </p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.slug}
                  className="border-b border-adinkra-highlight/20 pb-4"
                >
                  <div className="flex justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold break-words">
                        {item.title}
                      </p>

                      <p className="text-sm mt-1 text-adinkra-gold/70">
                        {Number(item.price) === 0
                          ? "Free"
                          : `$${Number(
                              item.price
                            ).toFixed(2)} USD`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.slug)
                      }
                      className="text-red-400 text-xs hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Checkout */}
        {cartItems.length > 0 && (
          <div className="pt-6 border-t border-adinkra-highlight/20">

            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-semibold">
                Total
              </p>

              <p className="text-xl font-bold">
                ${Number(total).toFixed(2)} USD
              </p>
            </div>

            <PaddleButton
              cartItems={cartItems}
            />

          </div>
        )}

      </div>
    </div>
  );
}