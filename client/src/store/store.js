import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import gigReducer from './gigSlice';
import bidReducer from './bidSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    gigs: gigReducer,
    bids: bidReducer,
  },
});

export default store;