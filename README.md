# Seller Payout Intelligence System

A comprehensive dashboard for sellers to track payout timelines, order breakdowns, quality metrics, and payout history in real-time.

## Features

### 📊 Core Features
1. **Upcoming Payout Visibility** - Real-time view of next payout with confidence indicators
2. **Order Breakdown** - Detailed breakdown of all orders in upcoming payout cycle
3. **Active Blockers** - Visibility into issues preventing or delaying payouts
4. **Quality Score** - Track seller trust score with improvement recommendations
5. **Payout History** - Complete timeline of past payouts with status tracking

### 🔐 Authentication
- Email/password authentication
- Magic link authentication
- Session persistence
- Protected routes
- Auto token refresh

## Tech Stack

- **Frontend:** React 18.3, TypeScript 5.5
- **Routing:** React Router 7.13
- **State Management:** React Query 5.90
- **Backend:** Supabase (PostgreSQL + Auth)
- **Build Tool:** Vite 5.4
- **Styling:** TailwindCSS 3.4
- **Icons:** Lucide React
- **Deployment:** Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Vercel account (for deployment)

## Getting Started

### 1. Clone and Install

```bash
cd /Users/syedfaezhasan/Downloads/project
npm install
```

### 2. Environment Setup

Create `.env` file:

```bash
cp .env.example .env
```

Update with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Supabase Database Setup

Create the following tables in your Supabase project:

**sellers**
```sql
CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sellers_seller_id ON sellers(seller_id);
```

**orders**
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE NOT NULL,
  seller_id TEXT NOT NULL REFERENCES sellers(seller_id),
  completed_at TIMESTAMPTZ NOT NULL,
  eligibility_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('eligible', 'pending_eligibility', 'held', 'paid')),
  amount DECIMAL(10,2) NOT NULL,
  hold_reasons TEXT[] DEFAULT '{}',
  days_until_eligible INTEGER,
  product_name TEXT,
  sku TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_eligibility_date ON orders(eligibility_date);
```

**payout_history**
```sql
CREATE TABLE payout_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id TEXT NOT NULL REFERENCES sellers(seller_id),
  payout_date TIMESTAMPTZ NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'delayed', 'held', 'pending')),
  order_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payout_history_seller_id ON payout_history(seller_id);
CREATE INDEX idx_payout_history_payout_date ON payout_history(payout_date DESC);
```

**active_blockers**
```sql
CREATE TABLE active_blockers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id TEXT NOT NULL REFERENCES sellers(seller_id),
  reason_code TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_required BOOLEAN DEFAULT FALSE,
  estimated_resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_active_blockers_seller_id ON active_blockers(seller_id);
CREATE INDEX idx_active_blockers_resolved ON active_blockers(resolved_at) WHERE resolved_at IS NULL;
```

**trust_scores**
```sql
CREATE TABLE trust_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id TEXT NOT NULL REFERENCES sellers(seller_id),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  trend TEXT NOT NULL CHECK (trend IN ('improving', 'stable', 'declining')),
  top_drivers JSONB NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trust_scores_seller_id ON trust_scores(seller_id);
CREATE INDEX idx_trust_scores_calculated_at ON trust_scores(calculated_at DESC);
```

**order_timeline_events**
```sql
CREATE TABLE order_timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES orders(order_id),
  step TEXT NOT NULL,
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'current', 'pending')),
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_timeline_order_id ON order_timeline_events(order_id);
CREATE INDEX idx_order_timeline_event_date ON order_timeline_events(event_date);
```

### 4. Enable Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_blockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline_events ENABLE ROW LEVEL SECURITY;

-- Sellers can only access their own data
CREATE POLICY "Sellers can view own data" ON sellers
  FOR SELECT USING (auth.uid()::text = seller_id);

CREATE POLICY "Sellers can view own orders" ON orders
  FOR SELECT USING (seller_id IN (SELECT seller_id FROM sellers WHERE auth.uid()::text = seller_id));

CREATE POLICY "Sellers can view own payout history" ON payout_history
  FOR SELECT USING (seller_id IN (SELECT seller_id FROM sellers WHERE auth.uid()::text = seller_id));

CREATE POLICY "Sellers can view own blockers" ON active_blockers
  FOR SELECT USING (seller_id IN (SELECT seller_id FROM sellers WHERE auth.uid()::text = seller_id));

CREATE POLICY "Sellers can view own trust scores" ON trust_scores
  FOR SELECT USING (seller_id IN (SELECT seller_id FROM sellers WHERE auth.uid()::text = seller_id));

CREATE POLICY "Sellers can view own order timeline" ON order_timeline_events
  FOR SELECT USING (order_id IN (SELECT order_id FROM orders WHERE seller_id IN (SELECT seller_id FROM sellers WHERE auth.uid()::text = seller_id)));
```

### 5. Development

```bash
# Start development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ActiveBlockers.tsx      # Displays payout blockers
│   ├── Dashboard.tsx            # Main dashboard view
│   ├── ErrorBoundary.tsx        # Error handling boundary
│   ├── Header.tsx               # Navigation header
│   ├── LoadingSpinner.tsx       # Loading indicator
│   ├── Login.tsx                # Authentication page
│   ├── OrderDetail.tsx          # Detailed order view
│   ├── OrdersTable.tsx          # Orders listing
│   ├── OrderTimeline.tsx        # Order timeline visualization
│   ├── PayoutHistory.tsx        # Historical payouts
│   ├── PayoutTimeline.tsx       # Upcoming payout widget
│   ├── ProtectedRoute.tsx       # Route guard
│   └── TrustScoreWidget.tsx     # Quality score display
├── contexts/
│   └── AuthContext.tsx          # Authentication context
├── services/
│   ├── api.ts                   # API service layer
│   ├── queries.ts               # React Query hooks
│   └── supabase.ts              # Supabase client
├── utils/                       # Utility functions
├── App.tsx                      # Root application with routing
├── main.tsx                     # Application entry point
└── types.ts                     # TypeScript type definitions
```

## Deployment

### Deploy to Vercel

**Option 1: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Option 2: GitHub Integration**

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## Features in Detail

### Upcoming Payout Visibility
- Estimated payout date with countdown
- Total payout amount
- Confidence indicator (high/medium/low)
- Progress bar showing payout cycle progress
- Current payout cycle information

### Order Breakdown
- Interactive table of all orders
- Status indicators (eligible, pending, held)
- Completion dates and amounts
- Hold reasons with detailed explanations
- Click to view detailed order timeline

### Active Blockers
- Real-time blocker notifications
- Severity levels (info, warning, error)
- Estimated resolution times
- Action required indicators
- Clear descriptions and next steps

### Quality Score
- Score out of 100 with trend indicator
- Risk level assessment
- Top factors affecting score
- Improvement suggestions
- Historical trend tracking

### Payout History
- Timeline of past payouts
- Status for each payout (completed, delayed, held)
- Order count per payout
- Date and amount tracking
- Visual timeline with status icons

## Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for all routes
- Session tokens auto-refresh
- Environment variables secured in Vercel
- HTTPS enforced in production

## Performance

- Bundle size: ~128 KB (gzipped)
- Code splitting enabled
- Lazy loading for routes
- React Query caching (5 min stale time)
- Optimized build with Vite

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This project follows the migration plan documented in `MIGRATION_COMPLETE.md`.

## License

Private - Fleek Internal Project

## Support

For issues or questions, contact the development team or refer to:
- Migration documentation: `MIGRATION_COMPLETE.md`
- Implementation plan: `~/.claude/plans/swift-painting-yao.md`
