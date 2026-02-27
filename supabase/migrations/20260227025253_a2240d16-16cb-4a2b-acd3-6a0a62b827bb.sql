
-- Function to sync member_count with actual room_members rows
CREATE OR REPLACE FUNCTION public.sync_room_member_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.rooms SET member_count = (
      SELECT count(*) FROM public.room_members WHERE room_id = NEW.room_id AND is_banned = false
    ) WHERE id = NEW.room_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.rooms SET member_count = (
      SELECT count(*) FROM public.room_members WHERE room_id = OLD.room_id AND is_banned = false
    ) WHERE id = OLD.room_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle ban/unban changes
    IF OLD.is_banned IS DISTINCT FROM NEW.is_banned THEN
      UPDATE public.rooms SET member_count = (
        SELECT count(*) FROM public.room_members WHERE room_id = NEW.room_id AND is_banned = false
      ) WHERE id = NEW.room_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger on room_members to keep member_count in sync
CREATE TRIGGER trg_sync_room_member_count
AFTER INSERT OR DELETE OR UPDATE ON public.room_members
FOR EACH ROW
EXECUTE FUNCTION public.sync_room_member_count();

-- Backfill: set all existing rooms to their actual member count
UPDATE public.rooms r SET member_count = (
  SELECT count(*) FROM public.room_members rm WHERE rm.room_id = r.id AND rm.is_banned = false
);
