"use client";

import React, { useEffect } from "react";
import { useOrders } from "@/lib/hooks/useOrders";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrderForm } from "@/components/orders/OrderForm";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/useAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function OrdersPage() {
  const orders = useSelector((state: RootState) => state.order?.orders ?? []);
  const isLoading = useSelector(
    (state: RootState) => state.order?.isLoading ?? false
  );
  const error = useSelector((state: RootState) => state.order?.error ?? null);
  const { fetchMyOrders, createOrder, updateOrder, deleteOrder, clearError } =
    useOrders();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleCreateOrder = async (data: {
    description: string;
    quantity: number;
  }) => {
    try {
      await createOrder(data);
      toast({
        title: "Success",
        description: "Order created successfully",
      });
    } catch (error) {
      // Error is handled by the orders hook
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id);
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
    } catch (error) {
      // Error is handled by the orders hook
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">
          Please log in to view your orders
        </h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Order</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderForm onSubmit={handleCreateOrder} isSubmitting={isLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersTable orders={orders} onDelete={handleDeleteOrder} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
