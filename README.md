# 🛡️ SafeVoice — Enterprise Anonymous Civic Engagement & Community Safety Platform

[![Build & Test CI](https://github.com/sithum/Safevoice/actions/workflows/ci.yml/badge.svg)](https://github.com/sithum/Safevoice/actions/workflows/ci.yml)
[![Deployment CD](https://github.com/sithum/Safevoice/actions/workflows/deploy.yml/badge.svg)](https://github.com/sithum/Safevoice/actions/workflows/deploy.yml)
[![Java Version](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4%2B-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React Native](https://img.shields.io/badge/React%20Native-0.85%20%7C%20Expo%2056-61dafb.svg)](https://reactnative.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16%20App%20Router-black.svg)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ed.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**SafeVoice** is an enterprise-grade, privacy-centric civic engagement and community safety discussion ecosystem. It empowers citizens and organization members to securely report issues, engage in anonymous community discussions, participate in real-time polls, and receive verified safety notifications without compromising their identity.

The platform is engineered as a production-ready monorepo combining a high-concurrency **Spring Boot 3 (Java 21)** REST & WebSocket API, a **React Native (Expo)** cross-platform mobile application, a **Next.js 16** Admin Moderation Portal, and a **Next.js 16** marketing landing page—backed by **PostgreSQL 15**, **Redis 7**, **Firebase FCM**, and cloud media pipelines.

---

## 📋 Table of Contents
- [✨ Key System Features](#-key-system-features)
- [🏗️ System Architecture & Infrastructure](#️-system-architecture--infrastructure)
- [🛠️ Tech Stack & Engineering Standards](#️-tech-stack--engineering-standards)
- [📁 Monorepo Structure](#-monorepo-structure)
- [📦 Core Functional Modules](#-core-functional-modules)
  - [📱 Cross-Platform Mobile App (`safevoice-app`)](#-cross-platform-mobile-app-safevoice-app)
  - [⚡ Enterprise Backend Service (`safevoice-backend`)](#-enterprise-backend-service-safevoice-backend)
  - [🛡️ Admin Moderation Portal (`safevoice-admin`)](#️-admin-moderation-portal-safevoice-admin)
  - [🌐 Public Landing Page (`safevoice-landing`)](#-public-landing-page-safevoice-landing)
- [🗄️ Database Schema & Data Governance](#️-database-schema--data-governance)
- [🚀 DevOps & Production VM Deployment](#-devops--production-vm-deployment)
  - [🐳 Container Orchestration](#-container-orchestration)
  - [🔒 Security & Reverse Proxy (Nginx + SSL + UFW)](#-security--reverse-proxy-nginx--ssl--ufw)
  - [🔄 Automated CI/CD Pipeline (GitHub Actions)](#-automated-cicd-pipeline-github-actions)
- [⚙️ Local Development Setup](#️-local-development-setup)
- [📡 API Documentation & Security](#-api-documentation--security)
- [🔑 Environment Variables Guide](#-environment-variables-guide)

---

## ✨ Key System Features

### 🔒 Dual-Identity & Privacy Controls
- **Anonymous Posting Mode**: Cryptographically masked identity generation per topic/comment thread to protect whistleblowers and community reporters.
- **Verified Public Profiles**: Standard authenticated posting for official community feedback with avatar customization and user statistics.

### 📊 Real-Time Community Polls & Engagement
- Embedded single-choice and multiple-choice polling with instant Redis-cached tally recalculations.
- Upvote/Downvote reactions on topics and nested comments with atomic database counters.

### 🔔 Multi-Channel Notification Engine
- **Push Notifications**: Integrated Firebase Cloud Messaging (FCM) for mobile notifications.
- **Real-Time Live Updates**: STOMP over WebSockets for instant in-app alerts and live comment feeds.
- **Email Notifications**: Transactional emails powered by Brevo API for password resets and critical security alerts.

### 🖼️ Cloud Media Pipeline
- Direct signed media uploads for images and videos powered by Cloudinary API integration.

### 🛡️ Enterprise Content Governance & Audit Trail
- Comprehensive flagging system for topics, comments, and users.
- Moderation Queue with detailed reporter context, review notes, and action states (`PENDING`, `UNDER_REVIEW`, `RESOLVED`, `DISMISSED`).
- Immutable **System Audit Logs** capturing admin/moderator actions, IP addresses, target IDs, and timestamped JSON metadata.

---

## 🏗️ System Architecture & Infrastructure

The SafeVoice ecosystem follows a decoupled microservices-ready architecture containerized with Docker and orchestrated on dedicated Linux Virtual Machines (VMs/VPS).

```
                             ┌──────────────────────────────────────────────┐
                             │           CLIENT LAYER (iOS / Android / Web) │
                             └──────┬──────────────────┬──────────────┬─────┘
                                    │                  │              │
                                    ▼                  ▼              ▼
                            ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
                            │  Mobile App  │   │ Admin Portal │   │ Landing Site │
                            │ (React Native│   │ (Next.js 16) │   │ (Next.js 16) │
                            └───────┬──────┘   └──────┬───────┘   └──────┬───────┘
                                    │                 │                  │
                                    └─────────────────┼──────────────────┘
                                                      │ HTTPS / STOMP WSS
                                                      ▼
                                       ┌───────────────────────────────┐
                                       │   LINUX VM / VPS INSTANCE     │
                                       │                               │
                                       │  ┌─────────────────────────┐  │
                                       │  │  Nginx Reverse Proxy    │  │
                                       │  │  (Let's Encrypt SSL/TLS)│  │
                                       │  └───────────┬─────────────┘  │
                                       │              │ Port 8080      │
                                       │  ┌───────────▼─────────────┐  │
                                       │  │   Spring Boot Backend   │  │
                                       │  │   (Java 21 Runtime)     │  │
                                       │  └───────┬───────────┬─────┘  │
                                       │          │           │        │
                                       │  ┌───────▼────┐  ┌───▼─────┐  │
                                       │  │ PostgreSQL │  │  Redis  │  │
                                       │  │    15      │  │    7    │  │
                                       │  └────────────┘  └─────────┘  │
                                       └───────────────────────────────┘
```

---

## 🛠️ Tech Stack & Engineering Standards

| Domain | Technologies |
|---|---|
| **Backend Core** | Java 21, Spring Boot 3.4+, Spring Data JPA, Spring Security, Spring WebMVC, Spring WebSocket |
| **Database & Caching** | PostgreSQL 15, Redis 7 (Session & Tally Cache), Flyway Migration Engine |
| **Mobile App** | React Native 0.85, Expo SDK 56, TypeScript, React Navigation v7, Reanimated v4, FlashList |
| **Admin & Web** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React Icons |
| **Cloud Services** | Firebase Admin SDK (FCM), Cloudinary API (Media storage), Brevo API (Transactional Mail) |
| **Security** | JWT (Stateless Token Authentication), Password Hashing (BCrypt), RBAC, CORS Policies |
| **DevOps & Infrastructure** | Docker, Docker Compose, Linux VM (Ubuntu 24.04 LTS), Nginx, Certbot SSL, UFW, GitHub Actions CI/CD |

---

## 📁 Monorepo Structure

```text
Safevoice/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated build, test, and linting pipeline
│       └── deploy.yml             # SSH automated VM deployment pipeline
├── safevoice-backend/            # Java 21 / Spring Boot 3 REST & WebSocket API
│   ├── src/main/java/com/sithum/safevoice/
│   │   ├── config/                # Security, Redis, WebSocket & Cloudinary Config
│   │   ├── controller/            # REST Controllers (Auth, Topic, Comment, Poll, Admin)
│   │   ├── dto/                   # Request / Response Transfer Objects
│   │   ├── model/                 # JPA Entities (User, Topic, Comment, Poll, Report, AuditLog)
│   │   ├── repository/            # Spring Data JPA Repositories
│   │   └── service/               # Core Business Logic & External API Services
│   ├── src/main/resources/
│   │   ├── db/migration/          # Versioned Flyway SQL Migrations (V1..V4)
│   │   └── application.yml        # Environment Profiles (dev, test, prod)
│   ├── Dockerfile                 # Multi-stage JDK 21 Build File
│   └── pom.xml                    # Maven Dependency Manifest
├── safevoice-app/                 # React Native / Expo Cross-Platform Mobile Application
│   ├── src/
│   │   ├── components/            # Reusable UI Components (Cards, Spinners, Polls)
│   │   ├── navigation/            # Navigation Stacks & Bottom Tabs (React Navigation 7)
│   │   ├── screens/               # Screen Views (Home, Topic Detail, Create, Profile, Admin)
│   │   ├── services/              # API Client Services (Axios Interceptors, STOMP)
│   │   └── types/                 # TypeScript Type Definitions
│   ├── App.tsx                    # Mobile App Entrypoint
│   └── package.json               # Expo & Mobile Dependencies
├── safevoice-admin/               # Next.js 16 Enterprise Admin & Moderation Portal
│   ├── app/                       # App Router Pages & API Routes
│   ├── components/                # Moderation Tables, Audit Views & Stat Counters
│   ├── Dockerfile                 # Standalone Node production build
│   └── package.json
├── safevoice-landing/             # Next.js 16 Marketing & Product Download Page
│   ├── app/                       # Public Marketing Interface
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml             # Multi-container Production & Local Dev Setup
├── PRODUCTION_DEPLOYMENT_AND_TESTING_GUIDE.md # Master DevOps & Setup Guide
└── .env                           # Centralized Environment Configuration Template
```

---

## 📦 Core Functional Modules

### 📱 Cross-Platform Mobile App (`safevoice-app`)
The mobile application provides a fluid, responsive experience engineered for Android and iOS devices.
- **Feed System**: Optimized infinite scrolling using `@shopify/flash-list` with filtering by category (Safety, General, Infrastructure, Emergency) and sorting by Trending/Latest.
- **Topic & Poll Creation**: Dynamic form builder supporting image/video pickers, anonymous toggles, and multi-option poll creation.
- **Nested Discussions**: Threaded comment view supporting multi-depth replies, reaction buttons, and media preview modals.
- **Offline Resilience & Caching**: Local session management via `@react-native-async-storage/async-storage` and active connection monitoring via `@react-native-community/netinfo`.

### ⚡ Enterprise Backend Service (`safevoice-backend`)
The backend is built on Spring Boot 3 using Java 21, adhering to domain-driven design and enterprise security principles.
- **Stateless JWT Security**: Custom `JwtAuthenticationFilter` validating Bearer tokens with configurable expiration and refresh token rotation.
- **Database Migrations**: Flyway SQL scripts ensure strict versioning of table structures, foreign key constraints, and JSON payload fields.
- **WebSocket STOMP Integration**: Channel subscription management (`/topic/topics`, `/topic/notifications`) for sub-second client state updates.
- **OpenAPI / Swagger Specs**: Interactive REST API documentation exposed at `/swagger-ui/index.html`.

### 🛡️ Admin Moderation Portal (`safevoice-admin`)
A dedicated control panel for platform moderators and community managers.
- **Report Management Queue**: Filter reported topics and comments by severity and review status. Perform one-click moderation actions (Dismiss, Hide Content, Ban User).
- **User Governance**: Overview of user status (`ACTIVE`, `SUSPENDED`, `Banned`) with privilege management (Role switching between `USER`, `MODERATOR`, `ADMIN`).
- **Audit Log Viewer**: Full observability into system actions, IP addresses, and moderation events.

### 🌐 Public Landing Page (`safevoice-landing`)
A SEO-optimized, highly aesthetic web presence showcasing SafeVoice's privacy guarantees, technical architecture, and app distribution links.

---

## 🗄️ Database Schema & Data Governance

The database is built on **PostgreSQL 15** with strict relational integrity, indexed foreign keys, and UUID primary keys.

```sql
users ───────────< topics ───────────< comments
  │                   │                   │
  │                   ├───< polls         └───< comment_reactions
  │                   │       │
  │                   │       └───< poll_options
  │                   │               │
  │                   │               └───< user_poll_votes
  │                   │
  ├───< notifications ├───< topic_reactions
  │                   │
  ├───< reports       └───< saved_topics
  │
  └───< audit_logs
```

### Core Entities Breakdown
1. **`users`**: User identity, credential hash, role (`USER`, `MODERATOR`, `ADMIN`), status (`ACTIVE`, `SUSPENDED`, `BANNED`), and activity metrics.
2. **`topics`**: Main forum entries supporting anonymous IDs, media attachment URLs, view counts, and trending status flags.
3. **`comments`**: Threaded replies containing `parent_comment_id` for recursive depth tracking.
4. **`polls` & `poll_options`**: Dynamic poll definitions linked 1:1 to topics, tracking single/multiple choice rules and vote totals.
5. **`user_poll_votes`**: Composite primary key `(user_id, poll_id, option_id)` enforcing double-vote prevention.
6. **`reports`**: Moderation tickets linking reporters to target content/users with review history.
7. **`audit_logs`**: Immutable record of administrative operations storing JSON context payloads.

---

## 🚀 DevOps & Production VM Deployment

SafeVoice uses a professional Linux Virtual Machine (VM/VPS) deployment pattern, demonstrating production-ready cloud engineering standards.

### 🐳 Container Orchestration
The root `docker-compose.yml` configures microservices with Docker bridge networking and automated healthchecks.

```bash
# Launch production services on Linux VM
docker compose --profile prod up -d --build
```

- **Production Profile (`prod`)**: Spawns PostgreSQL 15, Redis 7, Spring Boot API, Next.js Admin Dashboard, and Next.js Landing Page containers.
- **Isolated Bridge Network (`safevoice-net`)**: Ensures internal database and Redis ports remain unexposed to the public internet.

### 🔒 Security & Reverse Proxy (Nginx + SSL + UFW)
For VM deployments (e.g. AWS EC2, Hetzner, DigitalOcean), Nginx operates as the high-performance reverse proxy and SSL termination point.

1. **UFW Firewall Configuration**:
   ```bash
   ufw allow 22/tcp   # SSH
   ufw allow 80/tcp   # HTTP
   ufw allow 443/tcp  # HTTPS
   ufw --force enable
   ```

2. **Nginx Reverse Proxy Block (`/etc/nginx/sites-available/safevoice-api`)**:
   ```nginx
   server {
       server_name api.safevoice.domain.com;

       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "Upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Automated SSL/TLS Encryption**:
   ```bash
   certbot --nginx -d api.safevoice.domain.com
   ```

### 🔄 Automated CI/CD Pipeline (GitHub Actions)
The repository enforces continuous integration and automated deployment across two GitHub Workflows:

- **CI Pipeline (`.github/workflows/ci.yml`)**:
  - Compiles Spring Boot application on **Java 21 (Temurin)** and executes unit tests.
  - Runs TypeScript type checking (`tsc --noEmit`) for the mobile application.
  - Builds Next.js production packages for Admin and Landing applications.

- **CD Automated VM Deployment (`.github/workflows/deploy.yml`)**:
  - Triggers automatically upon merging into `main`.
  - Connects to the Linux VM via encrypted SSH (`appleboy/ssh-action`).
  - Fetches latest source code, rebuilds zero-downtime containers via `docker compose --profile prod up -d --build`, and prunes dangling images.
  - Deploys Next.js Web applications to global CDN hosting endpoints.

---

## ⚙️ Local Development Setup

### Prerequisites
- **JDK 21** or higher
- **Node.js v20+** & **npm**
- **Docker Desktop** & **Docker Compose**
- **Android Studio / Xcode** (for mobile emulator testing)

### Step 1: Clone & Configure Environment
```bash
git clone https://github.com/sithum/Safevoice.git
cd Safevoice
cp .env.example .env  # Or edit .env with your local credentials
```

### Step 2: Start Infrastructure (PostgreSQL & Redis)
```bash
# Start Redis container locally
docker compose up -d redis
```

### Step 3: Launch Spring Boot Backend
```bash
cd safevoice-backend
mvn spring-boot:run
```
*The API server will start on `http://localhost:8080` and run Flyway database migrations automatically.*

### Step 4: Launch Web Portals
- **Admin Dashboard**:
  ```bash
  cd safevoice-admin
  npm install
  npm run dev
  ```
  *Accessible at `http://localhost:3000`*

- **Landing Page**:
  ```bash
  cd safevoice-landing
  npm install
  npm run dev
  ```
  *Accessible at `http://localhost:3001`*

### Step 5: Start React Native Mobile App
```bash
cd safevoice-app
npm install
npx expo start
```
*Press `a` to launch Android Emulator or `i` for iOS Simulator.*

---

## 📡 API Documentation & Security

### Endpoints Overview
When running the backend, interactive documentation is available via **Swagger UI**:
`http://localhost:8080/swagger-ui/index.html`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register new user account |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/v1/topics` | Authenticated | Fetch paginated topics list |
| `POST` | `/api/v1/topics` | Authenticated | Create a new topic / poll |
| `POST` | `/api/v1/topics/{id}/vote` | Authenticated | Cast vote on embedded topic poll |
| `POST` | `/api/v1/comments` | Authenticated | Add nested comment to topic |
| `GET` | `/api/v1/admin/reports` | Admin / Mod | List flagged moderation tickets |
| `PATCH` | `/api/v1/admin/users/{id}/status` | Admin | Update user account state |
| `GET` | `/api/v1/admin/audit-logs` | Admin | Retrieve system operational audit logs |

---

## 🔑 Environment Variables Guide

Key configuration variables located in `.env`:

```env
# ── Database Configuration ──
POSTGRES_DB=safevoice_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YourSecurePassword123!
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/safevoice_db

# ── Redis Caching ──
SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6379

# ── Security & Authentication ──
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=900000
JWT_REFRESH_EXPIRATION_MS=604800000

# ── Cloud Integration Credentials ──
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@safevoice.com

GOOGLE_APPLICATION_CREDENTIALS=/path/to/firebase-service-account.json
```

---

## 📄 License & Author

**Author**: Sithum  
**Repository**: [github.com/sithum/Safevoice](https://github.com/sithum/Safevoice)  
**License**: Open-source under the [MIT License](LICENSE).
