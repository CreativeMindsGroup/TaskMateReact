import { configureStore } from '@reduxjs/toolkit';
import AuthReducer from './Slices/AuthSlice';
import WorkspaceAndBorderSlice from './Slices/WorkspaceAndBorderSlice';
import UserCreditionals from './Slices/UserCreditionals';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('reduxState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('reduxState', serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
};

const preloadedState = loadState();

const store = configureStore({
  reducer: {
    auth: AuthReducer,
    userCredentials: UserCreditionals,
    workspaceAndBoard: WorkspaceAndBorderSlice,
  },
  preloadedState: preloadedState,
});

store.subscribe(() => {
  saveState(store.getState());
});

export default store;
