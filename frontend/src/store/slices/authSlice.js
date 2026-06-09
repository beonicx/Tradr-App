import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { accessToken, refreshToken, user } = response.data;
    if (accessToken) {
      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
        ['user', JSON.stringify(user)],
      ]);
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Login failed' });
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    console.log('🔐 Registering user:', userData.email);

    // Clean up userData - remove empty phone
    const cleanData = { ...userData };
    if (cleanData.phone === '' || cleanData.phone === null || cleanData.phone === undefined) {
      delete cleanData.phone;
    }

    console.log('   Sending data:', { ...cleanData, password: '[HIDDEN]' });

    const response = await api.post('/auth/register', cleanData);
    console.log('✅ Registration successful:', response.data.user?.email);

    const { accessToken, refreshToken, user } = response.data;
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ]);
    return response.data;
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    console.error('   Response:', error.response?.data);
    console.error('   Status:', error.response?.status);

    // Extract specific error message
    let errorMessage = 'Registration failed';
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.details) {
      // Validation errors
      const details = error.response.data.details;
      errorMessage = details.map(d => d.message || d.msg).join(', ');
    } else if (error.message === 'Network Error' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to server. Please check your connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return rejectWithValue({ error: errorMessage });
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } catch {}
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
});

export const loadUser = createAsyncThunk('auth/loadUser', async () => {
  const [[, token], [, userStr]] = await AsyncStorage.multiGet(['accessToken', 'user']);
  if (token && userStr) {
    return { user: JSON.parse(userStr), accessToken: token };
  }
  return null;
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const response = await api.patch('/user/profile', data);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    isLoading: false,
    isAuthenticated: false,
    isInitialized: false,
    error: null,
    requiresTwoFactor: false,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearTwoFactor: (state) => { state.requiresTwoFactor = false; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.requiresTwoFactor) {
          state.requiresTwoFactor = true;
        } else {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.isAuthenticated = true;
          state.requiresTwoFactor = false;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Login failed';
      })
      .addCase(register.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Registration failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isInitialized = true;
        if (action.payload) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.isAuthenticated = true;
        }
      })
      .addCase(loadUser.rejected, (state) => { state.isInitialized = true; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError, setUser, clearTwoFactor } = authSlice.actions;
export default authSlice.reducer;
