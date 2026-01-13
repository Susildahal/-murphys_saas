import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './slices/profileSlice';
import serviceReducer from './slices/serviceSlice';
import categoryReducer from './slices/categorySlice';
import meeReducer from './slices/meeSlice';
import { inviteSlice } from './slices/inviteSlicer';
import assignSlice  from './slices/assignSlice';
import roleReducer from './slices/roleSlice';
import permissionReducer from './slices/permissionSlice';
import siteSettingReducer from './slices/siteSettingSlice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    services: serviceReducer,
    categories: categoryReducer,
    mee: meeReducer,
    invite: inviteSlice.reducer,
    assign: assignSlice,
    role: roleReducer,
    permission: permissionReducer,
    siteSettings: siteSettingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
