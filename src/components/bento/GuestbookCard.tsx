"use client";

import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { Rocket } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/language-context";
import { cn, trackEvent } from "@/lib/utils";
import { BentoHeader } from "./BentoCommon";

interface Message {
  id?: string;
  content: string;
  created_at: string;
  user_id?: string;
}

export function GuestbookCard() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: 'Awesome portfolio!', created_at: '2024-01-01' },
    { id: '2', content: 'Love the bento design', created_at: '2024-01-01' },
    { id: '3', content: 'Hi from Tokyo!', created_at: '2024-01-01' },
  ]);
  const [inputValue, setInputValue] = useState("");

  // Deduplicate messages for rendering to avoid key collisions
  // Fallback to using content + created_at if id is missing
  const uniqueMessages = messages.filter((msg, index, self) =>
    index === self.findIndex((m) => {
      if (m.id && msg.id) return m.id === msg.id;
      return m.content === msg.content && m.created_at === msg.created_at;
    })
  );

  // Ensure we have enough messages for the scrolling effect by repeating them if necessary
  const displayMessages = [...uniqueMessages];
  // If we have messages but fewer than 5, repeat them to fill the screen
  if (displayMessages.length > 0 && displayMessages.length < 5) {
    while (displayMessages.length < 10) {
      displayMessages.push(...uniqueMessages);
    }
  }
  // Take the first 10 items for the loop
  const finalMessages = displayMessages.slice(0, 10);

  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(124);

  useEffect(() => {
    const client = supabase;
    if (client) {
      const fetchMessages = async () => {
        try {
          const { data, error, count } = await client
            .from('guestbook')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .limit(10);

          if (error) {
            console.warn('Supabase fetch error:', error);
            return;
          }
          if (data) setMessages(data);
          if (count !== null) setTotalCount(count);
        } catch (err) {
          console.warn('Failed to fetch messages:', err);
        }
      };

      fetchMessages();

      // Subscribe to new messages
      const channel = client
        .channel('guestbook')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guestbook' }, (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Deduplicate: check if message with same ID already exists
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [newMessage, ...prev];
          });
          setTotalCount((prev) => prev + 1);
        })
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);
    trackEvent('sign_guestbook', { method: 'form_submit' });

    // Optimistic update
    const tempId = Date.now().toString();
    const newMessage = {
      id: tempId,
      content: inputValue,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [newMessage, ...prev]);
    setTotalCount((prev) => prev + 1);
    setInputValue("");

    const client = supabase;
    if (client) {
      const { data, error } = await client.from('guestbook').insert([{ content: inputValue }]).select().single();
      if (error) {
        console.error('Failed to save message:', error);
        // Revert optimistic update on error
        setMessages((prev) => prev.filter(msg => msg.id !== tempId));
        setTotalCount((prev) => prev - 1);
      } else if (data) {
        // Update the optimistic message with the real ID from DB to ensure key uniqueness stability
        setMessages((prev) => {
          // Check if the real ID already exists (e.g. from real-time subscription)
          const exists = prev.some(msg => msg.id === data.id);
          if (exists) {
            // If it exists, just remove the temporary one
            return prev.filter(msg => msg.id !== tempId);
          }
          // Otherwise, update the temp ID to real ID
          return prev.map(msg => msg.id === tempId ? { ...msg, id: data.id } : msg);
        });
      }
    } else {
      console.warn('Supabase client not initialized. Message will not be saved persistently.');
    }

    setLoading(false);
  };

  return (
    <BentoCard
      colSpan={2}
      rowSpan={1}
      theme="dark"
      className="h-full min-h-[220px] md:min-h-0 flex flex-col justify-between overflow-hidden"
      borderGradient={VERTICAL_BORDER_GRADIENT}
    >
      <BentoHeader
        title={`${t('guestbook.title')} (${totalCount})`}
        className="mb-0"
      />

      {/* Danmaku Area */}
      <div
        className="absolute inset-x-0 top-12 bottom-16 pointer-events-none overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)'
        }}
      >
        <div className="relative w-full h-full">
          {finalMessages.map((msg, i) => (
            <motion.div
              key={`${msg.id || msg.created_at}-${i}`}
              initial={{ x: 0 }}
              animate={{
                x: "-100vw",
              }}
              transition={{
                duration: 15 + (i % 5),
                repeat: Infinity,
                ease: "linear",
                delay: i * 2,
              }}
              style={{
                top: `${(i % 3) * 25}%`,
                left: "100%",
              }}
              className="absolute whitespace-nowrap px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm text-white shadow-sm border border-white/10"
            >
              {msg.content}
            </motion.div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 mt-auto">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('guestbook.placeholder')}
            className="w-full bg-white/5 border border-white/6 rounded-full pl-4 pr-12 h-9 text-xs focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20 text-white/80 backdrop-blur-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "absolute right-0.5 top-0.5 h-[calc(100%-4px)] aspect-square flex items-center justify-center rounded-full transition-all hover:scale-105 disabled:opacity-50 backdrop-blur-md border border-white/10 text-gray-700 shadow-sm",
              inputValue.trim() ? "bg-white/90" : "bg-white/40 hover:bg-white/60"
            )}
          >
            <Rocket className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </BentoCard>
  );
}
