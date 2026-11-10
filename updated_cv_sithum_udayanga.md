# SITHUM UDAYANGA
**FULL STACK & CLOUD ENGINEER**  
+94 70 257 5370 | sithumudayangaofficial@gmail.com | 23/1, Mudagamuwa, Bemmulla, Sri Lanka  
[www.sithumud.me](https://www.sithumud.me) | [linkedin.com/in/sithumud](https://linkedin.com/in/sithumud)

---

## PROFILE
Growth-minded Software Engineering undergraduate with hands-on experience in Java, Spring Boot, React.js/Next.js, Material UI, PostgreSQL, Redis, RabbitMQ, and Cloud-native development. Freelancing since January 2025, delivering client projects ranging from portfolio websites to distributed, cloud-hosted platforms. Completed a Software Engineering internship at the Sri Lanka Air Force, gaining real-world system experience. Strong analytical and problem-solving skills, with a passion for turning complex ideas into clean, well-architected distributed systems.

### Key Highlights
- **Delivered 6+ full-stack and cloud-based applications** as a freelance developer since 2025, spanning event-driven microservices, real-time systems, and cloud-oriented deployment architecture on AWS and Digital Ocean.
- **Contributed as a frontend developer to NEMIS**, a national government education platform, and built its Flutter mobile app.

---

## SKILLS
- **Languages & Frameworks:** Java, Spring Boot 3/4, Spring Cloud Gateway, Spring Security, React.js / Next.js 14/16 (App Router, Turbopack, Tailwind CSS, Zustand, TanStack Query), React Native (Expo), Material UI (MUI), HTML, CSS, JavaScript/TypeScript, Flutter, .NET Core
- **Architecture & Messaging:** Microservices Architecture, Event-Driven Architecture (EDA), RabbitMQ (AMQP), REST APIs, WebSocket (STOMP), JWT / OAuth2, Keycloak (IAM), Cloudinary Integration
- **Databases & Caching:** PostgreSQL, MySQL, Redis, Firebase, Relational DB Design, Indexing & Constraints, Flyway Migrations
- **Cloud & DevOps:** AWS (ECS Fargate, RDS, S3, ALB, Secrets Manager), Digital Ocean (Droplets, Managed Databases, Spaces), Docker & Kubernetes, Terraform, CI/CD, GitHub Actions, Git
- **Tools & Practices:** Figma, Agile Methodologies, Payment Gateway Integration (PayHere), Testcontainers, JUnit 5

---

## WORK EXPERIENCE

### Sri Lanka Air Force | *Software Engineering Intern* (2025 – 2026)
- Contributed as a Frontend Developer to NEMIS (National Education Management Information System), a nationwide platform serving the Ministry of Education, schools, teachers, students, and parents.
- Designed responsive UI/UX prototypes in Figma and built the Flutter mobile application used by teachers, students, and administrators.

### Freelance Full-Stack Developer | *Self-Employed* (Jan 2025 – Present)
- Delivered 6+ client projects across e-commerce, education, and tourism sectors, owning the full lifecycle from requirements and UI/UX design to development, deployment, and client handover.

---

## PROJECT EXPERIENCE

### Blue Ceylon — Distributed, Event-Driven Tourism Marketplace & Booking Platform
*Java 21/8, Spring Boot 3/4, Spring Cloud Gateway, Spring Security, Keycloak (IAM), RabbitMQ, PostgreSQL, Redis, Cloudinary CDN, Next.js 16 (App Router, Turbopack), Tailwind CSS, Zustand, PayHere, AWS ECS Fargate, Docker, GitHub Actions*

- **Microservices & IAM Architecture:** Architected a 6-microservice platform (*API Gateway, Auth Service, Catalog Service, Booking Service, Payment Service, Notification Service*) unifying Sri Lankan Hotels, Tour Agencies, and Independent Tour Guides behind a standardized booking & verification lifecycle.
- **Automated Verification & Domain Event Escalation:** Built an automated SLTDA profile verification workflow with auto-saving draft pre-fill and read-only protection for pending applications; implemented a RabbitMQ event backbone (`BusinessApprovedEvent`) that automatically promotes verified users from `TRAVELER` to `BUSINESS_OWNER` across PostgreSQL and Keycloak IAM.
- **Seamless Media Management & Cloudinary CDN Integration:** Engineered a high-throughput media upload service (`/api/v1/catalog/media/upload`) integrating Cloudinary for instant client-side image and promotional video uploads, persisting CDN links into custom PostgreSQL text columns.
- **Resilient Auth Interceptor & Token Refreshing:** Designed a client-side API fetch interceptor in Next.js that silently handles access token expiration by catching `401 Unauthorized` responses and executing background Keycloak refresh token requests (`POST /api/v1/auth/refresh`) to retry failed requests without user disruption.
- **Multi-Tenant Owner Dashboard:** Built complete property management modules for Business Owners including Room Manager, Tour Package Manager (with automatic `ownerType` resolution), Day-Out / Night-Out Experience Packages, Blackout Date availability calendar, and customer review response handling.

---

### CricketIQ — Cricket Analytics & Insights Platform
*Java 21, Spring Boot 3, Next.js 14, PostgreSQL, Redis, Docker, Digital Ocean, Terraform, GitHub Actions*
- Built a full-stack analytics platform ingesting ball-by-ball data to compute phase- and matchup-specific performance metrics beyond raw scorecards.
- Designed a normalized PostgreSQL schema with materialized views and a Redis-cached Spring Boot REST API; containerized with Docker and configured for deployment on Digital Ocean via Terraform, with a Next.js 14 frontend and GitHub Actions CI/CD.

---

### SafeVoice — Enterprise Anonymous Civic Engagement & Community Safety Ecosystem
*Java 21, Spring Boot 3.4, React Native (Expo SDK 56), Next.js 16 (App Router), PostgreSQL 15, Redis 7, Firebase (FCM), Cloudinary CDN, Brevo API, Docker, Nginx, DigitalOcean, Netlify, GitHub Actions*

- **Multi-Platform Monorepo Architecture:** Engineered an enterprise civic safety platform combining a high-concurrency Spring Boot 3 REST & STOMP WebSocket API, a React Native (Expo SDK 56) cross-platform mobile app, a Next.js 16 Admin Moderation Portal, and a Next.js 16 marketing landing page.
- **Dual-Identity & Cryptographic Anonymity System:** Implemented a privacy-centric dual-identity engine supporting verified public profiles as well as cryptographically masked identity generation per thread, protecting whistleblowers and community reporters while maintaining secure JWT authentication.
- **Real-Time Polling & Multi-Channel Notification Engine:** Built interactive polling with real-time WebSocket (STOMP) broadcasts and Redis-cached tally recalculations; integrated Firebase Cloud Messaging (FCM) for mobile push alerts and Brevo API for transactional emails.
- **Enterprise Content Governance & Audit Trail:** Designed a moderation queue workflow (`PENDING`, `UNDER_REVIEW`, `RESOLVED`, `DISMISSED`) for flagged content and user suspensions with Role-Based Access Control (RBAC), backed by an immutable system audit log capturing moderator actions, IP addresses, and JSON metadata.
- **Cloud Infrastructure & Production DevOps:** Containerized backend services with Docker Compose, configured Nginx reverse proxy with SSL/TLS termination on a DigitalOcean Droplet, deployed web frontends on Netlify CDN, and automated CI/CD pipelines using GitHub Actions.

---

### POS and Inventory Management System
*Java 21, Spring Boot 3, Next.js 14, PostgreSQL, RabbitMQ, Redis, WebSocket (STOMP), Docker, GitHub Actions*
- Built a full-stack POS and inventory platform with barcode-driven checkout, an immutable stock-movement ledger, and role-based access (Admin, Manager, Cashier) replacing manual stock counts and paper-based sales tracking.
- Designed an event-driven checkout flow — a completed sale publishes a `SaleCompleted` event consumed independently by stock deduction, low-stock checks, and analytics — decoupling side effects from the core checkout path via RabbitMQ.
- Implemented concurrency-safe multi-terminal stock sync using optimistic locking and WebSocket (STOMP) broadcasts, preventing overselling across terminals.
- Built a reorder-suggestion engine using rolling sales velocity to flag low-stock products, and a reporting dashboard covering sales trends, stock valuation, and profit margins.

---

### Tour Renting Website
*Java, Spring Boot, React.js, Bootstrap, MySQL, XAMPP Server*
- Built a Java/Spring Boot/React.js booking platform for a local tour operator, replacing phone/WhatsApp bookings with self-service availability checks.
- Implemented end-to-end reservation logic and a responsive Bootstrap UI for browsing and booking across devices.

---

### ApeIskole — School Community Website
*React.js, Tailwind CSS, .NET Core, PostgreSQL, Docker*
- Built a central online presence for a school to replace paper notices, showcasing events, enabling donations, and boosting community engagement.
- Developed the .NET Core backend and PostgreSQL data layer, containerized with Docker for simplified deployment.

---

### EDUTrack-Pro: School Management System
*React.js, Tailwind CSS, .NET Core, PostgreSQL, Docker*
- Built a unified system for student records, attendance, exams, staff, and fees, replacing fragmented spreadsheets and paper records.
- Designed role-based access and built attendance/fee-tracking modules to reduce manual paperwork for school staff.

---

## EDUCATION
- **BSc (Hons) Software Engineering (Top-up)** — NIBM | From Nov 2026 (Part-Time) (Year 3, continuing to Year 4)
- **Higher National Diploma (HND) in Software Engineering** — NIBM *(Lectures completed; repeat exams pending)*
- **Diploma in Software Engineering** — NIBM *(Completed)*
- **Diploma in Information Technology (DITECH)** — ESOFT Metro Campus | 2018 – 2019 *(Completed)*

---

## REFERENCES
- **Dr. Thisara Weerasinghe** — Lecturer, National Institute of Business Management (NIBM) | `thisara@nibm.lk`
- **R G Vimukthi Pathirana** — Lecturer, National Institute of Business Management (NIBM) | `vimukthi@nibm.lk`
