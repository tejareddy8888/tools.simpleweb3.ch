import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const estimateGas = createAsyncThunk(
  'gasEstimation/estimateGas',
  async ({ client, from, to, data, value }, { rejectWithValue }) => {
    try {
      value = `0x` + `${parseInt(value, 16)}`;
      const response = await client.request({
        method: "eth_estimateGas",
        params: [{ from, to, data, value }],
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const gasEstimationSlice = createSlice({
  name: 'gasEstimation',
  initialState: {
    estimatedGas: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(estimateGas.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(estimateGas.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.estimatedGas = action.payload;
      })
      .addCase(estimateGas.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default gasEstimationSlice.reducer;