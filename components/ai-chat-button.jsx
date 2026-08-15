"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatWithAIAdvisor } from "@/actions/ai";

const SUGGESTIONS = [
  "How am I doing on my savings goals?",
  "What was my top spending category?",
  "How can I reduce my monthly expenses?",
];

export function AiChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm Trakex AI — your financial assistant. How can I help you manage your money today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const messageContent = textToSend || input;
    if (!messageContent.trim() || loading) return;

    const userMessage = { role: "user", content: messageContent };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const res = await chatWithAIAdvisor(updatedMessages);
    setLoading(false);

    if (res?.success && res.reply) {
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res?.error || "Sorry, I couldn't process your request right now.",
        },
      ]);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 text-white shadow-xl hover:scale-105 transition-all flex items-center justify-center p-0"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        </Button>
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-full max-w-sm sm:max-w-md h-[500px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          {/* Header */}
          <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-emerald-600 dark:bg-emerald-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-white/20">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">Trakex AI Advisor</p>
                <p className="text-[10px] text-emerald-100 mt-0.5">
                  Powered by Gemini 1.5
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`p-2.5 rounded-xl max-w-[80%] leading-relaxed ${
                    m.role === "user"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-800"
                  }`}
                >
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-zinc-400 text-xs py-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                <span>AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div className="px-3 py-1 flex flex-wrap gap-1 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="text-[10px] bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-full transition-colors text-left"
                  onClick={() => handleSend(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 border-t border-zinc-200 dark:border-zinc-800 flex gap-1.5 bg-white dark:bg-zinc-950"
          >
            <Input
              placeholder="Ask AI about your money..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="text-xs h-9 border-zinc-200 dark:border-zinc-800"
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
              disabled={loading || !input.trim()}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}

export default AiChatButton;
