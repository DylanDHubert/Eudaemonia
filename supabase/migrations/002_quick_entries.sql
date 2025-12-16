-- CREATE QUICK ENTRIES TABLE FOR QUICK TRACKING
CREATE TABLE IF NOT EXISTS public.quick_entries (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('sleep', 'anxiety', 'contentment', 'energy')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE INDEX FOR USER_ID FOR FASTER QUERIES
CREATE INDEX IF NOT EXISTS idx_quick_entries_user_id ON public.quick_entries(user_id);

-- CREATE INDEX FOR DATE FOR SORTING
CREATE INDEX IF NOT EXISTS idx_quick_entries_date ON public.quick_entries(date DESC);

-- CREATE INDEX FOR CATEGORY FOR FILTERING
CREATE INDEX IF NOT EXISTS idx_quick_entries_category ON public.quick_entries(category);

-- CREATE TRIGGER TO UPDATE updated_at TIMESTAMP
CREATE TRIGGER update_quick_entries_updated_at
  BEFORE UPDATE ON public.quick_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

