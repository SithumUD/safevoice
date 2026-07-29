# SafeVoice — Ultimate Beginner-Friendly Production Deployment & Testing Master Guide

> 🔰 **Designed for First-Time Deployers**: This guide contains every single command, button click, file edit, and verification step required to deploy the complete SafeVoice ecosystem from scratch without any prior DevOps experience.

---

## 📋 PRE-FLIGHT CHECKLIST: What You Need Before Starting

Before running any commands, make sure you have the following accounts and files ready:

| # | Item | Where to Get It / Notes |
|---|---|---|
| 1 | **Hetzner VPS** | Ubuntu 24.04 LTS server (IPv4 address & `root` password). |
| 2 | **GitHub Account** | Repository containing your SafeVoice code. |
| 3 | **Netlify Account** | Free account at [netlify.com](https://www.netlify.com). |
| 4 | **Firebase Project** | Firebase Admin JSON file (`safevoice-38eda-firebase-adminsdk-fbsvc-6b444b6abe.json`). |
| 5 | **Brevo Account** | Free API key from [brevo.com](https://www.brevo.com) for password reset emails. |
| 6 | **Cloudinary Account** | Cloud name, API Key, and API Secret from [cloudinary.com](https://cloudinary.com). |

---

## 🏗️ ARCHITECTURE MAP: Where Everything Lives

```
                     ┌───────────────────────────────────────────┐
                     │          USER / CLIENT DEVICES            │
                     └─────┬──────────────────┬──────────────┬───┘
                           │                  │              │
                           ▼                  ▼              ▼
                   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
                   │ Mobile Apps  │   │ Admin Panel  │   │ Landing Site │
                   │  (iOS/Android│   │  (Netlify)   │   │  (Netlify)   │
                   └───────┬──────┘   └──────┬───────┘   └──────┬───────┘
                           │                  │              │
                           └──────────────────┼──────────────┘
                                              │ HTTPS Requests
                                              ▼
                                 ┌───────────────────────────┐
                                 │   HETZNER VPS SERVER      │
                                 │   (api.duckdns.org)       │
                                 │                           │
                                 │  ┌─────────────────────┐  │
                                 │  │ Nginx + Let's Encry.│  │
                                 │  └──────────┬──────────┘  │
                                 │             │ Port 8080   │
                                 │  ┌──────────▼──────────┐  │
                                 │  │ Spring Boot Backend │  │
                                 │  └──────┬──────────┬───┘  │
                                 │         │          │      │
                                 │  ┌──────▼───┐  ┌───▼───┐  │
                                 │  │PostgreSQL│  │ Redis │  │
                                 │  └──────────┘  └───────┘  │
                                 └───────────────────────────┘
```

---

## 🚀 STEP 1: Setting Up Your Hetzner VPS Server

### 1.1 Connect to Your Hetzner VPS via SSH
Open **PowerShell** or **Terminal** on your computer and run:
```bash
ssh root@<YOUR_HETZNER_VPS_IP>
```
*(Replace `<YOUR_HETZNER_VPS_IP>` with your actual server IP, e.g., `123.45.67.89`. Type `yes` if prompted and enter your server password).*

### 1.2 Update Server & Install Docker, Git, Nginx & Certbot
Copy and paste this entire block of commands into your VPS terminal:
```bash
# Update server packages
apt update && apt upgrade -y

# Install Docker, Docker Compose, Git, Nginx, UFW Firewall, Certbot
apt install -y curl git ufw nginx certbot python3-certbot-nginx docker.io docker-compose-v2

# Start and enable Docker service
systemctl enable --now docker

# Enable Firewall and open ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

---

## 🌐 STEP 2: Setting Up Free SSL Domain (DuckDNS) & Nginx HTTPS Reverse Proxy

> ⚠️ **IMPORTANT**: Web browsers and mobile operating systems **BLOCK** unencrypted HTTP API calls when connected from HTTPS websites or production mobile apps. We will set up a **FREE HTTPS Domain** in 2 minutes using DuckDNS.

### 2.1 Get a Free Domain on DuckDNS
1. Open your browser and go to [duckdns.org](https://www.duckdns.org).
2. Log in using your GitHub account.
3. In the **subdomain** box, type a unique name (e.g. `safevoice-api`) and click **add domain**.
4. Make sure the IP address listed next to your domain matches your **Hetzner VPS IP**.
5. Your domain is now: **`safevoice-api.duckdns.org`**.

### 2.2 Configure Nginx on Hetzner VPS
1. Run this command on your VPS to create the Nginx configuration file:
   ```bash
   nano /etc/nginx/sites-available/safevoice-api
   ```
2. Paste the following configuration *(replace `safevoice-api.duckdns.org` with your actual domain name)*:
   ```nginx
   server {
       server_name safevoice-api.duckdns.org;

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
3. Save and exit nano: Press `CTRL + O`, press `ENTER`, then press `CTRL + X`.
4. Enable the Nginx site:
   ```bash
   ln -s /etc/nginx/sites-available/safevoice-api /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

### 2.3 Get Free SSL Certificate (HTTPS) using Certbot
Run this command on your VPS:
```bash
certbot --nginx -d safevoice-api.duckdns.org
```
*(Enter your email address when asked, accept terms by typing `Y`. Certbot will automatically issue and install your SSL certificate).*

Now your backend has a secure **`https://safevoice-api.duckdns.org`** endpoint!

---

## 📦 STEP 3: Clone Project Code & Launch Backend with Docker

### 3.1 Clone Project to VPS
Run these commands on your VPS:
```bash
mkdir -p /opt/safevoice
cd /opt/safevoice
git clone https://github.com/<YOUR_GITHUB_USERNAME>/Safevoice.git .
```

### 3.2 Copy Firebase Service Account Key
Ensure your Firebase service account JSON file exists on the server inside `/opt/safevoice/safevoice-backend/`:
```bash
# Verify the file is present
ls -la /opt/safevoice/safevoice-backend/safevoice-38eda-firebase-adminsdk-fbsvc-6b444b6abe.json
```
*(If missing, create the file with `nano /opt/safevoice/safevoice-backend/safevoice-38eda-firebase-adminsdk-fbsvc-6b444b6abe.json` and paste your Firebase JSON content).*

### 3.3 Create Production `.env` File
Create the production environment configuration file:
```bash
nano /opt/safevoice/.env
```
Paste the following production configuration:
```env
# ── PostgreSQL Database ──
POSTGRES_DB=safevoice_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=AdminProductionPassword123!
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/safevoice_db

# ── Redis Session Cache ──
SPRING_REDIS_HOST=redis
SPRING_REDIS_PORT=6379

# ── Security & JWT ──
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=900000
JWT_REFRESH_EXPIRATION_MS=604800000
CORS_ALLOWED_ORIGINS=*

# ── Brevo Email Service ──
BREVO_API_KEY=xkeysib-placeholder-replace-with-your-real-brevo-key
BREVO_SENDER_EMAIL=noreply@safevoice.com
BREVO_SENDER_NAME=SafeVoice Security

# ── Firebase Push Notifications ──
GOOGLE_APPLICATION_CREDENTIALS=/app/safevoice-38eda-firebase-adminsdk-fbsvc-6b444b6abe.json

# ── Cloudinary Media ──
CLOUDINARY_CLOUD_NAME=safevoice-app
CLOUDINARY_API_KEY=1234567890
CLOUDINARY_API_SECRET=secret_key
CLOUDINARY_UPLOAD_PRESET=safevoice_signed_preset
```
Save and exit: Press `CTRL + O`, press `ENTER`, then press `CTRL + X`.

### 3.4 Start Docker Backend Containers
Launch PostgreSQL, Redis, and Spring Boot backend:
```bash
docker compose --profile prod up -d --build
```
Check if all 3 containers are running:
```bash
docker compose ps
```
*(You should see `safevoice-postgres`, `safevoice-redis`, and `safevoice-backend` as `Up` or `running`).*

Check backend logs to verify Spring Boot started successfully:
```bash
docker compose logs -f backend
```
*(Look for `Started SafevoiceApplication in X seconds`. Press `CTRL + C` to exit log view).*

---

## 🔑 STEP 4: Connecting GitHub Actions & Automatic CI/CD Pipeline

Whenever you push code to GitHub (`git push origin main`), GitHub Actions will automatically test and deploy your code to Hetzner and Netlify.

### 4.1 Generate SSH Deployment Key
Run this command on your **VPS**:
```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_deploy -N ""
```
Append the **Public Key** to authorized keys:
```bash
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
```
Display the **Private Key** (you will copy this to GitHub):
```bash
cat ~/.ssh/github_deploy
```
*(Highlight and copy the ENTIRE output, starting from `-----BEGIN OPENSSH PRIVATE KEY-----` to `-----END OPENSSH PRIVATE KEY-----`).*

### 4.2 Add Secrets to Your GitHub Repository
1. Go to your GitHub repository: `https://github.com/<YOUR_USERNAME>/Safevoice`.
2. Click **Settings** (top tab) → **Secrets and variables** (left sidebar) → **Actions**.
3. Click the green button: **New repository secret**.
4. Add the following **6 Secrets** one by one:

#### Secret 1: `HETZNER_HOST`
- **Name**: `HETZNER_HOST`
- **Value**: Your Hetzner VPS IP Address (e.g. `123.45.67.89`).

#### Secret 2: `HETZNER_USER`
- **Name**: `HETZNER_USER`
- **Value**: `root`

#### Secret 3: `HETZNER_SSH_KEY`
- **Name**: `HETZNER_SSH_KEY`
- **Value**: Paste the entire private key output copied in Step 4.1.

#### Secret 4: `NETLIFY_AUTH_TOKEN`
1. Open [Netlify User Settings → Personal Access Tokens](https://app.netlify.com/user/applications#personal-access-tokens).
2. Click **New Access Token**, enter description `GitHub Actions`, and click **Generate Token**.
3. Copy token value and paste into GitHub Secret:
- **Name**: `NETLIFY_AUTH_TOKEN`
- **Value**: *(your Netlify token)*

#### Secret 5: `NETLIFY_ADMIN_SITE_ID`
*(You will get this ID after creating the Netlify Admin site in Step 5.1 below).*
- **Name**: `NETLIFY_ADMIN_SITE_ID`
- **Value**: *(Netlify Admin Site API ID)*

#### Secret 6: `NETLIFY_LANDING_SITE_ID`
*(You will get this ID after creating the Netlify Landing site in Step 5.2 below).*
- **Name**: `NETLIFY_LANDING_SITE_ID`
- **Value**: *(Netlify Landing Site API ID)*

---

## 🌐 STEP 5: Deploying Admin Panel & Landing Website to Netlify

### 5.1 Deploy Admin Panel (`safevoice-admin`)
1. Log in to [app.netlify.com](https://app.netlify.com).
2. Click **Add new site** → **Import an existing project**.
3. Click **GitHub** and authorize Netlify.
4. Select your **Safevoice** repository.
5. Fill in build settings:
   - **Base directory**: `safevoice-admin`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Click **Environment variables** → **Add a variable**:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://safevoice-api.duckdns.org/api/v1`
7. Click **Deploy Safevoice**.
8. After deployment finishes, go to **Site Configuration** → **Site details** → Copy the **API ID** (e.g., `a1b2c3d4-e5f6-...`).
9. Paste this API ID into your GitHub Repository Secret: `NETLIFY_ADMIN_SITE_ID`.

### 5.2 Deploy Landing Website (`safevoice-landing`)
1. In Netlify, click **Sites** → **Add new site** → **Import an existing project**.
2. Select your **Safevoice** repository.
3. Fill in build settings:
   - **Base directory**: `safevoice-landing`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
4. Click **Environment variables** → **Add a variable**:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://safevoice-api.duckdns.org/api/v1`
5. Click **Deploy Safevoice**.
6. Go to **Site Configuration** → **Site details** → Copy the **API ID**.
7. Paste this API ID into your GitHub Repository Secret: `NETLIFY_LANDING_SITE_ID`.

---

## 📱 STEP 6: Building Mobile App for Production (`safevoice-app`)

### 6.1 Install Expo EAS CLI
On your local machine terminal:
```bash
npm install -g eas-cli
```

### 6.2 Log in to Expo
```bash
eas login
```

### 6.3 Configure `eas.json` Base URL
Open `safevoice-app/eas.json` on your computer and verify the production environment section:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://safevoice-api.duckdns.org/api/v1",
        "EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME": "safevoice-app",
        "EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET": "safevoice_signed_preset"
      }
    }
  }
}
```

### 6.4 Trigger Production Android & iOS Builds
Run inside `safevoice-app/`:
```bash
# Android AAB build for Google Play Store
eas build --platform android --profile production

# iOS IPA build for Apple App Store
eas build --platform ios --profile production
```
*(Once completed, EAS will provide a direct download link for your compiled `.aab` and `.ipa` app files ready for store upload).*

---

## 🧪 STEP 7: Comprehensive Post-Deployment Verification Protocol

Run these 7 verification tests to ensure every part of your live production deployment works 100%.

### Test 1: Verify Backend HTTPS API & Swagger Docs
Open your web browser or terminal and access:
```bash
curl -i https://safevoice-api.duckdns.org/swagger-ui.html
```
- **Expected Result**: Returns `HTTP/1.1 200 OK` and loads OpenAPI documentation UI.

### Test 2: Verify Netlify Admin Panel Login
1. Open your Netlify Admin URL (e.g. `https://safevoice-admin.netlify.app/login`).
2. Log in using default SuperAdmin credentials:
   - **Email**: `admin@safevoice.com`
   - **Password**: `AdminPassword123!`
- **Expected Result**:
   - Successfully redirects to Admin Dashboard.
   - Live telemetry counters load without 401/403 errors.

### Test 3: Verify Password Reset & Email Flow (Brevo)
1. Send a request to trigger password reset OTP:
   ```bash
   curl -X POST https://safevoice-api.duckdns.org/api/v1/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email": "your_test_email@gmail.com"}'
   ```
2. Check your email inbox for the 6-digit OTP code sent by Brevo.
3. Submit reset password request:
   ```bash
   curl -X POST https://safevoice-api.duckdns.org/api/v1/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"email": "your_test_email@gmail.com", "otp": "<6_DIGIT_OTP>", "newPassword": "NewPassword123!"}'
   ```
- **Expected Result**: Returns `200 OK` with `"Password reset successfully"`.

### Test 4: Create a Discussion Topic & Community Poll
```bash
curl -X POST https://safevoice-api.duckdns.org/api/v1/topics \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "POLLS",
    "title": "Live Production Test Topic",
    "description": "Testing live production backend and poll voting.",
    "isAnonymous": false,
    "poll": {
      "question": "Is SafeVoice production live?",
      "options": ["Yes, operational!", "Needs work"]
    }
  }'
```
- **Expected Result**: Returns `201 Created` with topic and poll IDs.

### Test 5: Test Real-Time STOMP Poll Voting
Vote on the option created in Test 4:
```bash
curl -X POST https://safevoice-api.duckdns.org/api/v1/polls/<POLL_ID>/vote \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"optionIds": ["<OPTION_ID>"]}'
```
- **Expected Result**: Returns `200 OK`, updates vote count to `1`, broadcasts vote update over WebSocket `/topic/polls/<POLL_ID>`.

### Test 6: Test Mobile Push Notifications (FCM)
1. Register mobile FCM device token:
   ```bash
   curl -X PUT https://safevoice-api.duckdns.org/api/v1/users/me/fcm-token \
     -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"fcmToken": "<YOUR_MOBILE_FCM_TOKEN>"}'
   ```
2. Broadcast an announcement from Admin Panel (`https://safevoice-admin.netlify.app/announcements`).
- **Expected Result**: Mobile device receives live push notification banner.

### Test 7: Verify Automatic CI/CD Deployment Trigger
To test full automatic deployment, make a small change in your repository and push to GitHub:
```bash
git add .
git commit -m "Testing GitHub Actions deployment"
git push origin main
```
Go to GitHub Repository → **Actions** tab.
- **Expected Result**: GitHub Actions runs `ci.yml` and `deploy.yml`, builds your code, tests it, and automatically updates your Hetzner VPS and Netlify sites!

---

🎉 **Congratulations!** Your entire SafeVoice platform is now 100% deployed, secure, automated, and verified for production!
