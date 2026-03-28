import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [], // [{ product, quantity }]

  addItem: (product) => {
    const items = get().items;
    const existing = items.find(i => i.product.id === product.id);
    if (existing) {
      set({
        items: items.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      });
    } else {
      set({ items: [...items, { product, quantity: 1 }] });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter(i => i.product.id !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  get totalPrice() {
    return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  },

  get itemCount() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));
