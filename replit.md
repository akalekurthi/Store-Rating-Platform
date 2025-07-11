# Store Rating System

## Overview

This is a full-stack web application for rating stores with role-based access control. The system allows users to submit ratings for registered stores with different functionalities based on user roles (Admin, User, Store Owner).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state
- **UI Components**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Express sessions with bcrypt password hashing
- **API Design**: RESTful endpoints with role-based middleware
- **Development**: Hot module replacement with Vite integration

## Key Components

### Database Schema
- **Users Table**: id, name, email, password, address, role, timestamps
- **Stores Table**: id, name, email, address, owner_id, average_rating, total_ratings, timestamps
- **Ratings Table**: id, user_id, store_id, rating (1-5), review, timestamps with unique constraint

### Authentication System
- Session-based authentication using express-session
- Role-based access control (admin, user, store_owner)
- Password hashing with bcryptjs
- Middleware for protecting routes and checking roles

### User Roles & Permissions
1. **System Administrator**
   - Add users, stores, and admin users
   - View dashboard with statistics
   - Manage all users and stores with filtering
   - Full CRUD operations

2. **Normal User**
   - Sign up and login
   - Update password
   - View and search stores
   - Submit and update ratings

3. **Store Owner**
   - View owned stores
   - Monitor ratings and reviews
   - Update password

### API Endpoints
- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/stores/*` - Store management
- `/api/ratings/*` - Rating management
- `/api/statistics` - Dashboard statistics

## Data Flow

1. **Authentication Flow**
   - User credentials validated against database
   - Session created on successful login
   - Role-based routing on frontend

2. **Rating Flow**
   - Users browse stores with search/filter
   - Submit ratings (1-5 stars) with optional reviews
   - Store average rating calculated automatically
   - Unique constraint prevents duplicate ratings per user/store

3. **Admin Operations**
   - CRUD operations for users and stores
   - Statistics aggregation for dashboard
   - Filtering and search across all entities

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Query)
- UI components (Radix UI primitives)
- Form handling (React Hook Form, Zod)
- Styling (Tailwind CSS, class-variance-authority)
- Icons (Lucide React)
- Date handling (date-fns)

### Backend Dependencies
- Express.js with TypeScript support
- Drizzle ORM for database operations
- Neon serverless PostgreSQL driver
- Session management (express-session, connect-pg-simple)
- Password hashing (bcryptjs)
- WebSocket support for database connections

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation via tsx
- Database migrations with Drizzle Kit
- Environment variables for database connection

### Production
- Frontend built with Vite and served as static files
- Backend bundled with esbuild for Node.js
- Database schema managed with Drizzle migrations
- Session store using PostgreSQL via connect-pg-simple

### Configuration
- TypeScript configuration with path mapping
- Tailwind CSS with custom design tokens
- PostCSS for CSS processing
- ESM modules throughout the application

The application follows a monorepo structure with clear separation between client, server, and shared code, making it maintainable and scalable for the store rating use case.