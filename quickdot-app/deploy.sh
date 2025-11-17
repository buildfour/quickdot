#!/bin/bash

###############################################################################
# QuickDot Automated Deployment Script (Resumeable)
# Deploys QuickDot Polkadot Wallet to Google Cloud Platform
# 
# Usage: 
#   ./deploy.sh              - Run deployment (resumes from last checkpoint)
#   ./deploy.sh --clean      - Reset all checkpoints and start fresh
#   ./deploy.sh --force-step <N> - Force re-run a specific step
# 
# Prerequisites:
# - Google Cloud SDK installed and configured
# - Active GCP project with billing enabled
# - Firebase project created
###############################################################################

set -e  # Exit on error

# State file for tracking progress
STATE_FILE=".deploy_state"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_skip() {
    echo -e "${MAGENTA}⏭️  $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

###############################################################################
# State Management Functions
###############################################################################

# Mark a step as completed
mark_step_complete() {
    local step_name=$1
    echo "$step_name=$(date +%s)" >> "$STATE_FILE"
    print_success "Step '$step_name' completed and saved"
}

# Check if a step is completed
is_step_complete() {
    local step_name=$1
    if [ -f "$STATE_FILE" ]; then
        grep -q "^$step_name=" "$STATE_FILE"
        return $?
    fi
    return 1
}

# Get step completion time
get_step_time() {
    local step_name=$1
    if [ -f "$STATE_FILE" ]; then
        grep "^$step_name=" "$STATE_FILE" | cut -d'=' -f2
    fi
}

# Clean all state
clean_state() {
    if [ -f "$STATE_FILE" ]; then
        rm "$STATE_FILE"
        print_success "All deployment state cleared. Starting fresh."
    else
        print_info "No state file found. Nothing to clean."
    fi
}

# Show deployment progress
show_progress() {
    if [ -f "$STATE_FILE" ]; then
        echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}  Deployment Progress${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
        
        while IFS='=' read -r step timestamp; do
            local date_str=$(date -d "@$timestamp" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || date -r "$timestamp" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "completed")
            echo -e "${GREEN}✓${NC} $step (completed: $date_str)"
        done < "$STATE_FILE"
        echo ""
    fi
}

###############################################################################
# Parse command line arguments
###############################################################################

FORCE_STEP=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            clean_state
            exit 0
            ;;
        --force-step)
            FORCE_STEP="$2"
            shift 2
            ;;
        --progress)
            show_progress
            exit 0
            ;;
        --help)
            echo "Usage: ./deploy.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  (no args)           Run deployment (resumes from last checkpoint)"
            echo "  --clean             Reset all checkpoints and start fresh"
            echo "  --force-step <N>    Force re-run a specific step number"
            echo "  --progress          Show current deployment progress"
            echo "  --help              Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Show existing progress if resuming
if [ -f "$STATE_FILE" ] && [ -z "$FORCE_STEP" ]; then
    print_warning "Found existing deployment state. Resuming from last checkpoint..."
    show_progress
fi

###############################################################################
# Step 1: Check Prerequisites
###############################################################################

STEP_NAME="prerequisites"
if is_step_complete "$STEP_NAME" && [ "$FORCE_STEP" != "1" ]; then
    print_skip "Step 1: Prerequisites already checked (skipping)"
else
    print_header "Step 1: Checking Prerequisites"
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud SDK not found. Please install it first:"
        print_info "Visit: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    print_success "Google Cloud SDK found"
    
    # Check if user is authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "."; then
        print_warning "Not authenticated with Google Cloud"
        print_info "Running authentication..."
        gcloud auth login
    fi
    print_success "Authenticated with Google Cloud"
    
    mark_step_complete "$STEP_NAME"
fi

###############################################################################
# Step 2: Project Configuration
###############################################################################

STEP_NAME="project_config"
if is_step_complete "$STEP_NAME" && [ "$FORCE_STEP" != "2" ]; then
    print_skip "Step 2: Project already configured (skipping)"
    # Load saved project ID
    PROJECT_ID=$(grep "^PROJECT_ID=" "$STATE_FILE" | cut -d'=' -f2)
    REGION=$(grep "^REGION=" "$STATE_FILE" | cut -d'=' -f2)
    print_info "Using saved project: $PROJECT_ID (region: $REGION)"
else
    print_header "Step 2: Project Configuration"
    
    # Get or set project ID
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
    
    if [ -z "$CURRENT_PROJECT" ]; then
        print_info "No active project found"
        read -p "Enter your Google Cloud Project ID: " PROJECT_ID
        gcloud config set project $PROJECT_ID
    else
        print_info "Current project: $CURRENT_PROJECT"
        read -p "Use this project? (y/n): " USE_CURRENT
        if [ "$USE_CURRENT" != "y" ]; then
            read -p "Enter your Google Cloud Project ID: " PROJECT_ID
            gcloud config set project $PROJECT_ID
        else
            PROJECT_ID=$CURRENT_PROJECT
        fi
    fi
    
    print_success "Project set to: $PROJECT_ID"
    
    # Set region
    REGION="us-central1"
    print_info "Using region: $REGION"
    
    # Save to state file
    echo "PROJECT_ID=$PROJECT_ID" >> "$STATE_FILE"
    echo "REGION=$REGION" >> "$STATE_FILE"
    
    mark_step_complete "$STEP_NAME"
