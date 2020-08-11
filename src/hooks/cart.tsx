import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE => DOING
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      setProducts(
        (!!storagedProducts && [...JSON.parse(storagedProducts)]) || [],
      );
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
    async id => {
      const newProducts = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p,
      );

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
    async id => {
      const newProducts = products.map(p =>
        p.id === id
          ? { ...p, quantity: p.quantity > 0 ? p.quantity - 1 : 0 }
          : p,
      );

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART => DOING
      const productExists = products.find(p => p.id === product.id);

      if (productExists) {
        increment(product.id);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
