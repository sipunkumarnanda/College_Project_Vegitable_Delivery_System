
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

// ✅ FETCH CART
export const fetchCart = createAsyncThunk(
"cart/fetchCart",
async (_, { rejectWithValue }) => {
try {
const res = await api.get("/cart");
return res.data?.data?.items || [];
} catch (err) {
return rejectWithValue(
err.response?.data?.message || "Failed to fetch cart"
);
}
}
);

// ✅ ADD TO CART (WITH QUANTITY)
export const addToCart = createAsyncThunk(
"cart/addToCart",
async ({ productId, quantity }, { rejectWithValue }) => {
try {
const res = await api.post("/cart/add", {
productId,
quantity,
});
return res.data?.data?.items || [];
} catch (err) {
return rejectWithValue(
err.response?.data?.message || "Failed to add to cart"
);
}
}
);

// ✅ REMOVE FROM CART
export const removeFromCart = createAsyncThunk(
"cart/removeFromCart",
async (productId, { rejectWithValue }) => {
try {
const res = await api.post("/cart/remove", { productId });
return res.data?.data?.items || [];
} catch (err) {
return rejectWithValue(
err.response?.data?.message || "Failed to remove item"
);
}
}
);

// ✅ UPDATE QUANTITY
export const updateCartQuantity = createAsyncThunk(
"cart/updateQuantity",
async ({ productId, quantity }, { rejectWithValue }) => {
try {
const res = await api.post("/cart/update", {
productId,
quantity,
});
return res.data?.data?.items || [];
} catch (err) {
return rejectWithValue(
err.response?.data?.message || "Failed to update quantity"
);
}
}
);

const cartSlice = createSlice({
name: "cart",
initialState: {
items: [],
loading: false,
error: null,
isLoaded: false,
},
reducers: {},

extraReducers: (builder) => {
builder


  // FETCH
  .addCase(fetchCart.pending, (state) => {
    state.loading = true;
    state.isLoaded = false;
  })
  .addCase(fetchCart.fulfilled, (state, action) => {
    state.loading = false;
    state.items = action.payload;
    state.isLoaded = true;
  })
  .addCase(fetchCart.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.isLoaded = true;
  })

  // ADD
  .addCase(addToCart.pending, (state) => {
    state.loading = true;
  })
  .addCase(addToCart.fulfilled, (state, action) => {
    state.loading = false;
    state.items = action.payload;
  })
  .addCase(addToCart.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })

  // REMOVE
  .addCase(removeFromCart.fulfilled, (state, action) => {
    state.items = action.payload;
  })

  // UPDATE
  .addCase(updateCartQuantity.fulfilled, (state, action) => {
    state.items = action.payload;
  });

},
});

export default cartSlice.reducer;
