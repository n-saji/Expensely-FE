# Expensely Frontend

[![Live Demo](https://img.shields.io/badge/Demo-Live-blue)](https://expensely-self.vercel.app/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Expensely is a personal finance and expense management web app focused on helping users track spending, manage budgets, monitor recurring transactions, and understand trends through dashboards.

This repository contains the frontend application built with Next.js (App Router), React, TypeScript, Tailwind CSS, and Redux.

Backend repository: https://github.com/n-saji/Expensely

## What This Project Does

Expensely provides a complete spending workflow:

- User authentication and account onboarding
- Expense and income tracking with searchable, filterable tables
- Category management for better spend organization
- Budget setup and budget-vs-spend monitoring
- Recurring expense management
- Dashboard analytics and comparison charts
- Real-time in-app notifications
- Profile, settings, and admin account controls

## Key Features

### Authentication and Account Flows

- Email/password login and registration
- Google OAuth login via NextAuth
- OTP email verification flow
- Forgot password and reset password flows
- Logout route with cookie/session cleanup

### Finance Management

- Expense CRUD (create, read, update, delete)
- Income CRUD
- Budget CRUD with period support (weekly/monthly/yearly/custom)
- Recurring expense CRUD with activate/deactivate actions
- Category CRUD with type-based filtering

### Insights and Reporting UX

- Dashboard with monthly and yearly insights
- Income vs expense comparison chart
- Category and trend visualizations
- Search, sorting, pagination, date range filters

### User Experience

- Theme preference support (light/dark)
- Responsive UI across desktop/mobile
- Toast notifications and confirmation dialogs
- Real-time notification feed using WebSocket

### Admin and Access Control

- Admin user management page
- Activate/deactivate users
- Elevate users to admin role

## Tech Stack

### Core

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4

### State and Data

- Redux Toolkit
- redux-persist
- Axios (with interceptor-based token refresh handling)

### Forms and Validation

- react-hook-form
- Zod

### UI and Visualization

- Radix UI primitives
- shadcn-style UI composition
- Lucide icons + React Icons
- Recharts
- Framer Motion

### Auth and Services

- NextAuth (Google provider)
- Supabase storage (profile images)
- Vercel Analytics + Speed Insights

## High-Level Architecture

- App Router organizes the application into route groups:
  - Public pages (landing/about)
  - Auth flows
  - Protected application pages
- Protected layout hydrates user state from cookie-backed APIs before rendering core pages.
- API calls are made through `/api/*` rewrites in Next.js, proxying to the backend service.
- Global state persists key slices (`user`, `categoryExpense`, `notification`) for smoother UX across refreshes.
- A WebSocket hook streams notifications into Redux and renders them in the notification UI.

## Main Product Areas

- Dashboard
- Expense
- Income
- Budget
- Recurring Expense
- Category
- Profile
- Settings
- Admin

## Project Structure (Simplified)

```text
app/                 # Route groups, pages, layouts, auth handlers
components/          # Shared UI and feature components
redux/               # Store and slices
hooks/               # Custom hooks (e.g., websocket)
lib/                 # API client and helpers
utils/               # Utilities (token, preference, mapping, formatting)
config/              # Runtime config constants
```

## Environment Variables

Create a `.env.local` file and configure at least:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws

NEXTAUTH_SECRET=your-secret
NEXT_PUBLIC_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_CLIENT_SECRET=your-google-client-secret

NEXT_MAINTENANCE_MODE=false
NEXT_WEBSITE_DOWN=false
```

Notes:

- `NEXT_PUBLIC_API_URL` is used for Next.js rewrite proxy targets and API requests.
- `NEXT_PUBLIC_WS_URL` powers in-app real-time notifications.
- Maintenance flags can lock pages behind maintenance screens.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run in development

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
npm run start
```

## Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linting
- `npm run format` - Run Prettier format

## Deployment

The app is currently deployed on Vercel:

- Live URL: https://expensely-self.vercel.app/

For deployment, ensure all required environment variables are configured in your hosting platform.

## Backend Integration

This frontend depends on the Expensely backend APIs for authentication, finance entities, analytics, and admin features.

- Backend repo: https://github.com/n-saji/Expensely

## License

This project is licensed under the MIT License.
