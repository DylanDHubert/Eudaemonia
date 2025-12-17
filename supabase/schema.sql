-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.custom_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['numeric'::text, 'scale'::text, 'boolean'::text])),
  min double precision,
  max double precision,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT custom_categories_pkey PRIMARY KEY (id),
  CONSTRAINT custom_categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.custom_category_entries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  value double precision NOT NULL,
  daily_entry_id uuid NOT NULL,
  custom_category_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT custom_category_entries_pkey PRIMARY KEY (id),
  CONSTRAINT custom_category_entries_daily_entry_id_fkey FOREIGN KEY (daily_entry_id) REFERENCES public.daily_entries(id),
  CONSTRAINT custom_category_entries_custom_category_id_fkey FOREIGN KEY (custom_category_id) REFERENCES public.custom_categories(id)
);
CREATE TABLE public.daily_entries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  date timestamp with time zone NOT NULL DEFAULT now(),
  sleep_hours double precision NOT NULL,
  sleep_quality integer NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  exercise boolean NOT NULL DEFAULT false,
  exercise_time integer,
  alcohol boolean NOT NULL DEFAULT false,
  alcohol_units double precision,
  cannabis boolean NOT NULL DEFAULT false,
  cannabis_amount double precision,
  meditation boolean NOT NULL DEFAULT false,
  meditation_time integer,
  social_time double precision,
  work_hours double precision,
  stress_level integer NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
  happiness_rating integer NOT NULL CHECK (happiness_rating >= 1 AND happiness_rating <= 10),
  meals integer,
  food_quality integer CHECK (food_quality IS NULL OR food_quality >= 1 AND food_quality <= 10),
  notes text,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT daily_entries_pkey PRIMARY KEY (id),
  CONSTRAINT daily_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.exposure_entries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text, 'flight'::text])),
  title text NOT NULL,
  notes text,
  suds_pre integer NOT NULL CHECK (suds_pre >= 1 AND suds_pre <= 10),
  suds_peak integer NOT NULL CHECK (suds_peak >= 1 AND suds_peak <= 10),
  suds_post integer NOT NULL CHECK (suds_post >= 1 AND suds_post <= 10),
  date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  duration integer,
  CONSTRAINT exposure_entries_pkey PRIMARY KEY (id),
  CONSTRAINT exposure_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.gratitudes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  content text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gratitudes_pkey PRIMARY KEY (id),
  CONSTRAINT gratitudes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  name text,
  email text UNIQUE,
  image text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.quick_entries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['sleep'::text, 'mood'::text, 'pride'::text, 'energy'::text])),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 10),
  notes text,
  date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quick_entries_pkey PRIMARY KEY (id),
  CONSTRAINT quick_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);