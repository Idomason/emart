import mongoose from "mongoose";
import User from "../models/userModel";
import Order from "../models/orderModel";
import { Request, Response, NextFunction } from "express";
import ChatRoom from "../models/chatRoomModel";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, role } = req.body;
    const userId = new mongoose.Types.ObjectId(req.params.id);

    if (userId.equals(req.user?._id) && role && role !== "admin") {
      res
        .status(403)
        .json({ message: "Cannot remove your own admin privileges" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { email, role },
      { new: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);

    if (userId.equals(req.user?._id)) {
      res.status(403).json({ message: "Cannot delete your own account" });
      return;
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await Order.deleteMany({ user: userId });
    const orders = await Order.find({ user: userId });
    await ChatRoom.deleteMany({ order: { $in: orders.map((o) => o._id) } });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
