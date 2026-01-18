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
  createdAt: string;
  updatedAt: string;
}

interface CartState {
  cart: CartItem | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

// Add service to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ userid, serviceId }: { userid: string; serviceId: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/cart/add', { userid, serviceId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

// Get cart by user ID
export const getCart = createAsyncThunk(
  'cart/getCart',
  async (userid: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/cart/${userid}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Cart doesn't exist yet
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

// Remove service from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ userid, serviceId }: { userid: string; serviceId: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/cart/remove', { userid, serviceId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (userid: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/cart/clear', { userid });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
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
    builder.addCase(addToCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addToCart.fulfilled, (state, action) => {
      state.loading = false;
      state.cart = action.payload;
    });
    builder.addCase(addToCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Get cart
    builder.addCase(getCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCart.fulfilled, (state, action) => {
      state.loading = false;
      state.cart = action.payload;
    });
    builder.addCase(getCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Remove from cart
    builder.addCase(removeFromCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeFromCart.fulfilled, (state, action) => {
      state.loading = false;
      state.cart = action.payload;
    });
    builder.addCase(removeFromCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Clear cart
    builder.addCase(clearCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(clearCart.fulfilled, (state, action) => {
      state.loading = false;
      state.cart = action.payload;
    });
    builder.addCase(clearCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Update cart status
    builder.addCase(updateCartStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
    }
    );
    builder.addCase(updateCartStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
    });
    builder.addCase(updateCartStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
    });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
