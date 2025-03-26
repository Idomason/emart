# Fullstack Order Management System

![Project Banner](https://via.placeholder.com/1200x400?text=Order+Management+System)  
*A complete solution for order tracking with real-time admin-user communication*

## Features
- **User Authentication**: JWT-based login/registration
- **Order Management**: Create, view, and track order status (Review → Processing → Completed)
- **Real-time Chat**: WebSocket-powered communication per order
- **Admin Dashboard**: Manage all orders and chats
- **Responsive UI**: Built with Next.js 14 and Tailwind CSS

## Tech Stack
**Frontend**:
- Next.js 14 (App Router)
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
