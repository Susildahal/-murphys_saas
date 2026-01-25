import axiosInstance from "@/lib/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface DashboardState {
    totalProfiles: number;
    totalServices: number;
    totalAssigned: number;
    totalNotices: number;
    unreadNotices: number;
    totalCategories: number;
    activeService: number;
    inactiveService: number;
    recentAssign: any[];
    // User specific fields
    openTickets: number;
    pendingInvoices: number;
    totalSpent: number;
    loading: boolean;
    error: string | null;
}
const initialState: DashboardState = {
    totalProfiles: 0,
    totalServices: 0,
    totalAssigned: 0,
    totalNotices: 0,
    unreadNotices: 0,
    totalCategories: 0,
    activeService: 0,
    inactiveService: 0,
    recentAssign: [],
    openTickets: 0,
    pendingInvoices: 0,
    totalSpent: 0,
    loading: false,
    error: null,
};

export const fetchDashboardStats = createAsyncThunk(
    "dashboard/fetchStats",
    async ({ filter = 'all', email }: { filter?: string, email?: string }, { rejectWithValue }) => {
        try {
            if (email) {
                const response = await axiosInstance.get("/user-stats", {
                    params: { filter, email }
                });
                return { ...response.data, isUser: true };
            }
            const response = await axiosInstance.get("/stats", {
                params: { filter }
            });
            return { ...response.data, isUser: false };
        }
        catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch dashboard stats");
        }
    }
);

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.isUser) {
                    // Populate user specific stats
                    const { stats, recentServices } = action.payload;
                    state.activeService = stats.activeServices;
                    state.openTickets = stats.openTickets;
                    state.pendingInvoices = stats.pendingInvoices;
                    state.totalSpent = stats.totalSpent;
                    state.unreadNotices = stats.unreadNotices;
                    state.recentAssign = recentServices;
                    // Reset others or keep them?
                    state.totalServices = 0;
                    state.totalProfiles = 0;
                } else {
                    // Populate admin stats
                    state.totalProfiles = action.payload.totalProfiles;
                    state.totalServices = action.payload.totalServices;
                    state.totalAssigned = action.payload.totalAssigned;
                    state.totalNotices = action.payload.totalNotices;
                    state.unreadNotices = action.payload.unreadNotices;
                    state.totalCategories = action.payload.totalCategories;
                    state.activeService = action.payload.activeService;
                    state.inactiveService = action.payload.inactiveService;
                    state.recentAssign = action.payload.recentAssign;
                }
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default dashboardSlice.reducer;
export const dashboardActions = dashboardSlice.actions;
