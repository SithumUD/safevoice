# SafeVoice Admin Panel Architecture

## Overview
The Admin Panel is a web-based dashboard designed to manage the SafeVoice application. It provides administrators with the tools needed to oversee user accounts, manage discussion topics, and handle polls, ensuring a safe and engaging environment for the community.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Recommended for fast dashboard building)
- **Database & Authentication**: Supabase (Shared with the React Native mobile app)

## Core Features

### 1. User Management
- **List Users**: View a comprehensive list of all registered users.
- **Access Control**: Change user roles (e.g., User, Moderator, Admin).
- **Moderation**: Suspend, ban, or delete user accounts violating community guidelines.
- **Activity Tracking**: View user activity logs.

### 2. Topic Management
- **Create Topics**: Set up new discussion topics/categories.
- **Edit & Archive**: Modify existing topic details or archive inactive ones.
- **Content Moderation**: Review reported content within specific topics.

### 3. Poll Management
- **Create Polls**: Draft and publish new polls for the community.
- **Manage Status**: Open, close, or delete polls.
- **Analytics**: View real-time results, voting statistics, and engagement metrics.

### 4. Dashboard & Analytics
- **Overview Metrics**: High-level statistics on daily active users, total topics, and total polls.
- **Recent Activity**: A feed of the latest sign-ups, created topics, and recent poll votes.

## Project Structure
As requested, the project strictly uses the Next.js **App Router** and **does not** utilize a `src` directory. All core application logic resides in the root-level `app` directory.

```text
safevoice-admin/
├── app/                        # Next.js App Router (No src folder)
│   ├── (auth)/                 # Route Group: Authentication
│   │   ├── login/
│   │   │   └── page.tsx        # Admin login page
│   ├── (dashboard)/            # Route Group: Authenticated Admin Area
│   │   ├── layout.tsx          # Dashboard Layout (Sidebar, Top Header)
│   │   ├── page.tsx            # Main Dashboard Overview / Metrics
│   │   ├── users/
│   │   │   └── page.tsx        # User Management Data Table
│   │   ├── topics/
│   │   │   ├── page.tsx        # Topics List
│   │   │   └── create/
│   │   │       └── page.tsx    # Form to create a new topic
│   │   └── polls/
│   │       ├── page.tsx        # Polls List
│   │       └── create/
│   │           └── page.tsx    # Form to create a new poll
│   ├── api/                    # API Routes (for webhooks or server actions)
│   ├── globals.css             # Global CSS and Tailwind directives
│   └── layout.tsx              # Root HTML layout and providers
├── components/                 # Reusable React components
│   ├── ui/                     # Primitive UI components (Buttons, Inputs, Dialogs)
│   ├── layout/                 # Layout specific components (SidebarNav, UserNav)
│   ├── data-tables/            # Complex table components for listing data
│   └── forms/                  # Reusable form components
├── lib/                        # Utility functions and configurations
│   ├── supabase/               # Supabase clients (Server and Browser)
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts                # General helper functions (e.g., class names)
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript type definitions (Shared with mobile app)
│   └── supabase.ts             # Generated Supabase types
├── public/                     # Static assets (images, fonts, favicons)
├── middleware.ts               # Next.js middleware (Protecting dashboard routes)
├── .env.local                  # Environment variables (Supabase URL & Anon Key)
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Project dependencies and scripts
```

## Security & Authentication
- **Middleware**: The `middleware.ts` file ensures that unauthenticated users attempting to access the `(dashboard)` route group are immediately redirected to the `/login` page.
- **Supabase SSR**: Utilizes `@supabase/ssr` to securely handle sessions on the server side in Next.js App Router.
- **Role-Based Access Control (RBAC)**: Ensure that the authenticated Supabase user actually has an `admin` role before allowing data mutations on users, topics, or polls.
