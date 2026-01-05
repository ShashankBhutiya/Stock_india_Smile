-- Create profiles table linked to auth users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create virtual_accounts table for virtual cash
CREATE TABLE public.virtual_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 1000000.00,
  initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 1000000.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stocks table for cached stock metadata
CREATE TABLE public.stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  exchange TEXT NOT NULL DEFAULT 'NSE',
  sector TEXT,
  description TEXT,
  current_price NUMERIC(15, 2),
  previous_close NUMERIC(15, 2),
  day_high NUMERIC(15, 2),
  day_low NUMERIC(15, 2),
  day_open NUMERIC(15, 2),
  volume BIGINT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(symbol, exchange)
);

-- Create orders table for all buy/sell orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('BUY', 'SELL')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(15, 2) NOT NULL CHECK (price > 0),
  total_value NUMERIC(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio_holdings table for current holdings
CREATE TABLE public.portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  average_price NUMERIC(15, 2) NOT NULL CHECK (average_price > 0),
  total_invested NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, stock_id)
);

-- Create transactions table for transaction history
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(15, 2) NOT NULL CHECK (price > 0),
  total_value NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Virtual accounts policies
CREATE POLICY "Users can view their own virtual account" ON public.virtual_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own virtual account" ON public.virtual_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own virtual account" ON public.virtual_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Stocks policies (public read, no write from client)
CREATE POLICY "Anyone can view stocks" ON public.stocks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert stocks" ON public.stocks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update stocks" ON public.stocks FOR UPDATE USING (auth.role() = 'authenticated');

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Portfolio holdings policies
CREATE POLICY "Users can view their own holdings" ON public.portfolio_holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own holdings" ON public.portfolio_holdings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own holdings" ON public.portfolio_holdings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own holdings" ON public.portfolio_holdings FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_virtual_accounts_updated_at BEFORE UPDATE ON public.virtual_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_portfolio_holdings_updated_at BEFORE UPDATE ON public.portfolio_holdings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup - creates profile and virtual account
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.virtual_accounts (user_id, balance, initial_balance)
  VALUES (NEW.id, 1000000.00, 1000000.00);
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile and virtual account on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert popular Indian stocks for the simulator
INSERT INTO public.stocks (symbol, name, exchange, sector, description) VALUES
('RELIANCE', 'Reliance Industries Ltd', 'NSE', 'Energy', 'Indian multinational conglomerate company headquartered in Mumbai.'),
('TCS', 'Tata Consultancy Services', 'NSE', 'IT', 'Indian multinational information technology services and consulting company.'),
('HDFCBANK', 'HDFC Bank Ltd', 'NSE', 'Banking', 'Indian banking and financial services company headquartered in Mumbai.'),
('INFY', 'Infosys Ltd', 'NSE', 'IT', 'Indian multinational corporation that provides business consulting and IT services.'),
('ICICIBANK', 'ICICI Bank Ltd', 'NSE', 'Banking', 'Indian multinational bank and financial services company.'),
('HINDUNILVR', 'Hindustan Unilever Ltd', 'NSE', 'FMCG', 'British-Indian consumer goods company headquartered in Mumbai.'),
('SBIN', 'State Bank of India', 'NSE', 'Banking', 'Indian multinational public sector bank and financial services statutory body.'),
('BHARTIARTL', 'Bharti Airtel Ltd', 'NSE', 'Telecom', 'Indian multinational telecommunications services company.'),
('ITC', 'ITC Ltd', 'NSE', 'FMCG', 'Indian multinational conglomerate company headquartered in Kolkata.'),
('KOTAKBANK', 'Kotak Mahindra Bank', 'NSE', 'Banking', 'Indian banking and financial services company headquartered in Mumbai.'),
('LT', 'Larsen & Toubro Ltd', 'NSE', 'Infrastructure', 'Indian multinational engaged in EPC projects, hi-tech manufacturing and services.'),
('AXISBANK', 'Axis Bank Ltd', 'NSE', 'Banking', 'Indian banking and financial services company headquartered in Mumbai.'),
('ASIANPAINT', 'Asian Paints Ltd', 'NSE', 'Paints', 'Indian multinational paint company headquartered in Mumbai.'),
('MARUTI', 'Maruti Suzuki India Ltd', 'NSE', 'Automobile', 'Indian automobile manufacturer based in New Delhi.'),
('SUNPHARMA', 'Sun Pharmaceutical Industries', 'NSE', 'Pharma', 'Indian multinational pharmaceutical company headquartered in Mumbai.'),
('TITAN', 'Titan Company Ltd', 'NSE', 'Consumer Goods', 'Indian luxury goods company that mainly manufactures watches and jewellery.'),
('BAJFINANCE', 'Bajaj Finance Ltd', 'NSE', 'Finance', 'Indian non-banking financial company based in Pune.'),
('WIPRO', 'Wipro Ltd', 'NSE', 'IT', 'Indian multinational corporation that provides IT, consulting and business process services.'),
('HCLTECH', 'HCL Technologies Ltd', 'NSE', 'IT', 'Indian multinational information technology services and consulting company.'),
('TATAMOTORS', 'Tata Motors Ltd', 'NSE', 'Automobile', 'Indian multinational automotive manufacturing company headquartered in Mumbai.');