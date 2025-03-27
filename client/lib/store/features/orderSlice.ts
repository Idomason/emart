import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Order } from "@/types/order";

interface OrderState {
  orders: Order[];
  myOrders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  myOrders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    setMyOrders: (state, action: PayloadAction<Order[]>) => {
      state.myOrders = action.payload;
    },
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
      state.myOrders.push(action.payload);
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(
        (order) => order._id === action.payload._id
      );
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      const myOrderIndex = state.myOrders.findIndex(
        (order) => order._id === action.payload._id
      );
      if (myOrderIndex !== -1) {
        state.myOrders[myOrderIndex] = action.payload;
      }
      if (state.selectedOrder?._id === action.payload._id) {
        state.selectedOrder = action.payload;
      }
    },
    removeOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(
        (order) => order._id !== action.payload
      );
      state.myOrders = state.myOrders.filter(
        (order) => order._id !== action.payload
      );
      if (state.selectedOrder?._id === action.payload) {
        state.selectedOrder = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setOrders,
  setMyOrders,
  setSelectedOrder,
  addOrder,
  updateOrder,
  removeOrder,
  setLoading,
  setError,
} = orderSlice.actions;

export default orderSlice.reducer;
