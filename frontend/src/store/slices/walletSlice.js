import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchWallet = createAsyncThunk('wallet/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/payment/wallet');
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data);
  }
});

export const createDepositOrder = createAsyncThunk(
  'wallet/createOrder',
  async (amount, { rejectWithValue }) => {
    try {
      const res = await api.post('/payment/create-order', { amount });
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data);
    }
  }
);

export const verifyDeposit = createAsyncThunk(
  'wallet/verifyDeposit',
  async (paymentData, { rejectWithValue }) => {
    try {
      const res = await api.post('/payment/verify', paymentData);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data);
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async ({ page = 1, type, status } = {}) => {
    const params = new URLSearchParams({ page, limit: 20 });
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    const res = await api.get(`/payment/transactions?${params}`);
    return res.data;
  }
);

export const initiateWithdrawal = createAsyncThunk(
  'wallet/withdraw',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/payment/withdraw', data);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data);
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance: 0,
    blockedAmount: 0,
    availableBalance: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    totalFeesPaid: 0,
    currency: 'INR',
    transactions: [],
    transactionPagination: null,
    isLoading: false,
    isDepositing: false,
    error: null,
  },
  reducers: {
    updateBalance: (state, action) => {
      state.balance = action.payload;
      state.availableBalance = action.payload - state.blockedAmount;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => { state.isLoading = true; })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error;
      })
      .addCase(verifyDeposit.pending, (state) => { state.isDepositing = true; })
      .addCase(verifyDeposit.fulfilled, (state, action) => {
        state.isDepositing = false;
        state.balance = action.payload.newBalance;
        state.availableBalance = action.payload.newBalance - state.blockedAmount;
        state.totalDeposited += action.payload.transaction?.amount || 0;
      })
      .addCase(verifyDeposit.rejected, (state, action) => {
        state.isDepositing = false;
        state.error = action.payload?.error;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload.transactions;
        state.transactionPagination = action.payload.pagination;
      });
  },
});

export const { updateBalance, clearError } = walletSlice.actions;
export default walletSlice.reducer;