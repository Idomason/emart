import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { ordersApi } from "@/lib/api-client/orders";
import {
  setOrders,
  setMyOrders,
  setSelectedOrder,
  addOrder,
  updateOrder as updateOrderAction,
  removeOrder,
  setLoading,
  setError,
} from "@/lib/store/features/orderSlice";
import { CreateOrderInput, Order, UpdateOrderInput } from "@/types/order";

export const useOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.order?.orders ?? []);
  const myOrders = useSelector(
    (state: RootState) => state.order?.myOrders ?? []
  );
  const selectedOrder = useSelector(
    (state: RootState) => state.order?.selectedOrder ?? null
  );
  const isLoading = useSelector(
    (state: RootState) => state.order?.isLoading ?? false
  );
  const error = useSelector((state: RootState) => state.order?.error ?? null);

  const fetchOrders = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await ordersApi.getAllOrders();
      dispatch(setOrders(data));
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error ? error.message : "Failed to fetch orders"
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const fetchMyOrders = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await ordersApi.getMyOrders();
      dispatch(setMyOrders(data));
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error ? error.message : "Failed to fetch your orders"
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const createOrder = useCallback(
    async (data: CreateOrderInput) => {
      try {
        dispatch(setLoading(true));
        const newOrder = await ordersApi.createOrder(data);
        dispatch(addOrder(newOrder));
        return newOrder;
      } catch (error) {
        dispatch(
          setError(
            error instanceof Error ? error.message : "Failed to create order"
          )
        );
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const updateOrder = useCallback(
    async (id: string, data: UpdateOrderInput) => {
      try {
        dispatch(setLoading(true));
        const updatedOrder = await ordersApi.updateOrder(id, data);
        dispatch(updateOrderAction(updatedOrder));
        return updatedOrder;
      } catch (error) {
        dispatch(
          setError(
            error instanceof Error ? error.message : "Failed to update order"
          )
        );
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const updateOrderStatus = useCallback(
    async (id: string, status: Order["status"]) => {
      try {
        dispatch(setLoading(true));
        const updatedOrder = await ordersApi.updateOrderStatus(id, status);
        dispatch(updateOrderAction(updatedOrder));
        return updatedOrder;
      } catch (error) {
        dispatch(
          setError(
            error instanceof Error
              ? error.message
              : "Failed to update order status"
          )
        );
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const deleteOrder = useCallback(
    async (id: string) => {
      try {
        dispatch(setLoading(true));
        await ordersApi.deleteOrder(id);
        dispatch(removeOrder(id));
      } catch (error) {
        dispatch(
          setError(
            error instanceof Error ? error.message : "Failed to delete order"
          )
        );
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const selectOrder = useCallback(
    (order: Order | null) => {
      dispatch(setSelectedOrder(order));
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(setError(null));
  }, [dispatch]);

  return {
    orders,
    myOrders,
    selectedOrder,
    isLoading,
    error,
    fetchOrders,
    fetchMyOrders,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    selectOrder,
    clearError,
  };
};
