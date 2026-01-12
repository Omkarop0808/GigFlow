import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bids: [],
  myBids: [],
  loading: false,
  error: null,
};

const bidSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setBids: (state, action) => {
      state.bids = action.payload;
      state.loading = false;
      state.error = null;
    },
    setMyBids: (state, action) => {
      state.myBids = action.payload;
      state.loading = false;
    },
    addBid: (state, action) => {
      state.bids.unshift(action.payload);
      state.myBids.unshift(action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setBids,
  setMyBids,
  addBid,
  setError,
  clearError,
} = bidSlice.actions;

export default bidSlice.reducer;
