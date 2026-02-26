
-- =============================================
-- COMMUNITY PLATFORM DATABASE SCHEMA (fixed ordering)
-- =============================================

-- 1. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  reputation_score INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  conflict_disclosure TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. FOLLOWS TABLE
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- 3. ROOMS TABLE (RLS deferred until room_members exists)
CREATE TYPE public.room_type AS ENUM ('stock', 'hashtag', 'private', 'dm');

CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.room_type NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  rules TEXT,
  symbol TEXT,
  created_by UUID REFERENCES public.profiles(user_id),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rooms_slug ON public.rooms(slug);
CREATE INDEX idx_rooms_type ON public.rooms(type);
CREATE INDEX idx_rooms_symbol ON public.rooms(symbol);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- 4. ROOM MEMBERS (create before rooms RLS policies)
CREATE TYPE public.room_role AS ENUM ('member', 'moderator', 'admin', 'owner');

CREATE TABLE public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role public.room_role NOT NULL DEFAULT 'member',
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_room_members_room ON public.room_members(room_id);
CREATE INDEX idx_room_members_user ON public.room_members(user_id);

ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view room membership" ON public.room_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join rooms" ON public.room_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.room_members FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own membership" ON public.room_members FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Now add rooms RLS policies (room_members exists now)
CREATE POLICY "Public rooms viewable by everyone"
  ON public.rooms FOR SELECT
  USING (type != 'private' OR id IN (SELECT room_id FROM public.room_members WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated users can create rooms"
  ON public.rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Room creators can update"
  ON public.rooms FOR UPDATE USING (auth.uid() = created_by);

-- 5. MESSAGES TABLE
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_bot BOOLEAN NOT NULL DEFAULT false,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_room ON public.messages(room_id, created_at DESC);
CREATE INDEX idx_messages_user ON public.messages(user_id);
CREATE INDEX idx_messages_reply ON public.messages(reply_to);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages viewable in public or joined rooms"
  ON public.messages FOR SELECT TO authenticated
  USING (
    room_id IN (SELECT id FROM public.rooms WHERE type != 'private')
    OR room_id IN (SELECT room_id FROM public.room_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Authenticated users can send messages"
  ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own messages"
  ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 6. MESSAGE REACTIONS
CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX idx_reactions_message ON public.message_reactions(message_id);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions viewable" ON public.message_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can react" ON public.message_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove reactions" ON public.message_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 7. NOTIFICATIONS
CREATE TYPE public.notification_type AS ENUM ('mention', 'reply', 'follow', 'price_alert', 'room_invite', 'system');

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- 8. MESSAGE REPORTS
CREATE TABLE public.message_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, reporter_id)
);

ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can report" ON public.message_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users view own reports" ON public.message_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

-- 9. USER ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 10. REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 11. TIMESTAMPS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', 'User')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