fi

###############################################################################
# Step 3: Enable Required APIs
###############################################################################

STEP_NAME="enable_apis"
if is_step_complete "$STEP_NAME" && [ "$FORCE_STEP" != "3" ]; then
    print_skip "Step 3: APIs already enabled (skipping)"
else
    print_header "Step 3: Enabling Required APIs"
    
    print_info "Enabling Cloud Run API..."
    gcloud services enable run.googleapis.com --project=$PROJECT_ID 2>/dev/null || print_warning "API already enabled or error (continuing)"
    
    print_info "Enabling Cloud Build API..."
    gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID 2>/dev/null || print_warning "API already enabled or error (continuing)"
    
    print_info "Enabling Container Registry API..."
    gcloud services enable containerregistry.googleapis.com --project=$PROJECT_ID 2>/dev/null || print_warning "API already enabled or error (continuing)"
    
    print_info "Enabling Firestore API..."
    gcloud services enable firestore.googleapis.com --project=$PROJECT_ID 2>/dev/null || print_warning "API already enabled or error (continuing)"
    
    print_info "Enabling Firebase API..."
    gcloud services enable firebase.googleapis.com --project=$PROJECT_ID 2>/dev/null || print_warning "API already enabled or error (continuing)"
    
    print_success "All required APIs enabled"
    
    mark_step_complete "$STEP_NAME"
fi

###############################################################################
# Step 4: Environment Configuration
###############################################################################

STEP_NAME="env_config"
if is_step_complete "$STEP_NAME" && [ "$FORCE_STEP" != "4" ]; then
    print_skip "Step 4: Environment already configured (skipping)"
    # Extract FIREBASE_PROJECT_ID for later use
    if [ -f ".env" ]; then
        FIREBASE_PROJECT_ID=$(grep "^FIREBASE_PROJECT_ID=" .env | cut -d'=' -f2)
    fi
else
    print_header "Step 4: Environment Configuration"
    
    # Check if .env exists
    if [ -f ".env" ]; then
        print_warning ".env file already exists"
        read -p "Overwrite? (y/n): " OVERWRITE_ENV
        if [ "$OVERWRITE_ENV" != "y" ]; then
            print_info "Using existing .env file"
            FIREBASE_PROJECT_ID=$(grep "^FIREBASE_PROJECT_ID=" .env | cut -d'=' -f2)
            mark_step_complete "$STEP_NAME"
        else
            rm .env
        fi
    fi
    
    if [ ! -f ".env" ] || [ "$OVERWRITE_ENV" = "y" ]; then
        print_info "Creating .env file..."
        
        # Get Firebase configuration
        print_warning "\nFirebase Configuration Required:"
        print_info "Please provide your Firebase project details"
        print_info "(You can find these in Firebase Console > Project Settings)"
        echo ""
        
        read -p "Firebase Project ID: " FIREBASE_PROJECT_ID
        read -p "Firebase Client Email: " FIREBASE_CLIENT_EMAIL
        print_warning "Firebase Private Key (paste entire key including -----BEGIN/END-----):"
        read -r FIREBASE_PRIVATE_KEY
        
        # Generate JWT secret
        JWT_SECRET=$(openssl rand -base64 32)
        
        # Create .env file
        cat > .env << EOF
# Server Configuration
PORT=8080
NODE_ENV=production

# Firebase Configuration
FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY="$FIREBASE_PRIVATE_KEY"
FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL
FIREBASE_DATABASE_URL=https://$FIREBASE_PROJECT_ID.firebaseio.com

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRY=24h

# Polkadot Configuration
POLKADOT_WS_ENDPOINT=wss://rpc.polkadot.io
POLKADOT_NETWORK=polkadot

# CORS Configuration
ALLOWED_ORIGINS=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID
GOOGLE_CLOUD_REGION=$REGION
EOF
        
        print_success ".env file created"
        mark_step_complete "$STEP_NAME"
    fi
fi

###############################################################################
# Step 5: Update Firebase Config in Frontend
###############################################################################

STEP_NAME="frontend_config"
if is_step_complete "$STEP_NAME" && [ "$FORCE_STEP" != "5" ]; then
    print_skip "Step 5: Frontend already configured (skipping)"
