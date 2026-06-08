import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTopMovers = createAsyncThunk('market/fetchMovers', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/market/movers');
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data);
  }
});

export const searchStocks = createAsyncThunk('market/search', async (query, { rejectWithValue }) => {
  try {
    const res = await api.get(`/market/search?q=${encodeURIComponent(query)}`);
    return res.data.results || [];
  } catch (e) {
    return rejectWithValue(e.response?.data);
  }
});

export const fetchChartData = createAsyncThunk(
  'market/fetchChart',
  async ({ symbol, timespan = 'day', multiplier = 1, from, to }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ timespan, multiplier });
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      const res = await api.get(`/market/chart/${symbol}?${params}`);
      return { symbol, data: res.data.data || [] };
    } catch (e) {
      return rejectWithValue(e.response?.data);
    }
  }
);

export const fetchStockDetails = createAsyncThunk('market/fetchDetails', async (symbol) => {
  const res = await api.get(`/market/stock/${symbol}`);
  return { symbol, details: res.data };
});

export const fetchMarketStatus = createAsyncThunk('market/fetchStatus', async () => {
  const res = await api.get('/market/status');
  return res.data;
});

const marketSlice = createSlice({
  name: 'market',
  initialState: {
    liveData: {},
    gainers: [],
    losers: [],
    searchResults: [],
    chartData: {},
    stockDetails: {},
    marketStatus: null,
    isLoading: false,
    isSearching: false,
    error: null,
  },
  reducers: {
    updateLivePrice: (state, action) => {
      const { symbol, price } = action.payload;
      const prev = state.liveData[symbol];
      state.liveData[symbol] = {
        ...prev,
        ...action.payload,
        prevPrice: prev?.price || price,
        direction: prev?.price ? (price > prev.price ? 'up' : price < prev.price ? 'down' : 'neutral') : 'neutral',
      };
    },
    clearSearch: (state) => { state.searchResults = []; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopMovers.pending, (state) => { state.isLoading = true; })
      .addCase(fetchTopMovers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gainers = action.payload.gainers || [];
        state.losers = action.payload.losers || [];
      })
      .addCase(fetchTopMovers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error;
      })
      .addCase(searchStocks.pending, (state) => { state.isSearching = true; })
      .addCase(searchStocks.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchStocks.rejected, (state) => { state.isSearching = false; })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.chartData[action.payload.symbol] = action.payload.data;
      })
      .addCase(fetchStockDetails.fulfilled, (state, action) => {
        state.stockDetails[action.payload.symbol] = action.payload.details;
      })
      .addCase(fetchMarketStatus.fulfilled, (state, action) => {
        state.marketStatus = action.payload;
      });
  },
});

export const { updateLivePrice, clearSearch, clearError } = marketSlice.actions;
export default marketSlice.reducer;
