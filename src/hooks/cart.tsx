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
  removeItem(): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const StoredProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (StoredProducts) {
        setProducts(JSON.parse(StoredProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const ExistProduct = products.filter(item => item.id === product.id);

      if (ExistProduct.length) {
        return;
      }

      product.quantity = 1;

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify([product, ...products]),
      );

      setProducts([product, ...products]);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const UpdatedProducts = products.map(product => {
        if (product.id === id) {
          product.quantity += 1;
        }
        return product;
      });

      setProducts(UpdatedProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(UpdatedProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const UpdatedProducts = products.map(product => {
        if (product.id === id) {
          if (product.quantity > 1) {
            product.quantity -= 1;
          }
        }
        return product;
      });

      setProducts(UpdatedProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(UpdatedProducts),
      );
    },
    [products],
  );

  const removeItem = useCallback(
    async id => {
      const UpdatedProducts = products.filter(product => product.id !== id);

      setProducts(UpdatedProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(UpdatedProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products, removeItem }),
    [products, addToCart, increment, decrement, removeItem],
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
