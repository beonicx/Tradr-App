import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const executeTrade = createAsyncThunk('trade/execute', async (tradeData, { rejectWithValue }) => {
  try {
    const res = await api.post('/trade/execute', tradeData);
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || { error: 'Trade failed' });
  }
});

export const fetchTradeHistory = createAsyncThunk(
  'trade/history',
  async ({ page = 1, limit = 20, symbol, type } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (symbol) params.append('symbol', symbol);
    if (type) params.append('type', type);
    const res = await api.get(`/trade/history?${params}`);
    return res.data;
  }
);

export const fetchTradeSummary = createAsyncThunk('trade/summary', async () => {
  const res = await api.get('/trade/summary');
  return res.data;
});

const tradeSlice = createSlice({
  name: 'trade',
  initialState: {
    trades: [],
    pagination: null,
    summary: null,
    isExecuting: false,
    isLoading: false,
    lastTrade: null,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearLastTrade: (state) => { state.lastTrade = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(executeTrade.pending, (state) => { state.isExecuting = true; state.error = null; })
      .addCase(executeTrade.fulfilled, (state, action) => {
        state.isExecuting = false;
        state.lastTrade = action.payload.trade;
      })
      .addCase(executeTrade.rejected, (state, action) => {
        state.isExecuting = false;
        state.error = action.payload?.error || 'Trade failed';
      })
      .addCase(fetchTradeHistory.pending, (state) => { state.isLoading = true; })
      .addCase(fetchTradeHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trades = action.payload.trades;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTradeHistory.rejected, (state) => { state.isLoading = false; })
      .addCase(fetchTradeSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  },
});

export const { clearError, clearLastTrade } = tradeSlice.actions;
export default tradeSlice.reducer;
