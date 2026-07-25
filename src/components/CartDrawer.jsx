import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import PaddleButton from "../components/PaddleButton";

export default function CartDrawer({
  isOpen,
  onClose,
  onPurchaseComplete,
}) {
  const navigate = useNavigate();

  const {
    cartItems,
    removeFromCart,
    clearCart,
    total,
  } = useCart();

  /*
   * Handle successful Paddle payment.
   *
   * PaddleButton should return:
   *
   * {
   *   transactionId,
   *   products
   * }
   *
   * The transaction ID is the only value
   * that needs to be passed to Downloads.
   *
   * Downloads will then:
   *
   * 1. Receive the transaction ID.
   * 2. Ask get-paddle-purchase to verify it.
   * 3. get-paddle-purchase checks Supabase.
   * 4. Supabase only returns completed purchases.
   * 5. Downloads retrieves the purchased
   *    products from Sanity.
   */
  const handleSuccess = (purchaseData) => {
    console.log(
      "Paddle payment completed:",
      purchaseData
    );

    /*
     * Get the Paddle transaction ID.
     */
    const transactionId =
      purchaseData?.transactionId;

    /*
     * A transaction ID is required.
     *
     * Do not fall back to product slugs.
     *
     * The Downloads page is now secured by
     * the completed transaction stored in
     * Supabase.
     */
    if (
      typeof transactionId !== "string" ||
      transactionId.trim().length === 0
    ) {
      console.error(
        "Payment completed, but no Paddle transaction ID was returned.",
        purchaseData
      );

      alert(
        "Your payment was completed, but we could not retrieve your transaction ID. Please contact support before closing this page."
      );

      return;
    }

    /*
     * Clear the cart after successful payment.
     */
    clearCart();

    /*
     * Close the cart drawer.
     */
    onClose();

    /*
     * Allow the parent component to handle
     * the completed purchase if provided.
     *
     * Pass the transaction ID rather than
     * product slugs.
     */
    if (onPurchaseComplete) {
      onPurchaseComplete(
        transactionId
      );

      return;
    }

    /*
     * Redirect to Downloads using only
     * the Paddle transaction ID.
     *
     * Downloads.jsx will verify this transaction
     * through get-paddle-purchase before showing
     * any files.
     */
    navigate(
      `/downloads?transaction=${encodeURIComponent(
        transactionId
      )}`
    );
  };

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
            className="text-adinkra-highlight hover:opacity-70 text-xl"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">

          {cartItems.length === 0 && (
            <p className="opacity-60">
              No licenses added yet.
            </p>
          )}

          {cartItems.map((item) => (
            <div
              key={item.slug}
              className="mb-4 border-b border-adinkra-highlight/20 pb-4"
            >
              <p className="font-semibold">
                {item.title}
              </p>

              <p className="text-sm mt-1">
                {item.price === 0
                  ? "Free"
                  : `$${Number(
                      item.price
                    ).toFixed(2)} USD`}
              </p>

              <button
                type="button"
                onClick={() =>
                  removeFromCart(
                    item.slug
                  )
                }
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
            Total: $
            {Number(total).toFixed(2)} USD
          </p>

          {cartItems.length > 0 && (
            <div className="mt-6">

              <PaddleButton
                cartItems={cartItems}
                onSuccess={handleSuccess}
              />

            </div>
          )}

        </div>

      </div>
    </div>
  );
}