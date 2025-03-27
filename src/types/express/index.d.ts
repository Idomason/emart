import { Server as SocketIOServer } from "socket.io";

declare global {
  namespace Express {
    interface Request {
      io?: SocketIOServer;
      user?: {
        _id: string;
        email: string;
        role: string;
      };
    }
  }
}
