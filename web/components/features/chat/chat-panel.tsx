"use client";

import { useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading?: boolean;
}

function TypingIndicator() {
  const reduced = useReducedMotion();

  if (reduced) return <span className="text-xs text-muted-foreground">Typing…</span>;

  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground/60"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function ChatPanel({
  isOpen,
  onToggle,
  messages,
  input,
  onInputChange,
  onSend,
  isLoading = false,
}: ChatPanelProps) {
  const reduced = useReducedMotion();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? "Close chat" : "Open AI Advisor chat"}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "flex size-14 items-center justify-center rounded-full",
          "bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]",
          "text-white shadow-xl shadow-primary/30",
          "hover:shadow-primary/50 transition-shadow duration-300",
          !isOpen && "pulse-ring"
        )}
        whileHover={reduced ? undefined : { scale: 1.05 }}
        whileTap={reduced ? undefined : { scale: 0.95 }}
        animate={isOpen ? { rotate: 0 } : { rotate: 0 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="size-5" aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="size-5" aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)]"
          >
            <GlassCard className="flex flex-col overflow-hidden shadow-xl shadow-black/40" style={{ height: 520 }}>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/20">
                    <MessageCircle className="size-4 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">EducAI Advisor</p>
                    <p className="text-xs text-emerald-400">Online · Profile-aware</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggle}
                  aria-label="Close chat"
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                    <MessageCircle className="size-8 text-muted-foreground/30" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">Ask me anything about your application journey</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-white/[0.06] text-foreground rounded-bl-sm border border-white/[0.06]"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/[0.06] border border-white/[0.06] rounded-2xl rounded-bl-sm">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/[0.06] p-3">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about programs, scholarships, visas…"
                    rows={1}
                    className="flex-1 resize-none rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all"
                    style={{ minHeight: 38, maxHeight: 120 }}
                    aria-label="Message input"
                  />
                  <button
                    type="button"
                    onClick={onSend}
                    disabled={!input.trim() || isLoading}
                    aria-label="Send message"
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-colors"
                  >
                    <Send className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
