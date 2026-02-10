-- ============================================
-- Seller Payout Intelligence System
-- Supabase Database Schema Setup
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: sellers
-- ============================================
CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sellers_seller_id ON sellers(seller_id);
CREATE INDEX idx_sellers_email ON sellers(email);

-- ============================================
-- TABLE: orders
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE NOT NULL,
  seller_id TEXT NOT NULL REFERENCES sellers(seller_id) ON DELETE CASCADE,
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
CREATE INDEX idx_orders_order_id ON orders(order_id);

-- ============================================
-- TABLE: payout_history
-- ============================================
CREATE TABLE payout_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id TEXT NOT NULL REFERENCES sellers(seller_id) ON DELETE CASCADE,
  payout_date TIMESTAMPTZ NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'delayed', 'held', 'pending')),
  order_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payout_history_seller_id ON payout_history(seller_id);
CREATE INDEX idx_payout_history_payout_date ON payout_history(payout_date DESC);

-- ============================================
-- TABLE: active_blockers
-- ============================================
CREATE TABLE active_blockers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id TEXT NOT NULL REFERENCES sellers(seller_id) ON DELETE CASCADE,
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

-- ============================================
-- TABLE: trust_scores
-- ============================================
CREATE TABLE trust_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id TEXT NOT NULL REFERENCES sellers(seller_id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  trend TEXT NOT NULL CHECK (trend IN ('improving', 'stable', 'declining')),
  top_drivers JSONB NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trust_scores_seller_id ON trust_scores(seller_id);
CREATE INDEX idx_trust_scores_calculated_at ON trust_scores(calculated_at DESC);

-- ============================================
-- TABLE: order_timeline_events
-- ============================================
CREATE TABLE order_timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
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

-- ============================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ============================================

-- Enable RLS on all tables
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_blockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Sellers table policies
CREATE POLICY "Sellers can view own data" ON sellers
  FOR SELECT USING (auth.uid()::text = seller_id);

CREATE POLICY "Sellers can insert own data" ON sellers
  FOR INSERT WITH CHECK (auth.uid()::text = seller_id);

CREATE POLICY "Sellers can update own data" ON sellers
  FOR UPDATE USING (auth.uid()::text = seller_id);

-- Orders table policies
CREATE POLICY "Sellers can view own orders" ON orders
  FOR SELECT USING (seller_id IN (SELECT seller_id FROM sellers WHERE auth.uid()::text = seller_id));

CREATE POLICY "Sellers can insert own orders" ON orders
  FOR INSERT WITH CHECK (seller_id IN (SELECT seller_id FROM sellers WHERE auth.uid()::text = seller_id));

-- Payout history policies
CREATE POLICY "Sellers can view own payout history" ON payout_history
  FOR SELECT USING (seller_id IN (SELECT seller_id FROM sellers WHERE auth.uid()::text = seller_id));

-- Active blockers policies
CREATE POLICY "Sellers can view own blockers" ON active_blockers
  FOR SELECT USING (seller_id IN (SELECT seller_id FROM sellers WHERE auth.uid()::text = seller_id));

-- Trust scores policies
CREATE POLICY "Sellers can view own trust scores" ON trust_scores
  FOR SELECT USING (seller_id IN (SELECT seller_id FROM sellers WHERE auth.uid()::text = seller_id));

-- Order timeline events policies
CREATE POLICY "Sellers can view own order timeline" ON order_timeline_events
  FOR SELECT USING (order_id IN (SELECT order_id FROM orders WHERE seller_id IN (SELECT seller_id FROM sellers WHERE auth.uid()::text = seller_id)));

-- ============================================
-- SAMPLE TEST DATA
-- ============================================

-- Insert test seller (seller_id will be replaced with actual auth.uid() during real usage)
-- This is just for initial testing - you can delete after setting up real authentication
INSERT INTO sellers (seller_id, email) VALUES
('test-seller-001', 'test@seller.com');

-- Insert sample orders
INSERT INTO orders (order_id, seller_id, completed_at, eligibility_date, status, amount, hold_reasons, days_until_eligible, product_name, sku, category) VALUES
('ORD-2024-001', 'test-seller-001', NOW() - INTERVAL '5 days', NOW() + INTERVAL '10 days', 'pending_eligibility', 125.50, '{}', 10, 'Wireless Headphones', 'WH-001', 'Electronics'),
('ORD-2024-002', 'test-seller-001', NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days', 'eligible', 89.99, '{}', NULL, 'USB-C Cable', 'USB-002', 'Accessories'),
('ORD-2024-003', 'test-seller-001', NOW() - INTERVAL '3 days', NOW() + INTERVAL '12 days', 'held', 249.99, ARRAY['quality_review_pending', 'return_window_active'], 12, 'Laptop Stand', 'LS-003', 'Office');

-- Insert sample payout history
INSERT INTO payout_history (seller_id, payout_date, amount, status, order_count) VALUES
('test-seller-001', NOW() - INTERVAL '30 days', 1250.75, 'completed', 8),
('test-seller-001', NOW() - INTERVAL '60 days', 980.50, 'completed', 6),
('test-seller-001', NOW() - INTERVAL '90 days', 1500.00, 'completed', 10);

-- Insert sample active blocker
INSERT INTO active_blockers (seller_id, reason_code, severity, title, description, action_required, estimated_resolution) VALUES
('test-seller-001', 'QUALITY_REVIEW', 'warning', 'Quality Review in Progress', 'Order ORD-2024-003 is undergoing quality review. This is a standard process for new product categories.', false, '2-3 business days');

-- Insert sample trust score
INSERT INTO trust_scores (seller_id, score, risk_level, trend, top_drivers) VALUES
('test-seller-001', 85, 'low', 'improving',
  '[
    {"factor": "On-time shipping", "impact": 15, "description": "98% of orders shipped within 24 hours"},
    {"factor": "Return rate", "impact": 10, "description": "Low return rate of 2.5%"},
    {"factor": "Customer satisfaction", "impact": 8, "description": "4.8/5 average rating"}
  ]'::jsonb
);

-- Insert sample order timeline events
INSERT INTO order_timeline_events (order_id, step, title, event_date, status, description, icon, details) VALUES
('ORD-2024-002', 'order_completed', 'Order Completed', NOW() - INTERVAL '20 days', 'completed', 'Customer received and confirmed order', 'Package', '{"customer_feedback": "5 stars"}'::jsonb),
('ORD-2024-002', 'return_window_closed', 'Return Window Closed', NOW() - INTERVAL '5 days', 'completed', '15-day return window has ended', 'Clock', NULL),
('ORD-2024-002', 'eligible_for_payout', 'Eligible for Payout', NOW() - INTERVAL '5 days', 'current', 'Order is now eligible for next payout cycle', 'DollarSign', NULL);

-- ============================================
-- FUNCTIONS (Optional - for advanced features)
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema setup complete!';
  RAISE NOTICE '✅ All tables created with indexes';
  RAISE NOTICE '✅ Row Level Security (RLS) enabled';
  RAISE NOTICE '✅ RLS policies configured';
  RAISE NOTICE '✅ Sample test data inserted';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Copy your Supabase URL and anon key to .env file';
  RAISE NOTICE '2. Enable Email authentication in Supabase Dashboard > Authentication > Providers';
  RAISE NOTICE '3. Test locally with: npm run dev';
END $$;
