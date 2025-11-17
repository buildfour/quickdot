# QuickDot Deployment Guide

**Complete Step-by-Step Instructions for Beginners**

This guide will walk you through deploying QuickDot Polkadot Wallet to Google Cloud Platform. No prior cloud deployment experience required!

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Google Cloud Setup](#google-cloud-setup)
4. [Automated Deployment](#automated-deployment)
5. [Manual Deployment (Alternative)](#manual-deployment-alternative)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Cost Management](#cost-management)
8. [Troubleshooting](#troubleshooting)
9. [Alternative Deployment Options](#alternative-deployment-options)

---

## Prerequisites

### What You Need

1. **Google Account** - Free Gmail account
2. **Credit/Debit Card** - Required for GCP (free tier available, ~$0-10/month)
3. **Computer** - Windows, Mac, or Linux
4. **Basic Command Line Knowledge** - We'll guide you through each command

### Estimated Time

- First-time setup: 30-45 minutes
- Subsequent deployments: 5-10 minutes

### Estimated Cost

**Monthly Cost: $0-$50**
- Most usage stays within free tier: **$0-10/month**
- Detailed breakdown in [Cost Management](#cost-management) section

---

## Firebase Setup

Firebase provides authentication and database services.

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `quickdot-wallet` (or your choice)
4. **Disable** Google Analytics (optional, not needed)
5. Click **"Create project"**

### Step 2: Enable Authentication

1. In Firebase Console, click **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Enable **"Google"** provider:
   - Click on Google
   - Toggle "Enable"
   - Enter project support email
   - Click "Save"
5. Enable **"Email/Password"** provider:
   - Click on Email/Password
   - Toggle "Enable" (first option only, not email link)
   - Click "Save"

### Step 3: Create Firestore Database

1. Click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location: **us-central** (or closest to your users)
5. Click **"Enable"**

### Step 4: Get Firebase Configuration

**For Backend (Service Account):**

1. Click ⚙️ (Settings) > **"Project settings"**
2. Click **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** - Downloads JSON file
5. **Save this file securely** - You'll need it later

**For Frontend (Web App):**

1. In Project settings, scroll to **"Your apps"**
2. Click web icon **(</>)** to add web app
3. Enter app nickname: `quickdot-web`
4. **Don't** check "Firebase Hosting"
5. Click **"Register app"**
6. **Copy** the firebaseConfig object - You'll need these values:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

---

## Google Cloud Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click project dropdown (top left, next to "Google Cloud")
3. Click **"New Project"**
4. Enter project name: `quickdot-wallet`
5. Click **"Create"**

### Step 2: Enable Billing

1. Go to [Billing](https://console.cloud.google.com/billing)
2. Click **"Link a billing account"**
3. Click **"Create billing account"**
4. Enter payment information
   - **Don't worry**: Free tier covers most usage
   - Set up billing alerts (we'll show you how)
5. Link billing account to your project

### Step 3: Enable Required APIs

1. Go to [APIs & Services](https://console.cloud.google.com/apis/dashboard)
2. Click **"+ ENABLE APIS AND SERVICES"**
3. Search and enable each of these:
   - **Cloud Run API**
   - **Cloud Build API**
   - **Container Registry API**
   - **Cloud Firestore API**

*Note: The automated deployment script will also enable these*

---

## Automated Deployment

**Recommended Method - Uses deploy.sh script**

The deploy.sh script is **fully resumeable** - if deployment gets interrupted, you can simply re-run it and it will continue from where it stopped!

### Option A: Using Google Cloud Shell (Easiest)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Activate Cloud Shell"** button (top right, >_ icon)
3. In Cloud Shell terminal, run:

```bash
# Clone or upload your QuickDot files
# If you have the code locally, you can upload it:
# Click "⋮" > "Upload" > "Choose Files" and upload quickdot-app folder

# Navigate to project directory
cd quickdot-app

# Make deployment script executable
chmod +x deploy.sh

# Run automated deployment
./deploy.sh
```

4. Follow the prompts:
   - Confirm project ID
   - Enter Firebase Service Account details (from JSON file)
   - Enter Firebase Web Config details
   - Wait for deployment (5-10 minutes)

5. **Done!** The script will output your application URL

### Resumeable Deployment Features

The deploy.sh script automatically saves progress after each step in a `.deploy_state` file.

**If Deployment Gets Interrupted:**
```bash
# Simply re-run the script - it will skip completed steps and resume!
./deploy.sh
```

**Check Current Progress:**
```bash
# See which steps have been completed
./deploy.sh --progress
```

**Force Re-run a Specific Step:**
```bash
# Re-run step 7 (Docker build) even if already completed
./deploy.sh --force-step 7

# Available steps:
# 1 - Prerequisites check
# 2 - Project configuration  
# 3 - Enable APIs
# 4 - Environment configuration
# 5 - Frontend configuration
# 6 - Install dependencies
# 7 - Docker build
# 8 - Cloud Run deployment
```

**Start Fresh (Reset All Progress):**
```bash
# Clear all checkpoints and start from beginning
./deploy.sh --clean
```

**Get Help:**
```bash
./deploy.sh --help
```

### Option B: Using Local Terminal

**Prerequisites:**
- Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- Install [Node.js](https://nodejs.org/) (v18 or higher)

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Navigate to project directory
cd quickdot-app

# Make script executable (Mac/Linux)
chmod +x deploy.sh

# Run deployment
./deploy.sh

# For Windows, use Git Bash or WSL
```

---

## Manual Deployment (Alternative)

If automated deployment fails, follow these manual steps.

### Step 1: Prepare Environment Variables

Create `.env` file in project root:

```env
PORT=8080
NODE_ENV=production

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

JWT_SECRET=your-generated-secret-key
JWT_EXPIRY=24h

POLKADOT_WS_ENDPOINT=wss://rpc.polkadot.io
POLKADOT_NETWORK=polkadot

ALLOWED_ORIGINS=*

GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_CLOUD_REGION=us-central1
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

### Step 2: Update Frontend Config

Edit `public/js/modules/config.js`:

Replace `YOUR_FIREBASE_API_KEY` etc. with your actual Firebase Web Config values.

### Step 3: Build and Deploy

```bash
# Install dependencies
npm install

# Build Docker image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/quickdot-wallet

# Deploy to Cloud Run
gcloud run deploy quickdot-wallet \
  --image gcr.io/YOUR_PROJECT_ID/quickdot-wallet \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --port 8080 \
  --set-env-vars NODE_ENV=production

# Get your service URL
gcloud run services describe quickdot-wallet \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

---

## Post-Deployment Configuration

### Step 1: Update Firebase Authorized Domains

1. Copy your Cloud Run URL (e.g., `https://quickdot-wallet-xxxxx.run.app`)
2. Go to [Firebase Console](https://console.firebase.google.com/)
3. Select your project
4. Click **Authentication** > **Settings** tab
5. Scroll to **"Authorized domains"**
6. Click **"Add domain"**
7. Paste your Cloud Run domain (without `https://`)
8. Click **"Add"**

### Step 2: Set Up Firestore Security Rules

1. Go to **Firestore Database** > **Rules** tab
2. Replace with these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Wallets collection
    match /wallets/{walletId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Transactions collection
    match /transactions/{txId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Contacts collection
    match /contacts/{contactId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click **"Publish"**

### Step 3: Test Your Deployment

1. Visit your Cloud Run URL
2. Sign in with Google or email
3. Create a test wallet
4. Verify all features work:
   - ✅ Wallet creation
   - ✅ Portfolio tracking
   - ✅ Send/Receive (use testnet first!)
   - ✅ Transaction history
   - ✅ Contacts

---

## Cost Management

### Expected Monthly Costs

**Free Tier Limits (Monthly):**
- Cloud Run: 2 million requests, 360,000 GB-seconds
- Firestore: 50,000 reads, 20,000 writes, 20,000 deletes, 1GB storage
- Cloud Build: 120 build-minutes per day
- Cloud Storage: 5GB

**Estimated Usage:**
- Small user base (<100 users): **$0-5/month** (within free tier)
- Medium user base (100-1000 users): **$5-25/month**
- Large user base (>1000 users): **$25-50/month**

### Set Up Billing Alerts

1. Go to [Billing](https://console.cloud.google.com/billing)
2. Click **"Budgets & alerts"**
3. Click **"Create budget"**
4. Set budget amount: **$10** (or your limit)
5. Set alert thresholds: 50%, 90%, 100%
6. Enter your email
7. Click **"Finish"**

### Cost Optimization Tips

1. **Use Cloud Run scaling:**
   - Min instances: 0 (scales to zero when not used)
   - Max instances: 10 (prevents runaway costs)

2. **Monitor usage:**
   - [Cloud Run Dashboard](https://console.cloud.google.com/run)
   - [Firestore Usage](https://console.firebase.google.com/project/_/firestore/usage)

3. **Optimize Firestore:**
   - Use pagination for large lists
   - Cache frequently accessed data
   - Delete old transaction records if needed

---

## Troubleshooting

### Common Issues

**Issue: "Deployment interrupted or timed out"**
```bash
# Solution: The deploy.sh script is resumeable!
# Simply re-run it - it will skip completed steps
./deploy.sh

# Check what steps were completed
./deploy.sh --progress

# If a specific step failed, you can force re-run it
./deploy.sh --force-step 7  # Re-run step 7 (Docker build)
```

**Issue: "Permission denied" during deployment**
```bash
# Solution: Enable Cloud Run API
gcloud services enable run.googleapis.com
```

**Issue: "Firebase authentication failed"**
```bash
# Solution: Check .env file has correct Firebase credentials
# Verify FIREBASE_PRIVATE_KEY is properly formatted with \n
```

**Issue: "Cannot connect to Polkadot network"**
```bash
# Solution: Check Polkadot endpoint is accessible
# Try alternative endpoint: wss://polkadot.api.onfinality.io/public-ws
```

**Issue: "Build failed"**
```bash
# Solution: Ensure all files are present
# Check Dockerfile is in project root
# Verify package.json has all dependencies
```

**Issue: "Application crashes on startup"**
```bash
# View logs
gcloud run services logs read quickdot-wallet --limit 50

# Common causes:
# - Missing environment variables
# - Firebase credentials incorrect
# - Node.js version mismatch
```

### Get Help

1. **Check Logs:**
   ```bash
   gcloud run services logs read quickdot-wallet --region us-central1
   ```

2. **Test Locally:**
   ```bash
   npm install
   npm run dev
   # Visit http://localhost:8080
   ```

3. **Verify Environment:**
   ```bash
   # Check current project
   gcloud config get-value project
   
   # List services
   gcloud run services list
   
   # Check service status
   gcloud run services describe quickdot-wallet --region us-central1
   ```

---

## Alternative Deployment Options

### Option 1: Heroku (Simple, Moderate Cost)

**Pros:** Very easy, free tier available
**Cons:** More expensive at scale (~$7/month minimum)
**Cost:** $7-25/month

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login and create app
heroku login
heroku create quickdot-wallet

# Add buildpack
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set FIREBASE_PROJECT_ID=your-project-id
# ... set all other variables

# Deploy
git push heroku main
```

### Option 2: AWS Elastic Beanstalk

**Pros:** Reliable, scalable
**Cons:** More complex setup
**Cost:** $10-30/month

See AWS documentation for detailed setup.

### Option 3: DigitalOcean App Platform

**Pros:** Simple, affordable
**Cons:** Less free tier
**Cost:** $5-12/month

1. Create account at [DigitalOcean](https://www.digitalocean.com/)
2. Click "Create" > "Apps"
3. Connect GitHub repository
4. Configure environment variables
5. Deploy

### Option 4: Vercel (Frontend) + Google Cloud (Backend)

**Pros:** Excellent performance, generous free tier
**Cons:** Split deployment
**Cost:** $0-10/month

**Frontend on Vercel:**
```bash
npm install -g vercel
vercel
```

**Backend on Google Cloud Run** (as described above)

---

## Next Steps

After successful deployment:

1. ✅ **Secure Your Wallet**
   - Enable 2FA on Firebase
   - Backup your service account key
   - Store recovery phrases securely

2. ✅ **Monitor Your Application**
   - Set up uptime monitoring
   - Check logs regularly
   - Review billing monthly

3. ✅ **Customize Your Instance**
   - Add custom domain
   - Configure SSL certificate
   - Update branding

4. ✅ **Stay Updated**
   - Monitor Polkadot.js updates
   - Update dependencies regularly
   - Follow security best practices

---

## Support & Resources

- **Google Cloud Documentation:** https://cloud.google.com/docs
- **Firebase Documentation:** https://firebase.google.com/docs
- **Polkadot.js Documentation:** https://polkadot.js.org/docs/
- **Cloud Run Pricing:** https://cloud.google.com/run/pricing

---

**Congratulations! Your QuickDot wallet is now deployed! 🎉**

Visit your application URL and start managing your Polkadot assets securely.
