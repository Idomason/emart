import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Order } from "@/types/order";

const orderSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  quantity: z
    .number()
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity must be less than 100"),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  initialData?: Partial<Order>;
  onSubmit: (data: OrderFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      description: initialData?.description || "",
      quantity: initialData?.quantity || 1,
    },
  });

  const handleSubmit = async (data: OrderFormData) => {
    try {
      await onSubmit(data);
      if (!initialData) {
        form.reset();
      }
    } catch (error) {
      // Error handling is managed by the parent component
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your order description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Submitting..."
            : initialData
            ? "Update Order"
            : "Create Order"}
        </Button>
      </form>
    </Form>
  );
};
