import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPortfolio = createAsyncThunk('portfolio/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/portfolio');
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data);
  }
});

export const fetchHoldingDetail = createAsyncThunk('portfolio/fetchDetail', async (symbol) => {
  const res = await api.get(`/portfolio/${symbol}`);
  return res.data;
});

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState: {
    holdings: [],
    summary: { totalValue: 0, totalInvested: 0, totalPnL: 0, totalPnLPercent: 0 },
    selectedHolding: null,
    isLoading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {
    updateHoldingPrice: (state, action) => {
      const { symbol, price } = action.payload;
      const holding = state.holdings.find((h) => h.symbol === symbol);
      if (holding) {
        holding.currentPrice = price;
        holding.currentValue = holding.quantity * price;
        holding.pnl = holding.currentValue - holding.totalInvested;
        holding.pnlPercent = holding.totalInvested > 0
          ? (holding.pnl / holding.totalInvested) * 100 : 0;
      }
      // Recalculate summary
      const totals = state.holdings.reduce(
        (acc, h) => ({
          totalValue: acc.totalValue + (h.currentValue || 0),
          totalInvested: acc.totalInvested + (h.totalInvested || 0),
          totalPnL: acc.totalPnL + (h.pnl || 0),
        }),
        { totalValue: 0, totalInvested: 0, totalPnL: 0 }
      );
      state.summary = {
        ...totals,
        totalPnLPercent: totals.totalInvested > 0
          ? (totals.totalPnL / totals.totalInvested) * 100 : 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolio.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.isLoading = false;
        state.holdings = action.payload.holdings;
        state.summary = action.payload.summary;
        state.lastFetched = Date.now();
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error;
      })
      .addCase(fetchHoldingDetail.fulfilled, (state, action) => {
        state.selectedHolding = action.payload;
      });
  },
});

export const { updateHoldingPrice } = portfolioSlice.actions;
export default portfolioSlice.reducer;
