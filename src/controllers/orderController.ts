import { Request, Response, NextFunction } from "express";
import Order from "../models/orderModel";
import ChatRoom from "../models/chatRoomModel";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { description, quantity } = req.body;
    const userId = req.user?._id;

    // Create chat room first
    const chatRoom = await ChatRoom.create({
      order: null, // Will be updated after order creation
      isClosed: false,
      messages: [],
    });

    // Create order
    const order = await Order.create({
      user: userId,
      description,
      quantity,
      status: "review",
      chatRoom: chatRoom._id,
    });

    // Update chat room with order reference
    chatRoom.order = order._id;
    await chatRoom.save();

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user?._id })
      .populate("chatRoom", "isClosed")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate("user", "email")
      .populate("chatRoom", "isClosed")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { description, quantity, status } = req.body;
    const orderId = req.params.id;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { description, quantity, status },
      { new: true }
    );

    if (!updatedOrder) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      res.status(400).json({
        success: false,
        message: "Something went wrong, failed to delete order",
      });
      return;
    }

    res
      .status(204)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    // Validate status transition
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    const validTransitions: Record<string, string[]> = {
      review: ["processing"],
      processing: ["completed"],
      completed: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      res.status(400).json({ message: "Invalid status transition" });
      return;
    }

    // Special case: Moving to processing requires closed chat
    if (status === "processing") {
      const chatRoom = await ChatRoom.findById(order.chatRoom);
      if (!chatRoom?.isClosed) {
        res
          .status(400)
          .json({ message: "Chat must be closed before processing" });
        return;
      }
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    next(error);
  }
};
