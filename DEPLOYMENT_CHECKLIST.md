# ✅ Deployment Checklist

Use this checklist to deploy your Seller Finance Management step-by-step.

---

## Pre-Deployment Setup

### ✅ What's Already Done (You Can Skip These)

- [x] Code migration from Bolt to Vercel complete
- [x] All dependencies installed
- [x] TypeScript configured (strict mode, no errors)
- [x] Production build verified (128 KB gzipped)
- [x] Git repository initialized
- [x] All files committed
- [x] Vercel configuration created
- [x] Database schema SQL prepared
- [x] Documentation written

---

## Your Deployment Tasks (When You Return)

### Phase 1: Supabase Backend Setup

#### ☐ Task 1.1: Create Supabase Project (5 min)
- [ ] Go to https://supabase.com/dashboard
- [ ] Sign in or create free account
- [ ] Click "New Project"
- [ ] Enter name: `seller-finance-management`
- [ ] Create database password and **save it**
- [ ] Choose region (e.g., us-east-1)
- [ ] Click "Create new project"
- [ ] Wait 2-3 minutes for setup

**✓ Success criteria**: Project dashboard loads with green status indicator

---

#### ☐ Task 1.2: Apply Database Schema (2 min)
- [ ] In Supabase → Click "SQL Editor" (left sidebar)
- [ ] Click "New Query"
- [ ] Open file: `/Users/syedfaezhasan/Downloads/project/supabase-setup.sql`
- [ ] Copy entire file contents
- [ ] Paste into SQL Editor
- [ ] Click "Run" or press Cmd+Enter
- [ ] Verify success message: "Success. No rows returned"

**✓ Success criteria**:
- [ ] Click "Table Editor" → see 6 tables: sellers, orders, payout_history, active_blockers, trust_scores, order_timeline_events
- [ ] Click on "sellers" table → see 1 test row

---

#### ☐ Task 1.3: Enable Authentication (1 min)
- [ ] In Supabase → Click "Authentication" (left sidebar)
- [ ] Click "Providers" tab
- [ ] Find "Email" provider
- [ ] Toggle to **ON**
- [ ] Disable "Confirm email" (toggle OFF for testing)
- [ ] Click "Save"

**✓ Success criteria**: Email provider shows green "Enabled" status

---

