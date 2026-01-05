import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios";
interface meeState {
    data: any;
    loading: boolean;
    error: string | null;
}

const initialState: meeState = {
    data: null,
    loading: false,
    error: null  ,
};  


export const getmee = createAsyncThunk(
  "mee/getmee",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/mee");
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch mee data");
    }
  }
);


const meeSlice = createSlice({
  name: "mee",
  initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getmee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getmee.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(getmee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});
export const { clearError } = meeSlice.actions;
export default meeSlice.reducer;




