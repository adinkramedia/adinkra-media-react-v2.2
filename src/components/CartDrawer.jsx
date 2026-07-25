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

  const handleSuccess = (purchaseData) => {
    console.log(
      "Paddle payment completed:",
      purchaseData
    );

    const transactionId =
      purchaseData?.transactionId;

    const products =
      Array.isArray(
        purchaseData?.products
      )
        ? purchaseData.products
        : [];

    if (
      typeof transactionId !== "string" ||
      transactionId.trim().length === 0
    ) {
      console.error(
        "Payment completed, but no Paddle transaction ID was returned.",
        purchaseData
      );

      alert(
        "Your payment was completed, but we could not retrieve your transaction ID. Please contact support."
      );

      return;
    }

    if (
      products.length === 0
    ) {
      console.error(
        "Payment completed, but no purchased products were returned.",
        purchaseData
      );

      alert(
        "Your payment was completed, but we could not identify your purchased products. Please contact support."
      );

      return;
    }

    const purchasedSlugs = [
      ...new Set(
        products
          .map(
            (product) =>
              typeof product?.slug ===
              "string"
                ? product.slug.trim()
                : ""
          )
          .filter(Boolean)
      ),
    ];

    if (
      purchasedSlugs.length === 0
    ) {
      console.error(
        "Payment completed, but no valid product slugs were returned.",
        products
      );

      alert(
        "Your payment was completed, but we could not identify your purchased products. Please contact support."
      );

      return;
    }

    console.log(
      "Purchased slugs:",
      purchasedSlugs
    );

    clearCart();

    onClose();

    if (onPurchaseComplete) {
      onPurchaseComplete({
        transactionId,
        products,
        slugs: purchasedSlugs,
      });

      return;
    }

    navigate(
      `/downloads?transaction=${encodeURIComponent(
        transactionId
      )}&slugs=${encodeURIComponent(
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
                {Number(item.price) === 0
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