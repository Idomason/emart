# Fullstack Order Management System

[![order-management.png](https://i.postimg.cc/qRkRZ06d/order-management.png)](https://postimg.cc/4KSsmD18)
*A complete solution for order tracking with real-time admin-user communication*

## Features
- **User Authentication**: JWT-based login/registration
- **Order Management**: Create, view, and track order status (Review → Processing → Completed)
- **Real-time Chat**: WebSocket-powered communication per order
- **Admin Dashboard**: Manage all orders and chats
- **Responsive UI**: Built with Next.js 15 and Tailwind CSS

## Tech Stack
**Frontend**:
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- React Query
- Socket.IO Client

**Backend**:
- Node.js + Express
- MongoDB (Mongoose)
- Socket.IO
- JWT Authentication

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account or local MongoDB
- Git

### 1. Clone Repository
```bash
git clone https://github.com/your-username/order-management-system.git
cd order-management-system





```typescript:client/lib/hooks/useAuth.ts
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

export const useAuth = () => {
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
};
```

I'll help you create a clean API documentation for your GitHub README based on the codebase. Here's a formatted documentation:

```markdown
# API Documentation

## Authentication Endpoints

### POST /api/v1/auth/login
Authenticate a user and create a session.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "string",
    "role": "user" | "admin",
    "_id": "string"
  }
}
```

### POST /api/v1/auth/signup
Register a new user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "string",
    "_id": "string"
  }
}
```

### POST /api/v1/auth/logout
Logout the current user and clear session.

**Response:**
```json
{
  "success": true
}
```

## Order Endpoints

### GET /api/v1/orders
Get all orders (Admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "user": "string",
      "description": "string",
      "quantity": "number",
      "status": "review" | "completed" | "cancelled",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### GET /api/v1/orders/my-orders
Get orders for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "user": "string",
      "description": "string",
      "quantity": "number",
      "status": "review" | "completed" | "cancelled",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### POST /api/v1/orders
Create a new order.

**Request Body:**
```json
{
  "description": "string",
  "quantity": "number"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "user": "string",
    "description": "string",
    "quantity": "number",
    "status": "review",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### PATCH /api/v1/orders/:id
Update an order.

**Request Body:**
```json
{
  "description": "string",
  "quantity": "number"
}
```

### PATCH /api/v1/orders/:id/status
Update order status (Admin only).

**Request Body:**
```json
{
  "status": "completed" | "cancelled"
}
```

### DELETE /api/v1/orders/:id
Delete an order.

## WebSocket Events

### Authentication
- Connect with JWT token in auth object
- Connection error if token is invalid or missing

### Events
- `joinOrderRoom`: Join a specific order's chat room
- `chatHistory`: Receive chat history when joining a room
- `sendMessage`: Send a message in the current room
- `newMessage`: Receive new messages in the room

### Error Events
- `error`: Receive error messages
- `connect_error`: Connection error details

## Authentication
All endpoints (except login/signup) require authentication via JWT token in cookies.
Admin-only endpoints require an admin role.

## Error Responses
```json
{
  "success": false,
  "message": "Error description"
}
```

## Notes
- All requests that require authentication should include credentials
- API base URL: `http://localhost:5000/api/v1` (configurable via environment)
- WebSocket connection URL: `http://localhost:5000`
```

This documentation covers the main endpoints and WebSocket events in your application, including authentication, order management, and real-time chat functionality. Feel free to customize it further based on your specific needs!
