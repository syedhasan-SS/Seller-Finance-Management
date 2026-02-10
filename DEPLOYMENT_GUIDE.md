# Deployment Guide: Seller Payout Intelligence System

This guide will walk you through deploying your application to Vercel with Supabase backend.

## 📋 Prerequisites

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] GitHub account
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Supabase account (sign up at https://supabase.com)

---

## Phase 1: Supabase Backend Setup (15-20 minutes)

### Step 1.1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Click "New Project"

2. **Fill in Project Details**
   - Organization: Select or create one
   - Name: `seller-payout-intelligence`
   - Database Password: **SAVE THIS PASSWORD** (you'll need it for backups)
   - Region: Choose closest to your users (e.g., US East, EU West)
   - Plan: Free tier is fine for testing

3. **Wait for Project Creation**
   - Takes 2-3 minutes
   - Don't close the browser

### Step 1.2: Apply Database Schema

1. **Open SQL Editor**
   - In Supabase Dashboard, click "SQL Editor" in left sidebar
   - Click "New Query"

2. **Copy and Run Setup Script**
   - Open the file: `/Users/syedfaezhasan/Downloads/project/supabase-setup.sql`
   - Copy ALL contents (entire file)
   - Paste into SQL Editor
   - Click "Run" button (or press Cmd/Ctrl + Enter)
   - **Wait for success message**: "Success. No rows returned"

3. **Verify Tables Created**
   - Click "Table Editor" in left sidebar
   - You should see 6 tables:
     - ✅ sellers
     - ✅ orders
     - ✅ payout_history
     - ✅ active_blockers
     - ✅ trust_scores
     - ✅ order_timeline_events

### Step 1.3: Enable Email Authentication

1. **Go to Authentication Settings**
   - Click "Authentication" in left sidebar
   - Click "Providers" tab

2. **Configure Email Provider**
   - Find "Email" in the list
   - Toggle "Enable Email provider" to ON
   - **Enable Email Confirmations**: Toggle OFF (for easier testing)
   - Click "Save"

3. **Configure Site URL (Important!)**
   - Click "URL Configuration" tab
   - Site URL: `http://localhost:3000` (we'll update this after Vercel deployment)
   - Redirect URLs: `http://localhost:3000/**` (we'll add Vercel URL later)
   - Click "Save"

### Step 1.4: Get Your Supabase Credentials

1. **Go to Project Settings**
   - Click "Settings" (gear icon) in left sidebar
   - Click "API" under Project Settings

2. **Copy These Values** (you'll need them in next phase):
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`

   ⚠️ **IMPORTANT**: Keep these safe! Don't share publicly.

---

## Phase 2: Local Environment Setup (5 minutes)

### Step 2.1: Configure Environment Variables

1. **Open Terminal** and navigate to project:
   ```bash
   cd /Users/syedfaezhasan/Downloads/project
   ```

2. **Create .env file** with your Supabase credentials:
   ```bash
   cat > .env << 'EOF'
   VITE_SUPABASE_URL=YOUR_PROJECT_URL_HERE
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
   EOF
   ```

3. **Edit .env file** and replace placeholders:
   - Open in text editor: `code .env` or `nano .env`
   - Replace `YOUR_PROJECT_URL_HERE` with your Project URL
   - Replace `YOUR_ANON_KEY_HERE` with your anon key
   - Save and close

### Step 2.2: Install Dependencies

```bash
npm install
```

### Step 2.3: Test Locally

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Open browser** to: http://localhost:3000

3. **Test the application**:
   - You should see the Login page
   - Try creating an account:
     - Email: `test@example.com`
     - Password: `Test123456!`
     - Click "Create Account"
   - After signup, you should be redirected to Dashboard
   - You should see test data (3 orders, payout history, trust score)

4. **If everything works**:
   - ✅ Stop the dev server (Ctrl+C)
   - ✅ Proceed to Phase 3

5. **If you see errors**:
   - Check .env file has correct credentials
   - Check Supabase project is active (green dot in dashboard)
   - Check browser console for error messages

---

## Phase 3: GitHub Setup (5 minutes)

### Step 3.1: Initialize Git Repository

```bash
cd /Users/syedfaezhasan/Downloads/project

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Seller Payout Intelligence System ready for deployment"
```

### Step 3.2: Create GitHub Repository

1. **Go to GitHub**: https://github.com/new

2. **Fill in repository details**:
   - Repository name: `seller-payout-intelligence`
   - Description: `Seller Payout Intelligence Dashboard with Supabase & Vercel`
   - Visibility: **Private** (recommended for business app)
   - **DO NOT** initialize with README, .gitignore, or license
   - Click "Create repository"

### Step 3.3: Push Code to GitHub

1. **Copy the commands** from GitHub (under "…or push an existing repository from the command line")

2. **Run these commands** in your terminal:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/seller-payout-intelligence.git
   git branch -M main
   git push -u origin main
   ```

3. **Verify on GitHub**:
   - Refresh GitHub repository page
   - You should see all your files

---

## Phase 4: Vercel Deployment (10 minutes)

### Step 4.1: Import Project to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/new

2. **Import Git Repository**:
   - Click "Import Git Repository"
   - Find your `seller-payout-intelligence` repository
   - Click "Import"

### Step 4.2: Configure Project Settings

1. **Project Settings**:
   - Framework Preset: **Vite** (should auto-detect)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (should auto-fill)
   - Output Directory: `dist` (should auto-fill)

2. **Environment Variables** - Click "Environment Variables" section:

   **Add Variable 1:**
   - Key: `VITE_SUPABASE_URL`
   - Value: Paste your Supabase Project URL
   - Apply to: ✅ Production ✅ Preview ✅ Development

   **Add Variable 2:**
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: Paste your Supabase anon key
   - Apply to: ✅ Production ✅ Preview ✅ Development

3. **Click "Deploy"**
   - Wait 2-3 minutes for build
   - Vercel will show build logs

### Step 4.3: Get Your Vercel URL

1. **After deployment completes**:
   - You'll see: "🎉 Congratulations!"
   - Your live URL will be shown: `https://seller-payout-intelligence-XXXXX.vercel.app`
   - Click "Visit" to open your live site

2. **Save this URL** - you'll need it for next step

---

## Phase 5: Final Configuration (5 minutes)

### Step 5.1: Update Supabase Redirect URLs

1. **Go back to Supabase Dashboard**: https://supabase.com/dashboard

2. **Navigate to Authentication > URL Configuration**

3. **Update Site URL**:
   - Change from `http://localhost:3000`
   - To: `https://seller-payout-intelligence-XXXXX.vercel.app` (your Vercel URL)

4. **Update Redirect URLs**:
   - Keep: `http://localhost:3000/**`
   - Add new: `https://seller-payout-intelligence-XXXXX.vercel.app/**`
   - Click "Save"

### Step 5.2: Test Production Deployment

1. **Open your Vercel URL** in browser

2. **Test full user flow**:
   - ✅ Create a new account with different email
   - ✅ Login with the account
   - ✅ See Dashboard with test data
   - ✅ Click on an order to see Order Detail
   - ✅ Navigate between sections
   - ✅ Logout and login again

3. **Test Magic Link** (optional):
   - Logout
   - On login page, toggle "Use magic link instead"
   - Enter email
   - Check email inbox for magic link
   - Click link to login

---

## ✅ Deployment Complete!

Your Seller Payout Intelligence System is now live! 🎉

### Your Live URLs:
- **Production**: `https://seller-payout-intelligence-XXXXX.vercel.app`
- **Supabase Dashboard**: `https://supabase.com/dashboard/project/[your-project-id]`

### What's Configured:
- ✅ 6 database tables with Row Level Security
- ✅ Email authentication enabled
- ✅ Sample test data loaded
- ✅ Automatic deployments from GitHub
- ✅ Environment variables secured in Vercel
- ✅ Production-optimized build (~128 KB gzipped)

---

## 📊 Post-Deployment Tasks

### Immediate (Recommended):

1. **Remove Test Data** (when ready for production):
   - Go to Supabase > SQL Editor
   - Run: `DELETE FROM sellers WHERE seller_id = 'test-seller-001';`
   - This will cascade delete all test orders, history, etc.

2. **Set Up Custom Domain** (optional):
   - Vercel Dashboard > Your Project > Settings > Domains
   - Add custom domain (e.g., `payout.yourcompany.com`)

3. **Monitor Usage**:
   - Vercel Analytics: Enable in Project Settings
   - Supabase Dashboard: Monitor database size, API calls

### Later (Optional):

1. **Email Templates**:
   - Supabase > Authentication > Email Templates
   - Customize welcome email, magic link email

2. **Add More Users**:
   - Use Supabase Dashboard > Authentication > Users
   - Or let users sign up through your app

3. **Real Data Integration**:
   - Replace test data with real seller/order data
   - Update `src/services/api.ts` if needed for your data structure

---

## 🔧 Troubleshooting

### Build fails on Vercel:
- Check build logs in Vercel dashboard
- Verify environment variables are set correctly
- Ensure all dependencies are in package.json

### Can't login after deployment:
- Check Supabase redirect URLs include your Vercel domain
- Check environment variables in Vercel match Supabase credentials
- Check browser console for errors

### Data not showing:
- Verify Supabase tables have data (check Table Editor)
- Check browser Network tab for failed API requests
- Verify RLS policies allow your user to read data

### Email not received:
- Check spam folder
- Verify email provider is enabled in Supabase
- Check Supabase > Authentication > Logs for delivery status

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **React Query Docs**: https://tanstack.com/query/latest
- **Project Structure**: See `/Users/syedfaezhasan/Downloads/project/README.md`

---

## 🚀 Continuous Deployment

Now that you're set up, any changes you push to GitHub will automatically deploy to Vercel:

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically builds and deploys! 🎉
```

**Preview Deployments**: Every pull request gets its own preview URL for testing before merging to main.
