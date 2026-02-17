# Quick Start Guide 🚀

## Test Locally Right Now (30 seconds)

```bash
cd ~/Downloads/project
npm run dev
```

Then open: **http://localhost:5173/dashboard?vendor=vibe-vintage**

**Expected Result**: Portal loads with 37 orders and £1,271.52 payout

---

## Deploy to Production (5 minutes)

### 1. Go to Vercel Dashboard
https://vercel.com/dashboard

### 2. Add Environment Variables
Go to: Project → Settings → Environment Variables

Add these 3 variables:
```
VITE_USE_BIGQUERY = true
VITE_BIGQUERY_PROJECT_ID = dogwood-baton-345622
VITE_DEFAULT_VENDOR = vibe-vintage
```

### 3. Redeploy
Deployments → Latest → ⋮ (menu) → Redeploy

### 4. Test Production
Open: `https://your-app.vercel.app/dashboard?vendor=vibe-vintage`

---

## What You'll See

### Dashboard
- **Upcoming Payout**: £1,271.52
- **Orders**: 37 orders listed with full financial breakdown
- **Payout History**: Last 5 completed payouts
- **Data Source**: "BigQuery (Live)"

### Orders Page
All 14 fields visible:
- Internal Order ID
- Product Name
- Vendor
- Payout Status
- Created Date
- Latest Status
- Original Final Base (£)
- Commission (%)
- Original Commission (£)
- Base After Commission (£)
- Vendor Shipping Cost (£)
- Supplier Refund (£)
- Cancellation Fee (£)
- Total Paid Amount (£)
- Includes Shipping flag

---

## Status: ✅ COMPLETE

**MVP is production-ready!**

All 14 required fields implemented and tested.
Real BigQuery data working perfectly.

---

## Need More Details?

- **Technical Details**: Read `IMPLEMENTATION_SUMMARY.md`
- **Deployment Guide**: Read `VERCEL_SETUP.md`
- **Overnight Work**: Read `WORK_COMPLETED_TONIGHT.md`

---

**Created**: Feb 18, 2026
**Status**: Production Ready ✅