else
    print_header "Step 5: Updating Frontend Configuration"
    
    # Check if already configured
    if grep -q "YOUR_FIREBASE_API_KEY" public/js/modules/config.js 2>/dev/null; then
        print_warning "Firebase Web Configuration Required:"
        print_info "Please provide your Firebase web app configuration"
        print_info "(Firebase Console > Project Settings > Your Apps > Web App Config)"
        echo ""
        
        read -p "Firebase API Key: " FIREBASE_API_KEY
        read -p "Firebase Auth Domain (e.g., project-id.firebaseapp.com): " FIREBASE_AUTH_DOMAIN
        read -p "Firebase Messaging Sender ID: " FIREBASE_MESSAGING_SENDER_ID
        read -p "Firebase App ID: " FIREBASE_APP_ID
        
        # Update config.js
        sed -i "s/YOUR_FIREBASE_API_KEY/$FIREBASE_API_KEY/g" public/js/modules/config.js
        sed -i "s/YOUR_PROJECT_ID/$FIREBASE_PROJECT_ID/g" public/js/modules/config.js
        sed -i "s/YOUR_MESSAGING_SENDER_ID/$FIREBASE_MESSAGING_SENDER_ID/g" public/js/modules/config.js
        sed -i "s/YOUR_APP_ID/$FIREBASE_APP_ID/g" public/js/modules/config.js
        
        print_success "Frontend configuration updated"
    else
        print_info "Frontend configuration already completed"
    fi
    
    mark_step_complete "$STEP_NAME"
fi

###############################################################################
# Step 6: Install Dependencies
###############################################################################

STEP_NAME="install_deps"
if is_step_complete "$STEP_NAME" && [ "$FORCE_STEP" != "6" ]; then
    print_skip "Step 6: Dependencies already installed (skipping)"
else
    print_header "Step 6: Installing Dependencies"
    
    if [ ! -d "node_modules" ]; then
        print_info "Installing Node.js dependencies..."
        npm install
        print_success "Dependencies installed"
    else
        print_info "Dependencies already installed"
    fi
    
    mark_step_complete "$STEP_NAME"
fi

###############################################################################
# Step 7: Build Docker Image
###############################################################################

STEP_NAME="docker_build"
if is_step_complete "$STEP_NAME" && [ "$FORCE_STEP" != "7" ]; then
    print_skip "Step 7: Docker image already built (skipping)"
else
    print_header "Step 7: Building Docker Image"
    
    print_info "Building Docker image with Cloud Build..."
    print_warning "This may take 2-5 minutes..."
    
    gcloud builds submit --tag gcr.io/$PROJECT_ID/quickdot-wallet --project=$PROJECT_ID
    
    print_success "Docker image built successfully"
    mark_step_complete "$STEP_NAME"
fi

###############################################################################
# Step 8: Deploy to Cloud Run
###############################################################################

STEP_NAME="cloud_run_deploy"
if is_step_complete "$STEP_NAME" && [ "$FORCE_STEP" != "8" ]; then
    print_skip "Step 8: Already deployed to Cloud Run (skipping)"
    print_info "Getting current deployment URL..."
else
    print_header "Step 8: Deploying to Cloud Run"
    
    print_info "Deploying to Cloud Run..."
    gcloud run deploy quickdot-wallet \
        --image gcr.io/$PROJECT_ID/quickdot-wallet \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --memory 512Mi \
        --cpu 1 \
        --max-instances 10 \
        --min-instances 0 \
        --port 8080 \
        --set-env-vars NODE_ENV=production \
        --project=$PROJECT_ID
    
    print_success "Application deployed to Cloud Run"
    mark_step_complete "$STEP_NAME"
fi

###############################################################################
# Step 9: Get Deployment URL
###############################################################################

print_header "🎉 Deployment Complete!"

SERVICE_URL=$(gcloud run services describe quickdot-wallet --platform managed --region $REGION --format 'value(status.url)' --project=$PROJECT_ID)

echo ""
print_success "QuickDot deployed successfully!"
echo ""
print_info "Application URL:"
echo -e "${GREEN}$SERVICE_URL${NC}"
echo ""
print_info "Next Steps:"
echo "1. Visit the URL above to access your QuickDot wallet"
echo "2. Sign in with your Google account or email"
echo "3. Create your first Polkadot wallet"
echo ""
print_warning "Important: Update Firebase Auth Authorized Domains"
print_info "Go to Firebase Console > Authentication > Settings > Authorized Domains"
print_info "Add this domain: $(echo $SERVICE_URL | sed 's|https://||')"
echo ""
print_info "Monitor your application:"
echo "  - Logs: gcloud run services logs read quickdot-wallet --region=$REGION --project=$PROJECT_ID"
echo "  - Dashboard: https://console.cloud.google.com/run/detail/$REGION/quickdot-wallet?project=$PROJECT_ID"
echo ""
print_info "Deployment state saved to: $STATE_FILE"
print_info "To reset and start fresh: ./deploy.sh --clean"
print_info "To force re-run a step: ./deploy.sh --force-step <1-8>"
echo ""
print_success "Deployment complete!"
