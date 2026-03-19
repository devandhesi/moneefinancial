
-- Learn streaks: track daily learning activity
CREATE TABLE public.learn_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  total_xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.learn_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks" ON public.learn_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON public.learn_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON public.learn_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Learn bookmarks: save lessons/modules for later
CREATE TABLE public.learn_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type text NOT NULL, -- 'lesson', 'module', 'glossary'
  item_id text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE public.learn_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON public.learn_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON public.learn_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.learn_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Quiz attempts: track every quiz/test attempt with scores
CREATE TABLE public.learn_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quiz_type text NOT NULL, -- 'lesson', 'module', 'unit-test'
  quiz_id text NOT NULL, -- e.g. 'm1-l1', 'money-value-behaviour-quiz', 'money-value-behaviour-unit'
  score integer NOT NULL,
  total_questions integer NOT NULL,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  time_spent_seconds integer,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learn_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts" ON public.learn_quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON public.learn_quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Learn notes: AI-generated or user notes per lesson
CREATE TABLE public.learn_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id text NOT NULL,
  content text NOT NULL,
  source text NOT NULL DEFAULT 'user', -- 'user' or 'ai'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learn_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON public.learn_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.learn_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.learn_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.learn_notes FOR DELETE USING (auth.uid() = user_id);
