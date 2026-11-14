import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItemSize {
  id: string;
  name: string;
  priceDelta: number;
}

export interface CartItemAddOn {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // Composite unique key
  menuItemId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  basePrice: number;
  unitPrice: number;
  image: string;
  size?: CartItemSize | null;
  spiceLevel?: string | null;
  selectedAddOns: CartItemAddOn[];
  specialInstructions?: string;
  quantity: number;
  itemTotal: number;
}

export interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
  subtotal: number;
  taxRate: number; // e.g. 0.085 for 8.5%
  tax: number;
  deliveryFee: number;
  tip: number;
  total: number;
  isOpen: boolean; // Controls cart drawer visibility
}

const TAX_RATE = 0.085; // 8.5% standard tax
const DEFAULT_DELIVERY_FEE = 2.99;

const initialState: CartState = {
  restaurantId: null,
  restaurantName: null,
  items: [],
  subtotal: 0,
  taxRate: TAX_RATE,
  tax: 0,
  deliveryFee: DEFAULT_DELIVERY_FEE,
  tip: 3.0,
  total: 0,
  isOpen: false,
};

const calculateTotals = (state: CartState) => {
  const subtotal = state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  state.subtotal = Number(subtotal.toFixed(2));

  if (state.subtotal === 0) {
    state.tax = 0;
    state.total = 0;
    state.deliveryFee = 0;
    state.restaurantId = null;
    state.restaurantName = null;
    return;
  }

  // Free delivery for orders over $40
  const deliveryFee = state.subtotal >= 40 ? 0 : (state.deliveryFee || DEFAULT_DELIVERY_FEE);
  state.deliveryFee = Number(deliveryFee.toFixed(2));

  const tax = state.subtotal * state.taxRate;
  state.tax = Number(tax.toFixed(2));

  const grandTotal = state.subtotal + state.tax + state.deliveryFee + (state.tip || 0);
  state.total = Number(grandTotal.toFixed(2));
};

export interface AddToCartPayload {
  menuItemId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  basePrice: number;
  image: string;
  size?: CartItemSize | null;
  spiceLevel?: string | null;
  selectedAddOns?: CartItemAddOn[];
  specialInstructions?: string;
  quantity?: number;
  deliveryFee?: number;
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const p = action.payload;
      const quantity = p.quantity && p.quantity > 0 ? p.quantity : 1;
      const addOns = p.selectedAddOns || [];
      const sizePrice = p.size?.priceDelta || 0;
      const addOnsPrice = addOns.reduce((sum, a) => sum + a.price, 0);
      const unitPrice = Number((p.basePrice + sizePrice + addOnsPrice).toFixed(2));

      // Generate composite ID based on item + options
      const sortedAddOnIds = addOns.map((a) => a.id).sort().join(',');
      const compositeId = `${p.menuItemId}_${p.size?.id || 'std'}_${p.spiceLevel || 'def'}_${sortedAddOnIds}_${(p.specialInstructions || '').trim().toLowerCase()}`;

      // Reset cart if adding from a different restaurant
      if (state.restaurantId && state.restaurantId !== p.restaurantId && state.items.length > 0) {
        state.items = [];
      }

      state.restaurantId = p.restaurantId;
      state.restaurantName = p.restaurantName;
      if (typeof p.deliveryFee === 'number') {
        state.deliveryFee = p.deliveryFee;
      }

      const existingIndex = state.items.findIndex((item) => item.id === compositeId);

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
        state.items[existingIndex].itemTotal = Number(
          (state.items[existingIndex].unitPrice * state.items[existingIndex].quantity).toFixed(2)
        );
      } else {
        const newItem: CartItem = {
          id: compositeId,
          menuItemId: p.menuItemId,
          restaurantId: p.restaurantId,
          restaurantName: p.restaurantName,
          name: p.name,
          basePrice: p.basePrice,
          unitPrice,
          image: p.image,
          size: p.size,
          spiceLevel: p.spiceLevel,
          selectedAddOns: addOns,
          specialInstructions: p.specialInstructions,
          quantity,
          itemTotal: Number((unitPrice * quantity).toFixed(2)),
        };
        state.items.push(newItem);
      }

      calculateTotals(state);
      state.isOpen = true; // Open cart preview drawer on addition
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      calculateTotals(state);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== id);
        } else {
          item.quantity = quantity;
          item.itemTotal = Number((item.unitPrice * quantity).toFixed(2));
        }
      }

      calculateTotals(state);
    },

    setTip: (state, action: PayloadAction<number>) => {
      state.tip = Math.max(0, Number(action.payload.toFixed(2)));
      calculateTotals(state);
    },

    setDeliveryFee: (state, action: PayloadAction<number>) => {
      state.deliveryFee = Math.max(0, Number(action.payload.toFixed(2)));
      calculateTotals(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.restaurantId = null;
      state.restaurantName = null;
      state.subtotal = 0;
      state.tax = 0;
      state.deliveryFee = DEFAULT_DELIVERY_FEE;
      state.tip = 3.0;
      state.total = 0;
    },

    toggleCart: (state, action: PayloadAction<boolean | undefined>) => {
      state.isOpen = action.payload !== undefined ? action.payload : !state.isOpen;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setTip,
  setDeliveryFee,
  clearCart,
  toggleCart,
} = cartSlice.actions;

export default cartSlice.reducer;
