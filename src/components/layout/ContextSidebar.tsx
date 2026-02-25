import PendingTradesWidget from "../widgets/PendingTradesWidget";
import UpcomingEventsWidget from "../widgets/UpcomingEventsWidget";
import AiInsightWidget from "../widgets/AiInsightWidget";

const ContextSidebar = () => (
  <aside className="hidden space-y-4 xl:block xl:w-80 xl:shrink-0">
    <PendingTradesWidget />
    <UpcomingEventsWidget />
    <AiInsightWidget />
  </aside>
);

export default ContextSidebar;