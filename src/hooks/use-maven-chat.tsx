import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Msg = { role: "user" | "assistant"; content: string };

interface ChatThread {
  id: string;
  title: string;
  messages: Msg[];
  createdAt: string;
}

interface MavenChatContextType {
  open: boolean;
  setOpen: (v: boolean) => void;
  messages: Msg[];
  setMessages: React.Dispatch<React.SetStateAction<Msg[]>>;
  loading: boolean;
  setLoading: (v: boolean) => void;
  // Chat history
  history: ChatThread[];
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
  startNewChat: () => void;
  loadThread: (id: string) => void;
  saveCurrentThread: () => void;
  activeThreadId: string | null;
}

const MavenChatContext = createContext<MavenChatContextType | null>(null);

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function loadHistory(): ChatThread[] {
  try {
    return JSON.parse(localStorage.getItem("maven-chat-history") || "[]");
  } catch {
    return [];
  }
}

function persistHistory(threads: ChatThread[]) {
  // Keep last 50 threads max
  const trimmed = threads.slice(0, 50);
  localStorage.setItem("maven-chat-history", JSON.stringify(trimmed));
}

export function MavenChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatThread[]>(loadHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const saveCurrentThread = useCallback(() => {
    if (messages.length === 0) return;
    const firstUserMsg = messages.find(m => m.role === "user");
    const title = firstUserMsg?.content.slice(0, 60) || "New Chat";

    setHistory(prev => {
      let updated: ChatThread[];
      if (activeThreadId) {
        // Update existing thread
        updated = prev.map(t =>
          t.id === activeThreadId ? { ...t, messages, title } : t
        );
      } else {
        // Create new thread
        const id = generateId();
        setActiveThreadId(id);
        updated = [{ id, title, messages, createdAt: new Date().toISOString() }, ...prev];
      }
      persistHistory(updated);
      return updated;
    });
  }, [messages, activeThreadId]);

  const startNewChat = useCallback(() => {
    // Save current before starting new
    if (messages.length > 0) {
      saveCurrentThread();
    }
    setMessages([]);
    setActiveThreadId(null);
    setShowHistory(false);
  }, [messages, saveCurrentThread]);

  const loadThread = useCallback((id: string) => {
    // Save current first
    if (messages.length > 0 && activeThreadId && activeThreadId !== id) {
      saveCurrentThread();
    }
    const thread = history.find(t => t.id === id);
    if (thread) {
      setMessages(thread.messages);
      setActiveThreadId(id);
      setShowHistory(false);
    }
  }, [history, messages, activeThreadId, saveCurrentThread]);

  return (
    <MavenChatContext.Provider
      value={{
        open, setOpen,
        messages, setMessages,
        loading, setLoading,
        history, showHistory, setShowHistory,
        startNewChat, loadThread, saveCurrentThread,
        activeThreadId,
      }}
    >
      {children}
    </MavenChatContext.Provider>
  );
}

export function useMavenChat() {
  const ctx = useContext(MavenChatContext);
  if (!ctx) throw new Error("useMavenChat must be used within MavenChatProvider");
  return ctx;
}
