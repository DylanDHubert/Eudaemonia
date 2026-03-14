-- BLOOD PRESSURE ENTRIES: ONE ROW PER DAY PER USER, 5 READINGS (systolic, diastolic, bpm) EACH
-- RUN THIS IN SUPABASE SQL EDITOR IF YOU PREFER; OR USE: supabase db push

CREATE TABLE IF NOT EXISTS public.blood_pressure_entries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  systolic_1 integer NOT NULL CHECK (systolic_1 >= 50 AND systolic_1 <= 250),
  diastolic_1 integer NOT NULL CHECK (diastolic_1 >= 30 AND diastolic_1 <= 180),
  bpm_1 integer NOT NULL CHECK (bpm_1 >= 30 AND bpm_1 <= 250),
  systolic_2 integer NOT NULL CHECK (systolic_2 >= 50 AND systolic_2 <= 250),
  diastolic_2 integer NOT NULL CHECK (diastolic_2 >= 30 AND diastolic_2 <= 180),
  bpm_2 integer NOT NULL CHECK (bpm_2 >= 30 AND bpm_2 <= 250),
  systolic_3 integer NOT NULL CHECK (systolic_3 >= 50 AND systolic_3 <= 250),
  diastolic_3 integer NOT NULL CHECK (diastolic_3 >= 30 AND diastolic_3 <= 180),
  bpm_3 integer NOT NULL CHECK (bpm_3 >= 30 AND bpm_3 <= 250),
  systolic_4 integer NOT NULL CHECK (systolic_4 >= 50 AND systolic_4 <= 250),
  diastolic_4 integer NOT NULL CHECK (diastolic_4 >= 30 AND diastolic_4 <= 180),
  bpm_4 integer NOT NULL CHECK (bpm_4 >= 30 AND bpm_4 <= 250),
  systolic_5 integer NOT NULL CHECK (systolic_5 >= 50 AND systolic_5 <= 250),
  diastolic_5 integer NOT NULL CHECK (diastolic_5 >= 30 AND diastolic_5 <= 180),
  bpm_5 integer NOT NULL CHECK (bpm_5 >= 30 AND bpm_5 <= 250),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blood_pressure_entries_pkey PRIMARY KEY (id),
  CONSTRAINT blood_pressure_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT blood_pressure_entries_user_date_unique UNIQUE (user_id, date)
);

-- RLS: USER CAN ONLY ACCESS THEIR OWN ROWS
ALTER TABLE public.blood_pressure_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own blood_pressure_entries"
  ON public.blood_pressure_entries
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- INDEX FOR LISTING BY USER AND DATE
CREATE INDEX IF NOT EXISTS blood_pressure_entries_user_id_date_idx
  ON public.blood_pressure_entries (user_id, date DESC);
