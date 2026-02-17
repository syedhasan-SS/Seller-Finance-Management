# Architecture Notes - BigQuery Integration

## Current Issue: MCP Tools Can't Run in Browser

### Problem
The BigQuery MCP tools (`mcp__bigquery__execute_sql`) can only be called from the Claude Code environment, NOT from:
- Browser JavaScript
- Regular Node.js/Express servers
- Vercel serverless functions

### Why You're Seeing "Loading..." Forever

The current code tries to call `globalThis.mcp__bigquery__execute_sql()` from the browser, which fails silently because the function doesn't exist in the browser environment.

```typescript
// This ONLY works in Claude Code, NOT in browser:
const result = await (globalThis as any).mcp__bigquery__execute_sql({
  sql: sql,
  dry_run: false
});
```

---

## Solution Options

### Option 1: Use Sample Data (Current - WORKING)

**Status**: ✅ Active
**File**: `.env` has `VITE_USE_BIGQUERY=false`

The portal now shows sample data that demonstrates all 14 fields. This works immediately and shows the complete UI.

**To test**:
```bash
npm run dev
# Open: http://localhost:5173/dashboard
```

**Pros**:
- Works immediately
- Shows all UI features
- Good for development/demos

**Cons**:
- Not real data
- Can't test with different vendors

---

### Option 2: Build a Backend API with BigQuery Client Library (Recommended for Production)

**Status**: 🔨 Need to implement

Instead of using MCP tools, use the official BigQuery Node.js client library in a backend API.

**Architecture**:
```
Browser (React)
    ↓ HTTP Request
Backend API (Node.js/Express)
    ↓ BigQuery Client Library
Google BigQuery
```

**Implementation Steps**:

1. **Install BigQuery Client**:
```bash
npm install @google-cloud/bigquery
```

2. **Create Backend API** (`/api` folder):
```javascript
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery({
  projectId: 'dogwood-baton-345622',
  keyFilename: './service-account-key.json' // Needs credentials
});

app.get('/api/sellers/:vendorId/orders', async (req, res) => {
  const query = `SELECT ... FROM ...`;
  const [rows] = await bigquery.query(query);
  res.json(rows);
});
```

3. **Update Frontend to Call API**:
```typescript
// Instead of calling MCP tool directly:
const response = await fetch(`/api/sellers/${vendorId}/orders`);
const orders = await response.json();
```

**Pros**:
- Works in production (Vercel, AWS, etc.)
- Uses official Google library
- Scalable and reliable

**Cons**:
- Requires BigQuery service account credentials
- Need to set up backend infrastructure
- More complex deployment

---

### Option 3: Vercel Serverless Functions

**Status**: 🔨 Need to implement

Use Vercel's serverless functions with BigQuery client library.

**File Structure**:
```
/api
  /vendors
    [handle].ts    # GET /api/vendors/:handle
  /sellers
    [vendorId]
      /orders.ts   # GET /api/sellers/:vendorId/orders
```

**Example** (`/api/sellers/[vendorId]/orders.ts`):
```typescript
import { BigQuery } from '@google-cloud/bigquery';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const bigquery = new BigQuery({
  projectId: process.env.BIGQUERY_PROJECT_ID,
  credentials: JSON.parse(process.env.BIGQUERY_CREDENTIALS)
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { vendorId } = req.query;
  const query = `SELECT ... WHERE vendor_id = ${vendorId}`;
  const [rows] = await bigquery.query(query);
  res.json(rows);
}
```

**Pros**:
- Works with Vercel deployment
- Serverless = auto-scaling
- No server management

**Cons**:
- Requires service account credentials in env vars
- Cold start latency
- Need to set up for each endpoint

---

## Recommended Approach for Production

### Phase 1: Development (Current)
✅ Use sample data (`VITE_USE_BIGQUERY=false`)
- Portal works immediately
- Can develop and test UI
- No credentials needed

### Phase 2: Backend API Setup
1. Get BigQuery service account credentials from Google Cloud Console
2. Create Express backend with `@google-cloud/bigquery` library
3. Deploy backend to Vercel/AWS/Railway
4. Update frontend to call backend API instead of MCP tools
5. Set `VITE_USE_BIGQUERY=true` and `VITE_API_URL=https://api.yourapp.com`

### Phase 3: Production Deployment
1. Deploy backend with environment variables:
   - `BIGQUERY_PROJECT_ID=dogwood-baton-345622`
   - `BIGQUERY_CREDENTIALS=<service-account-json>`
2. Deploy frontend to Vercel
3. Configure CORS between frontend and backend
4. Test with real vendors

---

## What's Working Right Now

### ✅ With Sample Data (`VITE_USE_BIGQUERY=false`)
- Dashboard loads 2 sample orders
- Orders page shows order list
- All 14 fields are displayed in UI
- Payout timeline works
- Trust score widget works
- Payout history works
- **Status**: FULLY FUNCTIONAL for demo/development

### ❌ With BigQuery (`VITE_USE_BIGQUERY=true`)
- Browser tries to call MCP tool (doesn't exist)
- Gets stuck in "Loading..." state forever
- No errors shown (silent failure)
- **Status**: NEEDS BACKEND API

---

## Quick Fix to See Portal Working

```bash
# 1. Ensure .env has BigQuery disabled
echo "VITE_USE_BIGQUERY=false" > .env

# 2. Restart dev server
npm run dev

# 3. Open browser
open http://localhost:5173/dashboard
```

You should now see the portal working with sample data showing all the UI features!

---

## Getting BigQuery Service Account Credentials

To implement Option 2 or 3, you need credentials:

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Select project: `dogwood-baton-345622`
3. Go to IAM & Admin → Service Accounts
4. Create new service account or use existing
5. Grant roles:
   - BigQuery Data Viewer
   - BigQuery Job User
6. Create JSON key
7. Download and save as `service-account-key.json`
8. **NEVER commit this file to git!**

---

## Next Steps

1. **Short term** (Today):
   - ✅ Portal works with sample data
   - Test all UI features
   - Verify all 14 fields display correctly

2. **Medium term** (This week):
   - Get BigQuery service account credentials
   - Implement backend API with `@google-cloud/bigquery`
   - Test with real data locally

3. **Long term** (Production):
   - Deploy backend API
   - Configure production credentials
   - Switch frontend to use backend API
   - Deploy to Vercel

---

## Summary

**Current Status**: Portal works with sample data, showing all features and 14 fields.

**To use real BigQuery data**: Need to build a backend API because MCP tools only work in Claude Code, not in browsers or production environments.

**Best path forward**:
1. Use sample data for now (works great!)
2. Build proper backend with BigQuery client library
3. Deploy both frontend and backend to production

The BigQuery queries we wrote are still valid and will work perfectly once we have the proper backend infrastructure!

---

*Last updated: February 18, 2026*
*Status: Sample data working, BigQuery needs backend API*