#### ☐ Task 1.4: Copy Supabase Credentials (1 min)
- [ ] In Supabase → Click "Settings" (gear icon, left sidebar)
- [ ] Click "API" under Project Settings
- [ ] Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
- [ ] Copy **anon public key** (long string starting with `eyJ...`)
- [ ] **Paste both somewhere safe** (you'll need them next)

**✓ Success criteria**: You have both values copied

---

### Phase 2: Local Environment Configuration

#### ☐ Task 2.1: Create .env File (2 min)

Open Terminal and run:

```bash
cd /Users/syedfaezhasan/Downloads/project
```

Then create .env:

```bash
cat > .env << 'EOF'
VITE_SUPABASE_URL=PASTE_YOUR_URL_HERE
VITE_SUPABASE_ANON_KEY=PASTE_YOUR_KEY_HERE
EOF
```

- [ ] Paste the commands above in Terminal
- [ ] Run them to create .env file

Now edit the file:

```bash
nano .env
```

- [ ] Replace `PASTE_YOUR_URL_HERE` with your Supabase Project URL
- [ ] Replace `PASTE_YOUR_KEY_HERE` with your Supabase anon key
- [ ] Press Ctrl+X, then Y, then Enter to save

**✓ Success criteria**:
```bash
cat .env
```
Should show your actual credentials (not the placeholders)

---

#### ☐ Task 2.2: Install Dependencies (1 min)

```bash
npm install
```

- [ ] Wait for completion (should be quick, most are cached)

**✓ Success criteria**: No errors, "up to date" message appears

---

#### ☐ Task 2.3: Test Locally (3 min)

Start dev server:

```bash
npm run dev
```

- [ ] Wait for "Local: http://localhost:3000"
- [ ] Open browser to http://localhost:3000

**Test the application**:

- [ ] See Login page
- [ ] Click "Create Account"
- [ ] Enter email: `test@example.com`
- [ ] Enter password: `Test123456!`
- [ ] Click "Create Account"
- [ ] Should redirect to Dashboard
- [ ] See "Upcoming Payout" section with $215.49
- [ ] See Orders table with 3 orders
- [ ] See Trust Score: 85/100
- [ ] Click on first order (ORD-2024-001)
- [ ] See Order Detail modal
- [ ] Close modal
- [ ] Click "Logout" button (top right)
- [ ] Back to Login page

**If all tests pass**:
- [ ] Stop server: Press Ctrl+C in Terminal

**✓ Success criteria**: All features work, no errors in browser console

**If errors**: Check .env file, check Supabase is active, check browser console

---

### Phase 3: GitHub Repository

#### ☐ Task 3.1: Create GitHub Repository (2 min)
- [ ] Go to https://github.com/new
- [ ] Repository name: `seller-finance-management`
- [ ] Description: `Seller Payout Intelligence Dashboard`
- [ ] Visibility: **Private** (recommended)
- [ ] **DO NOT** check "Initialize with README"
- [ ] Click "Create repository"

**✓ Success criteria**: GitHub shows your new empty repository

---

#### ☐ Task 3.2: Push Code to GitHub (1 min)

GitHub will show commands. Copy them and run in Terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/seller-finance-management.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

- [ ] Run the commands
- [ ] Enter GitHub credentials if prompted

**✓ Success criteria**:
- Terminal shows "Branch 'main' set up to track remote branch 'main'"
- Refresh GitHub page → see all your files

---

### Phase 4: Vercel Deployment

#### ☐ Task 4.1: Import to Vercel (1 min)
- [ ] Go to https://vercel.com/new
- [ ] Sign in with GitHub
- [ ] Authorize Vercel if prompted
- [ ] Click "Import Git Repository"
- [ ] Find `seller-finance-management` in list
- [ ] Click "Import"

**✓ Success criteria**: Vercel shows "Configure Project" page

---

#### ☐ Task 4.2: Configure Build Settings (1 min)

**Verify auto-detected settings**:
- [ ] Framework Preset: **Vite** ✅
- [ ] Build Command: `npm run build` ✅
- [ ] Output Directory: `dist` ✅

If wrong, correct them. Otherwise, leave as is.

**✓ Success criteria**: All three settings correct

---

#### ☐ Task 4.3: Add Environment Variables (2 min)

**CRITICAL STEP** - Don't skip!

Scroll to "Environment Variables" section.

**Add Variable #1**:
- [ ] Click "Add New"
- [ ] Key: `VITE_SUPABASE_URL`
- [ ] Value: Paste your Supabase Project URL
- [ ] Check all three: ✅ Production ✅ Preview ✅ Development
- [ ] Click "Add"

**Add Variable #2**:
- [ ] Click "Add New"
- [ ] Key: `VITE_SUPABASE_ANON_KEY`
- [ ] Value: Paste your Supabase anon key
- [ ] Check all three: ✅ Production ✅ Preview ✅ Development
- [ ] Click "Add"

**Verify**:
- [ ] See both variables listed
- [ ] Both show "Production, Preview, Development"

**✓ Success criteria**: Both environment variables added with all three scopes

---

#### ☐ Task 4.4: Deploy (3 min)
- [ ] Click "Deploy" button
- [ ] Wait for build (watch the logs)
- [ ] Wait for "Congratulations! 🎉" message

**✓ Success criteria**: Deployment shows "Ready" status

---

#### ☐ Task 4.5: Get Your Live URL (1 min)
- [ ] Copy your Vercel URL (looks like: `https://seller-finance-management-xxxxx.vercel.app`)
- [ ] Click "Visit" to open site
- [ ] **Save this URL** (you need it for next phase)

**✓ Success criteria**: Site opens (you'll test it after next step)

---

### Phase 5: Final Configuration

#### ☐ Task 5.1: Update Supabase Redirect URLs (2 min)

**IMPORTANT**: Without this, login won't work on production!

- [ ] Go back to Supabase Dashboard
- [ ] Click "Authentication" (left sidebar)
- [ ] Click "URL Configuration" tab

**Update Site URL**:
- [ ] Change "Site URL" from `http://localhost:3000`
- [ ] To your Vercel URL: `https://seller-finance-management-xxxxx.vercel.app`

**Update Redirect URLs**:
- [ ] Keep existing: `http://localhost:3000/**`
- [ ] Add new: `https://seller-finance-management-xxxxx.vercel.app/**`
- [ ] (Replace with your actual Vercel URL)

- [ ] Click "Save"

**✓ Success criteria**: Both URLs show in Redirect URLs list

---

#### ☐ Task 5.2: Test Production Deployment (3 min)

**Open your Vercel URL** in a new incognito/private browser window.

**Test complete user flow**:
- [ ] See Login page
- [ ] Click "Create Account"
- [ ] Use different email: `prod-test@example.com`
- [ ] Password: `ProdTest123!`
- [ ] Click "Create Account"
- [ ] Redirects to Dashboard
- [ ] See Upcoming Payout section
- [ ] See Orders table (should be empty - new account)
- [ ] See Trust Score widget
- [ ] Test navigation (all sections load)
- [ ] Click "Logout"
- [ ] Login again with same credentials
- [ ] Works successfully

**Test Magic Link** (optional):
- [ ] Logout
- [ ] Toggle "Use magic link instead"
- [ ] Enter email
- [ ] Check email inbox
- [ ] Click magic link
- [ ] Logs in successfully

**✓ Success criteria**:
- All features work
- No errors in browser console (F12)
- Login/logout works
- Data persists across sessions

---

## 🎉 Deployment Complete!

### Post-Deployment Checklist

#### ☐ Verify Everything
- [ ] Production site accessible
- [ ] Authentication working
- [ ] Dashboard loads
- [ ] No console errors
- [ ] Mobile responsive (test on phone)

#### ☐ Save Important URLs
- [ ] Supabase Dashboard: https://supabase.com/dashboard
- [ ] GitHub Repo: https://github.com/YOUR_USERNAME/seller-finance-management
- [ ] Vercel Dashboard: https://vercel.com/dashboard
- [ ] Live Site: https://seller-finance-management-xxxxx.vercel.app

#### ☐ Document Credentials (Secure Location)
- [ ] Supabase URL
- [ ] Supabase anon key
- [ ] Supabase database password
- [ ] GitHub repository URL
- [ ] Vercel project URL

---

## Next Steps (Optional)

### Immediate
- [ ] Share live URL with team
- [ ] Test with real user accounts
- [ ] Remove test data (see DEPLOYMENT_GUIDE.md)

### Soon
- [ ] Add custom domain (Vercel → Settings → Domains)
- [ ] Enable Vercel Analytics
- [ ] Customize email templates (Supabase → Authentication → Email Templates)

### Later
- [ ] Set up error monitoring (Sentry)
- [ ] Configure backup automation
- [ ] Add more features

---

## Troubleshooting

### Build Failed on Vercel
- [ ] Check build logs in Vercel dashboard
- [ ] Verify environment variables are set
- [ ] Check both variables applied to "Production"
- [ ] Try redeploying: Vercel → Deployments → ... → Redeploy

### Can't Login on Production
- [ ] Verify Supabase redirect URLs include Vercel domain
- [ ] Check environment variables in Vercel
- [ ] Check browser console for errors
- [ ] Verify authentication is enabled in Supabase

### "Invalid JWT" or Auth Errors
- [ ] Check VITE_SUPABASE_ANON_KEY is correct (copy again from Supabase)
- [ ] Verify no extra spaces in environment variables
- [ ] Redeploy after fixing environment variables

### Data Not Showing
- [ ] Check Supabase Table Editor → verify tables exist
- [ ] Check RLS policies are enabled
- [ ] Check browser Network tab for failed requests
- [ ] Verify user is authenticated (check DevTools → Application → Local Storage)

---

## 🆘 Need Help?

See detailed documentation:
- **QUICK_START.md** - 20-minute quick guide
- **DEPLOYMENT_GUIDE.md** - Comprehensive step-by-step
- **README.md** - Project documentation

External resources:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- React Query Docs: https://tanstack.com/query/latest

---

**Total Estimated Time**: ~25 minutes
**Difficulty Level**: Beginner-friendly ✨

You've got this! 🚀
