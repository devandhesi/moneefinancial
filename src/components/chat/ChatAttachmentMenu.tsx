import { useState, useRef } from "react";
import { TrendingUp, Image, ListChecks, BarChart3, Plus, Search, Loader2, X, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface ChatAttachmentMenuProps {
  onSendContent: (content: string) => void;
  disabled?: boolean;
}

export default function ChatAttachmentMenu({ onSendContent, disabled }: ChatAttachmentMenuProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [showStockPicker, setShowStockPicker] = useState(false);
  const [showChartPicker, setShowChartPicker] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Stock/Chart search
  const [tickerSearch, setTickerSearch] = useState("");
  const [tickerResults, setTickerResults] = useState<{ symbol: string; name: string }[]>([]);
  const [searchingTicker, setSearchingTicker] = useState(false);

  // Poll creator
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const searchTickers = async (q: string) => {
    if (q.length < 1) { setTickerResults([]); return; }
    setSearchingTicker(true);
    try {
      const { data, error } = await supabase.functions.invoke("stock-search", {
        body: { query: q },
      });
      if (error) throw error;
      setTickerResults((data?.results || []).slice(0, 8));
    } catch (e) {
      console.error("Ticker search failed:", e);
      setTickerResults([]);
      toast.error("Search failed. Please try again.");
    }
    setSearchingTicker(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("chat-images").upload(path, file);
    if (error) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(path);
    onSendContent(`[img:${urlData.publicUrl}]`);
    setUploading(false);
    setOpen(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSelectStock = (symbol: string) => {
    onSendContent(`[stock:${symbol}]`);
    setShowStockPicker(false);
    setTickerSearch("");
    setTickerResults([]);
  };

  const handleSelectChart = (symbol: string) => {
    onSendContent(`[chart:${symbol}]`);
    setShowChartPicker(false);
    setTickerSearch("");
    setTickerResults([]);
  };

  const handleCreatePoll = async () => {
    if (!pollQuestion.trim() || !user) return;
    const validOptions = pollOptions.filter((o) => o.trim());
    if (validOptions.length < 2) {
      toast.error("Need at least 2 options");
      return;
    }
    const { data, error } = await supabase
      .from("chat_polls")
      .insert({ question: pollQuestion.trim(), options: validOptions, created_by: user.id })
      .select("id")
      .single();
    if (error || !data) {
      toast.error("Failed to create poll");
      return;
    }
    onSendContent(`[poll:${data.id}]`);
    setShowPollCreator(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
  };

  const items = [
    {
      icon: TrendingUp, label: "Share Stock", desc: "Search a ticker",
      action: () => { setOpen(false); setShowStockPicker(true); setTickerSearch(""); setTickerResults([]); },
    },
    {
      icon: Image, label: "Photo", desc: "Upload image",
      action: () => { setOpen(false); fileRef.current?.click(); },
    },
    {
      icon: ListChecks, label: "Poll", desc: "Create a poll",
      action: () => { setOpen(false); setShowPollCreator(true); },
    },
    {
      icon: BarChart3, label: "Chart", desc: "Share a chart",
      action: () => { setOpen(false); setShowChartPicker(true); setTickerSearch(""); setTickerResults([]); },
    },
  ];

  const TickerSearchDialog = ({ open: isOpen, onOpenChange, title, onSelect }: {
    open: boolean; onOpenChange: (o: boolean) => void; title: string; onSelect: (s: string) => void;
  }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="glass-card flex items-center gap-2 px-3 py-2.5">
          <Search size={14} className="text-muted-foreground" />
          <input
            value={tickerSearch}
            onChange={(e) => { setTickerSearch(e.target.value); searchTickers(e.target.value); }}
            placeholder="Search ticker or company..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
        </div>
        <div className="max-h-[240px] overflow-y-auto space-y-0.5">
          {searchingTicker && <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-muted-foreground" /></div>}
          {!searchingTicker && tickerResults.length === 0 && tickerSearch.length > 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No results</p>
          )}
          {tickerResults.map((r) => (
            <button
              key={r.symbol}
              onClick={() => onSelect(r.symbol)}
              className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-secondary transition-colors text-left"
            >
              <div>
                <p className="text-sm font-semibold">${r.symbol}</p>
                <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">{r.name}</p>
              </div>
              <TrendingUp size={14} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={disabled || uploading}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-40"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-52 p-1.5">
          <div className="flex flex-col gap-0.5">
            {items.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-secondary transition-colors"
              >
                <item.icon size={14} className="text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Stock picker */}
      <TickerSearchDialog open={showStockPicker} onOpenChange={setShowStockPicker} title="Share Stock" onSelect={handleSelectStock} />

      {/* Chart picker */}
      <TickerSearchDialog open={showChartPicker} onOpenChange={setShowChartPicker} title="Share Chart" onSelect={handleSelectChart} />

      {/* Poll creator */}
      <Dialog open={showPollCreator} onOpenChange={setShowPollCreator}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create Poll</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <input
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="w-full rounded-xl bg-secondary px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <div className="space-y-2">
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={opt}
                    onChange={(e) => {
                      const next = [...pollOptions];
                      next[i] = e.target.value;
                      setPollOptions(next);
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  {pollOptions.length > 2 && (
                    <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))} className="p-1 text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 6 && (
                <button
                  onClick={() => setPollOptions([...pollOptions, ""])}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  + Add option
                </button>
              )}
            </div>
            <button
              onClick={handleCreatePoll}
              disabled={!pollQuestion.trim() || pollOptions.filter((o) => o.trim()).length < 2}
              className="w-full rounded-xl bg-foreground py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              Create Poll
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
