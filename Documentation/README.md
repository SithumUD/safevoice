# 🛡️ SafeVoice — Official Buyer Documentation & Setup Guide

Welcome to **SafeVoice**! This documentation will guide you through setting up, configuring, building, and deploying the complete SafeVoice ecosystem.

---

## 📋 Table of Contents
1. [System Prerequisites](#-system-prerequisites)
2. [Monorepo Overview](#-monorepo-overview)
3. [Quick Start with Docker](#-quick-start-with-docker)
4. [Backend Setup Guide (`safevoice-backend`)](#-backend-setup-guide-safevoice-backend)
5. [Mobile App Guide (`safevoice-app`)](#-mobile-app-guide-safevoice-app)
6. [Admin Panel Guide (`safevoice-admin`)](#-admin-panel-guide-safevoice-admin)
7. [Landing Page Guide (`safevoice-landing`)](#-landing-page-guide-safevoice-landing)
8. [External Service Integrations](#-external-service-integrations)
9. [Default SuperAdmin Credentials](#-default-superadmin-credentials)

---

## 📋 System Prerequisites

Ensure you have the following installed on your server or local machine:
- **Java 21 JDK** (for backend)
- **Node.js 20+ LTS & npm** (for mobile & frontends)
- **Docker & Docker Compose** (Recommended)
- **PostgreSQL 15+** & **Redis 7+**

---

## 📁 Monorepo Overview

| Subproject | Technology | Description |
|---|---|---|
| `safevoice-backend` | Spring Boot 3.4 / Java 21 | REST API, STOMP WebSockets, Flyway migrations, JWT security |
| `safevoice-app` | React Native / Expo 56 | Cross-platform Android & iOS mobile app |
| `safevoice-admin` | Next.js 16 / Tailwind CSS v4 | Admin moderation dashboard & audit log viewer |
| `safevoice-landing` | Next.js 16 / React 19 | Marketing landing page |

---

## ⚡ Quick Start with Docker

```bash
# 1. Clone your project repository and enter directory
cd safevoice

# 2. Create your environment file from template
cp .env.example .env

# 3. Launch PostgreSQL, Redis, and Spring Boot Backend
docker compose up -d --build

# Check running status
docker compose ps
```

---

## 🛠️ Backend Setup Guide (`safevoice-backend`)

```bash
cd safevoice-backend

# 1. Create environment config
cp .env.example .env

# 2. Build backend JAR file
./mvnw clean package -DskipTests

# 3. Run application
java -jar target/safevoice-0.0.1-SNAPSHOT.jar
```

---

## 📱 Mobile App Guide (`safevoice-app`)

```bash
cd safevoice-app

# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# Configure your backend API URL in .env:
# EXPO_PUBLIC_API_URL=http://YOUR_SERVER_IP:8080/api/v1
# EXPO_PUBLIC_WS_URL=ws://YOUR_SERVER_IP:8080/ws

# 3. Start Expo development server
npx expo start
```

### Building APK & AAB
```bash
# Build Android testing APK
npx eas build -p android --profile preview

# Build Android production AAB for Google Play Store
npx eas build -p android --profile production
```

---

## 🔑 Default SuperAdmin Credentials

When the backend starts for the first time, it automatically creates the default SuperAdmin account:
- **Email:** `admin@safevoice.org`
- **Password:** `AdminPassword123!`
- **Role:** `SUPER_ADMIN`
