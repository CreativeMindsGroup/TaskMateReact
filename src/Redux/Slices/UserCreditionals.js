import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userId: null,
  email: null,
  emailConfirmed: null,
  role: null,
};

export const UserCredentialsSlice = createSlice({
  name: "UserCredentials",
  initialState,
  reducers: {
    setUserCreditinals: (state, action) => {
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.emailConfirmed = action.payload.emailConfirmed;
      state.role = action.payload.role;
    },
    clearUserCreditinals: (state) => {
      return initialState;
    },
  },
});

// Export actions and reducer
export const { setUserCreditinals, clearUserCreditinals } = UserCredentialsSlice.actions;
export default UserCredentialsSlice.reducer;



