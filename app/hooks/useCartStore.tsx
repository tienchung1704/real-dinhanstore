"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface CartItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image: string;
  brand: string;
  quantity: number;
  stock: number;
}

export interface Address {
  id: number;
  fullName: string;
  phone: string;
  province?: string;
  district?: string;
  ward?: string;
  addressDetail: string;
  isDefault: boolean;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  discount: number;
  discountCode: string;
  pointsUsed: number;
  userPoints: number;
  selectedAddress: Address | null;
  addresses: Address[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  applyDiscount: (code: string) => Promise<boolean>;
  removeDiscount: () => void;
  applyPoints: (points: number) => boolean;
  removePoints: () => void;
  fetchUserPoints: () => Promise<void>;
  setSelectedAddress: (address: Address | null) => void;
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, "id">) => Promise<Address | null>;
  deleteAddress: (id: number) => Promise<boolean>;
  setDefaultAddress: (id: number) => Promise<boolean>;
  subtotal: number;
  discountAmount: number;
  pointsDiscount: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "dinhanstore_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const [pointsUsed, setPointsUsed] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSyncedFromDB, setHasSyncedFromDB] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setItems(parsed.items || []);
        setDiscountCode(parsed.discountCode || "");
        setDiscount(parsed.discount || 0);
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ items, discountCode, discount })
    );
  }, [items, discountCode, discount]);

  // Sync cart to database when user is logged in
  const syncCartToDB = useCallback(async () => {
    if (!isLoggedIn || items.length === 0) return;
    
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          discountCode,
          discountPercent: discount,
        }),
      });
    } catch (error) {
      console.error("Error syncing cart to DB:", error);
    }
  }, [isLoggedIn, items, discountCode, discount]);

  // Load cart from database when user logs in
  const loadCartFromDB = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          // Merge with local cart or replace
          setItems(data.items);
          setDiscountCode(data.discountCode || "");
          setDiscount(data.discountPercent || 0);
        }
        setHasSyncedFromDB(true);
      }
    } catch (error) {
      console.error("Error loading cart from DB:", error);
    }
  }, []);

  // Check login status and sync
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          setIsLoggedIn(true);
          if (!hasSyncedFromDB) {
            loadCartFromDB();
          }
        } else if (res.status === 401) {
          setIsLoggedIn(false);
          setHasSyncedFromDB(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, [hasSyncedFromDB, loadCartFromDB]);

  // Debounced sync to DB when cart changes
  useEffect(() => {
    if (!isLoggedIn || !hasSyncedFromDB) return;
    
    const timer = setTimeout(() => {
      syncCartToDB();
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timer);
  }, [items, discountCode, discount, isLoggedIn, hasSyncedFromDB, syncCartToDB]);


  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, quantity: Math.min(quantity, i.stock) } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(async () => {
    setItems([]);
    setDiscount(0);
    setDiscountCode("");
    setPointsUsed(0);
    
    // Clear from database if logged in
    if (isLoggedIn) {
      try {
        await fetch("/api/cart", { method: "DELETE" });
      } catch (error) {
        console.error("Error clearing cart from DB:", error);
      }
    }
  }, [isLoggedIn]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const applyDiscount = useCallback(async (code: string): Promise<boolean> => {
    // Simple discount codes - can be extended with API
    const discounts: Record<string, number> = {
      SALE10: 10,
      SALE20: 20,
      SALE30: 30,
      FREESHIP: 0,
    };

    const discountPercent = discounts[code.toUpperCase()];
    if (discountPercent !== undefined) {
      setDiscountCode(code.toUpperCase());
      setDiscount(discountPercent);
      return true;
    }
    return false;
  }, []);

  const removeDiscount = useCallback(() => {
    setDiscountCode("");
    setDiscount(0);
  }, []);

  // Fetch user points
  const fetchUserPoints = useCallback(async () => {
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        setUserPoints(data.points || 0);
      }
    } catch (error) {
      console.error("Error fetching user points:", error);
    }
  }, []);

  // Apply points (1 point = 1 VND)
  const applyPoints = useCallback(
    (points: number): boolean => {
      if (points <= 0) {
        setPointsUsed(0);
        return true;
      }
      if (points > userPoints) {
        return false; // Not enough points
      }
      // Calculate subtotal inside callback to avoid dependency issue
      const currentSubtotal = items.reduce((sum, item) => {
        const price = item.salePrice || item.price;
        return sum + price * item.quantity;
      }, 0);
      // Max points can be used is subtotal after discount
      const maxPoints = Math.floor(currentSubtotal - (currentSubtotal * discount) / 100);
      const actualPoints = Math.min(points, maxPoints, userPoints);
      setPointsUsed(actualPoints);
      return true;
    },
    [userPoints, items, discount]
  );

  const removePoints = useCallback(() => {
    setPointsUsed(0);
  }, []);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        // Set default address if available
        const defaultAddr = data.find((a: Address) => a.isDefault);
        if (defaultAddr && !selectedAddress) {
          setSelectedAddress(defaultAddr);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  }, [selectedAddress]);

  const addAddress = useCallback(async (address: Omit<Address, "id">): Promise<Address | null> => {
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
      if (res.ok) {
        const newAddress = await res.json();
        setAddresses((prev) => {
          if (newAddress.isDefault) {
            return [...prev.map((a) => ({ ...a, isDefault: false })), newAddress];
          }
          return [...prev, newAddress];
        });
        if (newAddress.isDefault || addresses.length === 0) {
          setSelectedAddress(newAddress);
        }
        return newAddress;
      }
    } catch (error) {
      console.error("Error adding address:", error);
    }
    return null;
  }, [addresses.length]);

  const deleteAddress = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        if (selectedAddress?.id === id) {
          setSelectedAddress(null);
        }
        return true;
      }
    } catch (error) {
      console.error("Error deleting address:", error);
    }
    return false;
  }, [selectedAddress]);

  const setDefaultAddress = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/addresses/${id}/default`, { method: "PUT" });
      if (res.ok) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a.id === id }))
        );
        const addr = addresses.find((a) => a.id === id);
        if (addr) setSelectedAddress(addr);
        return true;
      }
    } catch (error) {
      console.error("Error setting default address:", error);
    }
    return false;
  }, [addresses]);

  const subtotal = items.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = (subtotal * discount) / 100;
  const pointsDiscount = pointsUsed; // 1 point = 1 VND
  const total = Math.max(0, subtotal - discountAmount - pointsDiscount);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        discount,
        discountCode,
        pointsUsed,
        userPoints,
        selectedAddress,
        addresses,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        applyDiscount,
        removeDiscount,
        applyPoints,
        removePoints,
        fetchUserPoints,
        setSelectedAddress,
        fetchAddresses,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        subtotal,
        discountAmount,
        pointsDiscount,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
