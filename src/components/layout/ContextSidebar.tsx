import PendingTradesWidget from "../widgets/PendingTradesWidget";
import UpcomingEventsWidget from "../widgets/UpcomingEventsWidget";
import AiInsightWidget from "../widgets/AiInsightWidget";
import { useDailyDigest } from "@/hooks/use-daily-digest";

const ContextSidebar = () => {
  const { data: digest, isLoading } = useDailyDigest();

  return (
    <aside className="hidden space-y-4 xl:block xl:w-80 xl:shrink-0">
      <PendingTradesWidget />
      <UpcomingEventsWidget events={digest?.upcomingEvents} isLoading={isLoading} />
      <AiInsightWidget insight={digest?.aiInsight} isLoading={isLoading} />
    </aside>
  );
};

export default ContextSidebar;
