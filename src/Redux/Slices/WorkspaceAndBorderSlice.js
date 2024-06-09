import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  workspaceId: null,
  BoardId: null,
  userId: null,
  refresh: 0,
};

export const WorkspaceAndBoardSlice = createSlice({
  name: "MainData",
  initialState,
  reducers: {
    setData: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearData: () => {
      return initialState;
    },
  },
});

// Export actions and reducer
export const { setData, clearData } = WorkspaceAndBoardSlice.actions;
export default WorkspaceAndBoardSlice.reducer;

