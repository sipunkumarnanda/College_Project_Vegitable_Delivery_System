
import { createSlice } from '@reduxjs/toolkit';

const addressSlice = createSlice({
  name: 'address',
  initialState: {
    list: [],
  },
  reducers: {
    setAddresses: (state, action) => {
      state.list = action.payload;
    },
    addAddress: (state, action) => {
      state.list.push(action.payload);
    },
    clearAddress: (state) => {
      state.list = [];
    }
  }
});

export const { setAddresses, addAddress, clearAddress } = addressSlice.actions;
export default addressSlice.reducer;