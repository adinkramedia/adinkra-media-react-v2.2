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
   * PaddleButton sends back:
   *
   * {
   *   transactionId,
   *   products,
   *   slugs
   * }
   *
   * The products come from Sanity through
   * create-paddle-transaction.js.
   */
  const handleSuccess = (purchaseData) => {
    console.log(
      "Purchase completed:",
      purchaseData
    );

    /*
     * Prefer the product data returned
     * by the Paddle transaction.
     *
     * This ensures the download page
     * receives the exact products that
     * were included in the transaction.
     */
    let purchasedSlugs = [];

    if (
      purchaseData &&
      Array.isArray(purchaseData.products)
    ) {
      purchasedSlugs = purchaseData.products
        .map(
          (product) => product.slug
        )
        .filter(
          (slug) =>
            typeof slug === "string" &&
            slug.trim().length > 0
        );
    }

    /*
     * Fallback to slugs returned directly
     * by PaddleButton.
     */
    if (
      purchasedSlugs.length === 0 &&
      purchaseData &&
      Array.isArray(purchaseData.slugs)
    ) {
      purchasedSlugs = purchaseData.slugs.filter(
        (slug) =>
          typeof slug === "string" &&
          slug.trim().length > 0
      );
    }

    /*
     * Final fallback to the current cart.
     *
     * This should normally not be needed,
     * but protects against an unexpected
     * missing products response.
     */
    if (purchasedSlugs.length === 0) {
      purchasedSlugs = cartItems
        .map(
          (item) => item.slug
        )
        .filter(
          (slug) =>
            typeof slug === "string" &&
            slug.trim().length > 0
        );
    }

    /*
     * Remove duplicate slugs.
     */
    purchasedSlugs = [
      ...new Set(purchasedSlugs),
    ];

    console.log(
      "Purchased product slugs:",
      purchasedSlugs
    );

    /*
     * Make sure we actually have
     * products to send to Downloads.
     */
    if (
      purchasedSlugs.length === 0
    ) {
      console.error(
        "Payment completed, but no purchased product slugs were found.",
        purchaseData
      );

      alert(
        "Your payment was completed, but we could not identify your purchased products. Please contact support before closing this page."
      );

      return;
    }

    /*
     * Clear the cart AFTER successful payment.
     */
    clearCart();

    /*
     * Close the cart drawer.
     */
    onClose();

    /*
     * Send the purchased slugs
     * to the parent component if provided.
     */
    if (onPurchaseComplete) {
      onPurchaseComplete(
        purchasedSlugs
      );

      return;
    }

    /*
     * Otherwise redirect directly
     * to the Downloads page.
     *
     * Downloads.jsx will use these
     * Sanity slugs to retrieve the
     * purchased products and their
     * download files.
     */
    navigate(
      `/downloads?slugs=${encodeURIComponent(
        purchasedSlugs.join(",")
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