"use client";

import React from "react";
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
  const { data: myOrders = [], isLoading: isLoadingOrders } = useMyOrders();
  const { mutate: createOrder, isLoading: isCreating } = useCreateOrder();
  const { mutate: deleteOrder, isLoading: isDeleting } = useDeleteOrder();

  const handleCreateOrder = async (data: {
    description: string;
    quantity: number;
  }) => {
    createOrder(data, {
      onSuccess: (newOrder) => {
        toast({
          title: "Success",
          description: "Order created successfully",
        });
        // Open chat dialog for the new order
        setSelectedOrder(newOrder);
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create order",
          variant: "destructive",
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
        });
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
        });
      },
    });
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
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
            ) : (
              <OrdersTable
                orders={myOrders}
                onDelete={handleDeleteOrder}
                onSelect={handleOrderSelect}
                isDeleting={isDeleting}
              />
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
