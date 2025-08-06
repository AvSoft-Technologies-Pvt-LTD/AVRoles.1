import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://6801242781c7e9fbcc41aacf.mockapi.io/api/AV1/users';

// Register User
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const userWithOtp = {
        ...userData,
        registerOTP: '123456',
        loginOTP: null,
        isVerified: false
      };
      const response = await axios.post(BASE_URL, userWithOtp);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

// Login with Email & Password
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL);
      const user = response.data.find(
        (u) => (u.email === email || u.phone === email) && u.password === password
      );

      if (!user) {
        return rejectWithValue('Invalid credentials');
      }

      const userWithToken = { ...user, token: 'mock-jwt-token-login' };
      localStorage.setItem('user', JSON.stringify(userWithToken));
      localStorage.setItem('token', userWithToken.token);
      localStorage.setItem('email', user.email);
      localStorage.setItem('userId', user.id);

      return userWithToken;
    } catch (error) {
      return rejectWithValue('Login failed');
    }
  }
);

// Send Registration OTP
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL);
      const user = response.data.find((u) => u.phone === phone);
      
      if (!user) {
        return rejectWithValue('User not found');
      }

      const updatedUser = { ...user, registerOTP: '123456' };
      await axios.put(`${BASE_URL}/${user.id}`, updatedUser);

      return { message: 'Registration OTP sent', otp: '123456' };
    } catch (error) {
      return rejectWithValue('Failed to send OTP');
    }
  }
);

// Send Login OTP
export const sendLoginOTP = createAsyncThunk(
  'auth/sendLoginOTP',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL);
      const user = response.data.find((u) => u.phone === phone);
      
      if (!user) {
        return rejectWithValue('User not found');
      }

      const updatedUser = { ...user, loginOTP: '654321' };
      await axios.put(`${BASE_URL}/${user.id}`, updatedUser);

      return { message: 'Login OTP sent', otp: '654321' };
    } catch (error) {
      return rejectWithValue('Failed to send OTP');
    }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phone, otp, type }, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL);
      const user = response.data.find((u) => u.phone === phone);
      
      if (!user) {
        return rejectWithValue('User not found');
      }

      const isValid = (
        (type === 'register' && user.registerOTP === otp) ||
        (type === 'login' && user.loginOTP === otp)
      );

      if (!isValid) {
        return rejectWithValue('Invalid OTP');
      }

      // Mark user as verified if registration OTP
      if (type === 'register') {
        const updatedUser = { ...user, isVerified: true };
        await axios.put(`${BASE_URL}/${user.id}`, updatedUser);
      }

      const userWithToken = {
        ...user,
        token: `mock-jwt-token-${type}-${Date.now()}`,
        isVerified: true
      };

      localStorage.setItem('user', JSON.stringify(userWithToken));
      localStorage.setItem('token', userWithToken.token);

      return userWithToken;
    } catch (error) {
      return rejectWithValue('OTP verification failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isOTPSent: false,
    isVerified: false,
    isAuthenticated: false,
    userType: null,
  },
  reducers: {
    resetAuthState: (state) => {
      state.loading = false;
      state.error = null;
      state.isOTPSent = false;
      state.isVerified = false;
      state.isAuthenticated = false;
      state.user = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.userType = action.payload.userType;
    },
    setUserType: (state, action) => {
      state.userType = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.userType = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('userId');
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.userType = action.payload.userType;
        state.isOTPSent = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.userType = action.payload.userType;
        state.isVerified = true;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send OTP
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.loading = false;
        state.isOTPSent = true;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send Login OTP
      .addCase(sendLoginOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendLoginOTP.fulfilled, (state) => {
        state.loading = false;
        state.isOTPSent = true;
      })
      .addCase(sendLoginOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.userType = action.payload.userType;
        state.isVerified = true;
        state.isAuthenticated = true;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAuthState, setUser, setUserType, logout } = authSlice.actions;
export default authSlice.reducer;