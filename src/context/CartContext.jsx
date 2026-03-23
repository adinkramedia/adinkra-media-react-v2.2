import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.slug === item.slug);
      if (exists) return prev;
      return [...prev, item];
    });
  };

  const removeFromCart = (slug) => {
    setCartItems((prev) => prev.filter((item) => item.slug !== slug));
  };

  const clearCart = () => setCartItems([]);

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}