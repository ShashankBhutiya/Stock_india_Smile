-- Create dividends table
CREATE TABLE IF NOT EXISTS dividends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_symbol TEXT NOT NULL,
    ex_date DATE NOT NULL,
    pay_date DATE NOT NULL,
    dividend_per_share NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create dividend_transactions table
CREATE TABLE IF NOT EXISTS dividend_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    stock_symbol TEXT NOT NULL,
    shares NUMERIC NOT NULL,
    dividend_per_share NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    paid_on TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividend_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for dividends (Public read, ServiceRole write)
CREATE POLICY "Public read dividends" ON dividends
    FOR SELECT USING (true);

-- Policies for dividend_transactions (User read own, ServiceRole write)
CREATE POLICY "Users can read own dividend transactions" ON dividend_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Seed some sample dividend data
INSERT INTO dividends (stock_symbol, ex_date, pay_date, dividend_per_share) VALUES
    ('RELIANCE', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', 10.50),
    ('TCS', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '12 days', 25.00),
    ('INFY', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 18.00),
    ('ITC', CURRENT_DATE + INTERVAL '1 days', CURRENT_DATE + INTERVAL '8 days', 5.75),
    ('HDFCBANK', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '2 days', 15.00);
