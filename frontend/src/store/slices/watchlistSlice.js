import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchWatchlist = createAsyncThunk('watchlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/watchlist');
    return res.data.watchlist;
  } catch (e) {
    return rejectWithValue(e.response?.data);
  }
});

export const addToWatchlist = createAsyncThunk('watchlist/add', async (symbol, { rejectWithValue }) => {
  try {
    const data = typeof symbol === 'string' ? { symbol } : symbol;
    const res = await api.post('/watchlist', data);
    return res.data.item;
  } catch (e) {
    return rejectWithValue(e.response?.data);
  }
});

export const removeFromWatchlist = createAsyncThunk('watchlist/remove', async (symbol, { rejectWithValue }) => {
  try {
    await api.delete(`/watchlist/${symbol}`);
    return symbol;
  } catch (e) {
    return rejectWithValue(e.response?.data);
  }
});

export const updateAlert = createAsyncThunk('watchlist/updateAlert', async ({ symbol, alertData }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/watchlist/${symbol}/alert`, alertData);
    return res.data.item;
  } catch (e) {
    return rejectWithValue(e.response?.data);
  }
});

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatchlist.pending, (state) => { state.isLoading = true; })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error;
      })
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.symbol !== action.payload);
      })
      .addCase(updateAlert.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i.symbol === action.payload.symbol);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export const { clearError } = watchlistSlice.actions;
export default watchlistSlice.reducer;