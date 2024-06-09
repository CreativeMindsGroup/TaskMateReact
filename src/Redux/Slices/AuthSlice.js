import { createSlice } from "@reduxjs/toolkit";
import { clearUserCreditinals } from "./UserCreditionals";
import { clearData } from "./WorkspaceAndBorderSlice";

const initialState = {
  token: null,
  refreshToken: null,
  refreshTokenExpiration: null,
  email: null,
  expireDate: null,
};

export const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginAction: (state, action) => {
      state.token = action.payload.data.token;
      state.email = action.payload.data.email;
      state.expireDate = action.payload.data.expireDate;
      state.refreshToken = action.payload.data.refreshToken;
      state.refreshTokenExpiration = action.payload.data.refreshTokenExpiration;
    },
    logoutAction: (state) => {
      return initialState;
    },
    registerAction: (state, action) => {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearUserCreditinals, (state) => {
      return initialState;
    });
    builder.addCase(clearData, (state) => {
      return initialState;
    });
  },
});

// Export actions and reducer
export const { loginAction, logoutAction, registerAction } = AuthSlice.actions;
export default AuthSlice.reducer;
