"use client";

import React, { useEffect } from "react";
import { useOrders } from "@/lib/hooks/useOrders";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/useAuth";
import { redirect } from "next/navigation";

export default function AdminOrdersPage() {
  const {
    orders,
    isLoading,
    error,
    fetchOrders,
    updateOrderStatus,
    clearError,
  } = useOrders();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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

  const handleStatusUpdate = async (
    id: string,
    status: "completed" | "cancelled"
  ) => {
    try {
      await updateOrderStatus(id, status);
      toast({
        title: "Success",
        description: `Order ${status} successfully`,
      });
    } catch (error) {
      // Error is handled by the orders hook
    }
  };

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersTable
            orders={orders}
            onStatusUpdate={handleStatusUpdate}
            isAdmin={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
