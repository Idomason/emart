import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/order";
import { formatDate } from "@/lib/utils";

interface OrdersTableProps {
  orders: Order[];
  onStatusUpdate?: (id: string, status: Order["status"]) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onSelect?: (order: Order) => void;
  isAdmin?: boolean;
}

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "review":
      return "bg-yellow-500";
    case "completed":
      return "bg-green-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onStatusUpdate,
  onDelete,
  onSelect,
  isAdmin = false,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell className="font-medium">{order.description}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell className="space-x-2">
                {isAdmin && onStatusUpdate && order.status === "review" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusUpdate(order._id, "completed")}
                    >
                      Complete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusUpdate(order._id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {onSelect && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelect(order)}
                  >
                    View
                  </Button>
                )}
                {onDelete && order.status === "review" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(order._id)}
                  >
                    Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
