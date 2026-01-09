import axiosInstance from '@/lib/axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
interface AssignState {
  data: any[];
  loading: boolean;
  error: string | null;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
const initialState: AssignState = {
data: [],
  loading: false,
    error: null,
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
};


export const getAssignedServices = createAsyncThunk(
  'assign/getAssignedServices',
  async (
    params: { page?: number; limit?: number; search?: string } = { page: 1, limit: 10 },
    { rejectWithValue }
  ) => {
    try {
      const { page = 1, limit = 10, search = '' } = params;
      const response = await axiosInstance.get(`/assigned_services`, {
        params: { page, limit, search },
      });
      // Expect response.data.data to be an array of assigned services
      const data = response.data.data || [];
      const pagination = response.data.pagination || {};
      return { data, pagination };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch assigned services');
    }
  }
);

// Fetch assign details by client_id and service_catalog_id
export const getAssignDetails = createAsyncThunk(
  'assign/getAssignDetails',
  async (
    payload: { client_id: string; service_catalog_id: string },
    { rejectWithValue }
  ) => {
    try {
      const { client_id, service_catalog_id } = payload;
      const response = await axiosInstance.get(`/assign_details/${client_id}/${service_catalog_id}`);
      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch assign details');
    }
  }
);

export const delteuserservice = createAsyncThunk(
  'assign/delteuserservice',
  async (
    payload: { id: string },
    { rejectWithValue }
  ) => {
    try {
      const { id } = payload;
      const response = await axiosInstance.delete(`/assigned_services/${id}`);
      return response.data?.data || response.data;
    }
    catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete assigned service');
    }
  }
);


const assignSlice = createSlice({
  name: 'assign',
  initialState,
    reducers: {},
    extraReducers: (builder) => {
    builder
        .addCase(getAssignedServices.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.data = [];
        state.total = 0;
        state.page = 1;
        state.limit = 10;

      }
        )
        .addCase(getAssignedServices.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // action.payload should be { data: [], pagination: { ... } }
        state.data = action.payload?.data || [];
        state.total = action.payload?.pagination?.totalCount || 0;
        state.page = action.payload?.pagination?.page || 1;
        state.limit = action.payload?.pagination?.limit || 10;
        state.totalPages = action.payload?.pagination?.totalPages || 0;
      }
        )
        .addCase(getAssignedServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      }
        )
      .addCase(getAssignDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      }
      )
      
    },
});

export default assignSlice.reducer;
