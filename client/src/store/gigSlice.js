import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  gigs: [],
  currentGig: null,
  myGigs: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
  },
};

const gigSlice = createSlice({
  name: 'gigs',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setGigs: (state, action) => {
      state.gigs = action.payload.gigs;
      state.pagination = {
        page: action.payload.page,
        pages: action.payload.pages,
        total: action.payload.total,
      };
      state.loading = false;
      state.error = null;
    },
    setCurrentGig: (state, action) => {
      state.currentGig = action.payload;
      state.loading = false;
    },
    setMyGigs: (state, action) => {
      state.myGigs = action.payload;
      state.loading = false;
    },
    addGig: (state, action) => {
      state.gigs.unshift(action.payload);
      state.myGigs.unshift(action.payload);
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
  setGigs,
  setCurrentGig,
  setMyGigs,
  addGig,
  setError,
  clearError,
} = gigSlice.actions;

export default gigSlice.reducer;