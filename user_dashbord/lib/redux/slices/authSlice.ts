import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import app from '@/app/config/firebase';

/* ================= TYPES ================= */

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender?: string;
  phone?: string;
  country?: string;
  referralSource?: string;
}

export interface UserProfile {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  country?: string;
  city?: string;
  state?: string;
  profile_image?: string;
  role_type?: string;
  status?: string;
}

interface AuthState {
  user: UserProfile | null;
  firebaseUser: any | null;
  loading: boolean;
  error: string | null;
  registrationSuccess: boolean;
  emailVerificationSent: boolean;
}

/* ================= INITIAL STATE ================= */

const initialState: AuthState = {
  user: null,
  firebaseUser: null,
  loading: false,
  error: null,
  registrationSuccess: false,
  emailVerificationSent: false,
};

/* ================= THUNKS ================= */

// Register with email/password
export const registerWithEmail = createAsyncThunk<
  UserProfile,
  RegisterData,
  { rejectValue: string }
>(
  'auth/registerWithEmail',
  async (data, { rejectWithValue }) => {
    try {
      const auth = getAuth(app);
      
      // 1. Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // 2. Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // 4. Register user profile in backend
      const response = await axiosInstance.post('/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        gender: data.gender,
        phone: data.phone,
        country: data.country || 'Australia',
        referralSource: data.referralSource,
      }, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      return response.data.data as UserProfile;
    } catch (error: any) {
      // Handle Firebase errors
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            return rejectWithValue('Email already in use');
          case 'auth/weak-password':
            return rejectWithValue('Password is too weak');
          case 'auth/invalid-email':
            return rejectWithValue('Invalid email address');
          default:
            return rejectWithValue(error.message);
        }
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Registration failed'
      );
    }
  }
);

// Register with Google SSO
export const registerWithGoogle = createAsyncThunk<
  UserProfile,
  { firstName?: string; lastName?: string; phone?: string; gender?: string },
  { rejectValue: string }
>(
  'auth/registerWithGoogle',
  async (additionalData, { rejectWithValue }) => {
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();

      // 1. Sign in with Google popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 2. Get Firebase ID token
      const idToken = await user.getIdToken();

      // 3. Parse name from Google
      const displayName = user.displayName || '';
      const nameParts = displayName.split(' ');
      const firstName = additionalData.firstName || nameParts[0] || '';
      const lastName = additionalData.lastName || nameParts.slice(1).join(' ') || '';

      // 4. Register user profile in backend
      const response = await axiosInstance.post('/auth/register', {
        firstName,
        lastName,
        email: user.email,
        phone: additionalData.phone || user.phoneNumber || '',
        gender: additionalData.gender || '',
        country: 'Australia',
      }, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      return response.data.data as UserProfile;
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return rejectWithValue('Sign-in popup closed');
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Google sign-in failed'
      );
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk<
  UserProfile,
  void,
  { rejectValue: string }
>(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data.data as UserProfile;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user'
      );
    }
  }
);

// Sign out
export const signOut = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const auth = getAuth(app);
      await firebaseSignOut(auth);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/* ================= SLICE ================= */

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
      state.emailVerificationSent = false;
    },
    setFirebaseUser: (state, action: PayloadAction<any>) => {
      state.firebaseUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register with Email
      .addCase(registerWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.registrationSuccess = true;
        state.emailVerificationSent = true;
        state.error = null;
      })
      .addCase(registerWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Registration failed';
        state.registrationSuccess = false;
      })

      // Register with Google
      .addCase(registerWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.registrationSuccess = true;
        state.error = null;
      })
      .addCase(registerWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Google registration failed';
        state.registrationSuccess = false;
      })

      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch user';
      })

      // Sign out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.firebaseUser = null;
        state.error = null;
        state.registrationSuccess = false;
      });
  },
});

export const { clearError, clearRegistrationSuccess, setFirebaseUser } = authSlice.actions;
export default authSlice.reducer;
