import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';
import { Service } from '@/types/service';
import axios from '@/lib/axios';

export interface CartItem {
  _id: string;
  userid: string;
  Services: Array<{
    serviceId: Service;
    status: 'pending' | 'confirmed';
    confirmedAt?: string;
    _id: string;
  }>;
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface CartState {
  cart: CartItem | null;
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  total: 0,
};

// Compute cart total from services, applying discounts if present
const computeCartTotal = (cart: CartItem | null): number => {
  if (!cart || !Array.isArray(cart.Services)) return 0;
  let sum = 0;
  for (const item of cart.Services) {
    const svc: any = item.serviceId;
    if (!svc || typeof svc.price !== 'number') continue;
    let price = Number(svc.price) || 0;
    if (svc.hasDiscount && svc.discountValue) {
      if (svc.discountType === 'percentage') {
        price = price - (price * (svc.discountValue || 0) / 100);
      } else {
        price = price - (svc.discountValue || 0);
      }
    }
    // ensure non-negative
    if (price < 0) price = 0;
    sum += price;
  }
  return sum;
};


// Get cart by user ID
export const getCart = createAsyncThunk(
  'cart/getCart',
  async (userid: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/cart/${userid}`);
      const total = response.data.total || 0;
      return response.data.cart;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Cart doesn't exist yet
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const updateCartStatus = createAsyncThunk(
  'cart/updateCartStatus',
  async ({ userid, serviceId, status }: { userid: string; serviceId: string; status: string }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.patch('/cart/update-status', { userid, serviceId, status });
        return response.data;
    }
    catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update cart status');
    }
    }
);

export const getAllCarts = createAsyncThunk(
  'cart/getAllCarts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/cart/all');
      return response.data.carts;
    }
    catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch carts');
    }
  }
);



const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.cart = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Add to cart
  

    // Get cart
    builder.addCase(getCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCart.fulfilled, (state, action) => {
      state.loading = false;
      state.cart = action.payload;
      state.total = computeCartTotal(state.cart);
    });
    builder.addCase(getCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    // Update cart status
    builder.addCase(updateCartStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
    }
    );
    builder.addCase(updateCartStatus.fulfilled, (state, action) => {
        state.loading = false;
      state.cart = action.payload;
      state.total = computeCartTotal(state.cart);
    });
    builder.addCase(updateCartStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
    });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
