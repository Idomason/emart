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




## API Documentation

Documentation
Emart
An order management app

-**Auth**
User authentication route handlers

POST
SignUp
127.0.0.1:5000/api/v1/auth/signup
﻿

Body
raw (json)
json
{
    "email": "angila@gmail.com",
    "password": "123Angila*"
}
GET
GetMe
127.0.0.1:5000/api/v1/auth/me
This route fetches the data of the authenticated user only.

﻿

Body
raw (json)
json
{
    "email": "mason@gmail.com",
    "password": "u4nahjaj"
}
POST
Login
127.0.0.1:5000/api/v1/auth/login
Login route to authenticate users coming to the platform.

﻿

Body
raw (json)
json
{
    "email": "angila@gmail.com",
    "password": "123Angila*"
}
POST
Logout
127.0.0.1:5000/api/v1/auth/logout
This route logs out the authenticated user

﻿

Body
raw (json)
json
{
    "email": "mason@gmail.com",
    "password": "1"
}
Orders
Users create orders

﻿

GET
Get Orders
127.0.0.1:5000/api/v1/orders/
This API Route fetches all orders in the database. This route is exclusively reserved for the Admin only.

﻿

GET
Get My Orders
127.0.0.1:5000/api/v1/orders/my-orders/
This API Route fetches all user specific orders in the database. In other words, it returns only all the orders created by a user.

﻿

POST
Create Order
127.0.0.1:5000/api/v1/orders/
This route is used to create orders by only an authenticated user.

﻿

Body
raw (json)
json
{
    "description": "80kg bag of white garri and 20 pieces of yam",
    "quantity": "20"
}
PATCH
Update Order
127.0.0.1:5000/api/v1/orders/67e43f0ec26fb7494d9481d4
This route can only be accessed by the admin, it updates orders created by users especially updating users' order status.

﻿

Body
raw (json)
json
{
    "status": "processing"
}
DELETE
Delete Order
127.0.0.1:5000/api/v1/orders/67e43f0ec26fb7494d9481d4
This route is only accessible by the admin, used for deleting users' orders

﻿

PATCH
Update Order Status
127.0.0.1:5000/api/v1/orders/67e448c2136960fbcdf1a270/status
This route updates users' order status, accessible only to the admin.

﻿

Body
raw (json)
json
{
    "status": "completed"
}
Chat Room
﻿

GET
Get Chat Messages
127.0.0.1:5000/api/v1/chats/67e48c0c136960fbcdf1a294
Get all chat messages based on the order with which the chat was created.

﻿






