# Store Rating Platform

A full-stack web application for rating and reviewing stores, with role-based dashboards for admins, store owners, and users.

## Features
- User registration, login, and password management
- Role-based dashboards:
  - **Admin**: Manage users and stores
  - **Store Owner**: Manage owned stores and view ratings
  - **User**: Rate and review stores
- Add and manage stores (store owners)
- Rate stores (users)
- View store ratings and reviews
- Responsive UI with modern design

## Tech Stack
- **Frontend**: React (TypeScript), Tailwind CSS, Vite, Radix UI, React Query
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (via Drizzle ORM)
- **State Management**: React Query
- **Authentication**: Passport.js (local strategy)
- **Validation**: Zod

## Database Schema
- **Users**: id, name, email, password, address, role (admin/user/store_owner), timestamps
- **Stores**: id, name, email, address, ownerId, averageRating, totalRatings, timestamps
- **Ratings**: id, userId, storeId, rating (1-5), review, timestamps

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/akalekurthi/Store-Rating-Platform.git
   cd Store-Rating-Platform
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Create a `.env` file in the root with your database and session secrets. Example:
     ```env
     DATABASE_URL=postgres://user:password@localhost:5432/store_rating
     SESSION_SECRET=your_secret
     PORT=5000
     ```
4. **Run database migrations:**
   ```bash
   npm run db:push
   ```
5. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5000](http://localhost:5000)

## Scripts
- `npm run dev` — Start the server in development mode
- `npm run build` — Build frontend and backend for production
- `npm start` — Start the production server
- `npm run db:push` — Run Drizzle ORM migrations

## Folder Structure
- `client/` — Frontend React app
- `server/` — Backend Express server
- `shared/` — Shared types and schema

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
