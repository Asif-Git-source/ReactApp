/**
 * REDUX TOOLKIT — configureStore
 *
 * Redux Toolkit simplifies Redux setup by combining the store, reducers,
 * middleware, and DevTools in one call. RTK Query (createApi) is built-in
 * and handles async data fetching with automatic caching + loading states.
 */
import { configureStore } from '@reduxjs/toolkit';
import { dashboardApi } from '../features/dashboard/api';
import boardReducer from '../features/board/boardSlice';
import teamReducer from '../features/team/teamSlice';

export const store = configureStore({
  reducer: {
    board: boardReducer,
    team: teamReducer,
    // RTK Query automatically manages its own slice in the store
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dashboardApi.middleware),
});

// Infer types from the store itself — no need to maintain separate type files
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
