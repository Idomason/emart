"use client";

import React, { useEffect } from "react";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrderForm } from "@/components/orders/OrderForm";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  useMyOrders,
  useCreateOrder,
  useDeleteOrder,
} from "@/lib/hooks/orders";
import { Loader2 } from "lucide-react";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { Order } from "@/types/order";

export default function OrdersPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  // Use React Query hooks
  const {
    data: myOrders = [],
    isLoading: isLoadingOrders,
    refetch,
  } = useMyOrders();
  const { mutate: createOrder, isLoading: isCreating } = useCreateOrder();
  const { mutate: deleteOrder, isLoading: isDeleting } = useDeleteOrder();

  // Setup periodic refetching for real-time updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 2000); // Refetch every 2 seconds

    return () => clearInterval(intervalId);
  }, [refetch]);

  const handleCreateOrder = async (data: {
    description: string;
    quantity: number;
  }) => {
    createOrder(data, {
      onSuccess: (newOrder) => {
        toast({
          title: "Success",
          description: "Order created successfully",
          duration: 3000,
        });

        // Force refetch to ensure immediate updates
        refetch();

        // Open chat dialog for the new order
        setSelectedOrder(newOrder);
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create order",
          variant: "destructive",
          duration: 3000,
        });
      },
    });
  };

  const handleDeleteOrder = async (id: string) => {
    deleteOrder(id, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Order deleted successfully",
          duration: 3000,
        });

        // Force refetch to ensure immediate updates
        refetch();

        // Close chat dialog if the deleted order was selected
        if (selectedOrder?._id === id) {
          setSelectedOrder(null);
        }
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to delete order",
          variant: "destructive",
          duration: 3000,
        });
      },
    });
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  if (!user) {
    return null; // Let the middleware handle the redirect
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Order</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderForm onSubmit={handleCreateOrder} isSubmitting={isCreating} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : myOrders.length > 0 ? (
              <OrdersTable
                orders={myOrders}
                onDelete={handleDeleteOrder}
                onSelect={handleOrderSelect}
                isDeleting={isDeleting}
              />
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                You haven't created any orders yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedOrder && (
        <ChatDialog
          order={selectedOrder}
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
