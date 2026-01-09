import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "@/app/config/firebase";

const auth = getAuth(app);

interface MeeState {
  data: any;
  loading: boolean;
  error: string | null;
}

const initialState: MeeState = {
  data: null,
  loading: false,
  error: null,
};

// Helper function to wait for auth to be ready
const waitForAuth = (): Promise<any> => {
  return new Promise((resolve) => {
    // If user is already available, resolve immediately
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    
    // Otherwise, wait for auth state to change
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// ✅ FRONTEND ONLY (Firebase) - Now waits for auth to be ready
export const getMee = createAsyncThunk(
  "mee/getMee",
  async (_, { rejectWithValue }) => {
    try {
      // Wait for Firebase Auth to be ready
      const user = await waitForAuth();

      if (!user) {
        return rejectWithValue("User not logged in");
      }

      // You can control what data you want to store
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get user");
    }
  }
);

const meeSlice = createSlice({
  name: "mee",
  initialState,
  reducers: {
    clearMee: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMee.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getMee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMee } = meeSlice.actions;
export default meeSlice.reducer;
