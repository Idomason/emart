import { Request, Response, NextFunction } from "express";
import Order from "../models/orderModel";
import ChatRoom from "../models/chatRoomModel";

export const getChatMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = req.params.orderId;

    // Verify user has access to this order's chat
    const order = await Order.findOne({
      _id: orderId,
      $or: [
        { user: req.user?._id }, // Owner
        ...(req.user?.role === "admin" ? [{}] : []), // Admin can access any
      ],
    });

    if (!order) {
      res.status(404).json({ message: "Order not found or access denied" });
      return;
    }

    const chatRoom = await ChatRoom.findOne({ order: orderId }).populate(
      "messages.user",
      "email role"
    );

    if (!chatRoom) {
      res.status(404).json({ message: "Chat room not found" });
      return;
    }

    res.json({
      messages: chatRoom.messages,
      isClosed: chatRoom.isClosed,
      summary: chatRoom.summary,
    });
  } catch (error) {
    next(error);
  }
};

export const closeChatRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = req.params.orderId;
    const { summary } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    if (order.status !== "review") {
      res
        .status(400)
        .json({ message: "Only orders in review can have chats closed" });
      return;
    }

    const chatRoom = await ChatRoom.findOneAndUpdate(
      { order: orderId },
      {
        isClosed: true,
        summary,
        $set: { "messages.$[].timestamp": new Date() }, // Update all message timestamps
      },
      { new: true }
    );

    if (!chatRoom) {
      res.status(404).json({ message: "Chat room not found" });
      return;
    }

    // Notify via WebSocket (handled in socket service)
    req.io?.to(`order_${orderId}`).emit("chatClosed", {
      orderId,
      summary,
      closedBy: req.user?.email,
      timestamp: new Date(),
    });

    res.json(chatRoom);
  } catch (error) {
    next(error);
  }
};

export const getClosedChats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const chats = await ChatRoom.find({ isClosed: true })
      .populate("order", "description status")
      .populate("messages.user", "email");
    res.json(chats);
  } catch (error) {
    next(error);
  }
};
