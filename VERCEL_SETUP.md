# Vercel Deployment Setup Guide

## Quick Setup (5 minutes)

### Step 1: Access Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Find your project: `Seller-Finance-Management`
3. Click on the project

### Step 2: Configure Environment Variables
1. Click **Settings** tab
2. Click **Environment Variables** in sidebar
3. Add the following variables:

#### Required Variables

**Variable 1: Enable BigQuery**
```
Name: VITE_USE_BIGQUERY
Value: true
Environment: Production, Preview, Development (check all)
```

**Variable 2: BigQuery Project ID**
```
Name: VITE_BIGQUERY_PROJECT_ID
Value: dogwood-baton-345622
Environment: Production, Preview, Development (check all)
```

**Variable 3: Default Vendor (Optional)**
```
Name: VITE_DEFAULT_VENDOR
Value: vibe-vintage
Environment: Production, Preview, Development (check all)
```

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click on latest deployment
3. Click ⋮ (three dots menu)
4. Click **Redeploy**
5. Wait for deployment to complete (~1 minute)

### Step 4: Verify Deployment
1. Open deployment URL (e.g., https://your-app.vercel.app)
2. Add query parameter: `?vendor=vibe-vintage`
3. Full URL: `https://your-app.vercel.app/dashboard?vendor=vibe-vintage`
4. Check that data loads (should see 37 orders, £1,271.52)

---

## Expected Results

### Dashboard Page
- **Upcoming Payout**: £1,271.52
- **Orders**: 37 orders listed
- **Payout History**: Last 5 payouts displayed
- **Data Source Banner**: "BigQuery (Live)"

### Orders Page
- 37 orders with product names
- All financial columns visible:
  - Base Price
  - Commission (15%)
  - Total Payout
- Shipping badges on applicable orders

---

## Troubleshooting

### Issue: Portal shows "Loading payout data..." forever

**Solution**: Environment variables not set
1. Check environment variables in Vercel dashboard
2. Ensure `VITE_USE_BIGQUERY=true` is set
3. Redeploy after adding variables

### Issue: "Vendor not found" error

**Solution**: Vendor handle is invalid
1. Check URL has correct format: `?vendor=vibe-vintage`
2. Try different vendor handle
3. Check vendor exists in BigQuery vendors table

### Issue: Build fails

**Solution**: Check build logs
1. Go to Deployments tab
2. Click on failed deployment
3. Check build logs for errors
4. Most common: Missing dependencies (already fixed)

### Issue: Data shows as "Sample Data" instead of "BigQuery (Live)"

**Solution**: Environment variable not applied
1. Check `VITE_USE_BIGQUERY` is set to `true` (not `"true"`)
2. Ensure all three checkboxes (Production, Preview, Development) are checked
3. Redeploy to apply changes

---

## Testing Checklist

After deployment, test these URLs:

✅ **Dashboard**: `https://your-app.vercel.app/dashboard?vendor=vibe-vintage`
- Should load 37 orders
- Should show £1,271.52 upcoming payout
- Should show "BigQuery (Live)" in data source banner

✅ **Orders Page**: `https://your-app.vercel.app/orders?vendor=vibe-vintage`
- Should load orders table
- Should show financial breakdown columns
- Search should work

✅ **Income Statement**: `https://your-app.vercel.app/income-statement?vendor=vibe-vintage`
- Currently shows sample data (future work)

---

## Security Notes

⚠️ **Important**: Do not commit `.env` file to git
- `.env` is in `.gitignore`
- Environment variables are set in Vercel dashboard only
- Never share BigQuery project credentials publicly

✅ **Safe to commit**:
- `vercel.json` (build configuration)
- All source code files
- `IMPLEMENTATION_SUMMARY.md` and this guide

---

## Environment Variable Reference

| Variable | Purpose | Required | Default |
|----------|---------|----------|---------|
| `VITE_USE_BIGQUERY` | Enables real BigQuery data | Yes | `false` |
| `VITE_BIGQUERY_PROJECT_ID` | BigQuery project identifier | Yes | None |
| `VITE_DEFAULT_VENDOR` | Fallback vendor when none specified | No | None |

**Note**: All environment variables must start with `VITE_` to be accessible in the browser build.

---

## Deployment URLs

### Production
- Main URL: `https://your-app.vercel.app`
- With vendor: `https://your-app.vercel.app/dashboard?vendor=vibe-vintage`

### Preview (per branch)
- Format: `https://your-app-{branch}-{team}.vercel.app`
- Useful for testing before merging to main

### Local Development
- URL: `http://localhost:5173`
- With vendor: `http://localhost:5173/dashboard?vendor=vibe-vintage`
- Requires `.env` file in project root

---

## Quick Commands

### Local Development
```bash
# Install dependencies
npm install

# Create .env file
echo "VITE_USE_BIGQUERY=true" > .env
echo "VITE_BIGQUERY_PROJECT_ID=dogwood-baton-345622" >> .env
echo "VITE_DEFAULT_VENDOR=vibe-vintage" >> .env

# Start dev server
npm run dev

# Open browser
open http://localhost:5173/dashboard?vendor=vibe-vintage
```

### Build & Test Locally
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Open browser
open http://localhost:4173/dashboard?vendor=vibe-vintage
```

---

## Support

### Vercel Dashboard
- Login: https://vercel.com/login
- Project Settings: https://vercel.com/your-team/seller-finance-management/settings

### Documentation
- Vercel Env Vars: https://vercel.com/docs/environment-variables
- Vite Env Vars: https://vitejs.dev/guide/env-and-mode.html

### BigQuery Console
- Project: https://console.cloud.google.com/bigquery?project=dogwood-baton-345622

---

*Last updated: February 18, 2026*
*Deployment target: Production*
