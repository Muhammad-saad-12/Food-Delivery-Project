import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
} from 'lucide-react';
import api from '../../services/api';
import { MenuItemOption } from '../customer/FoodCustomizationModal';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedItems?: MenuItemOption[];
  quickReplies?: string[];
}

interface AIChatWidgetProps {
  onSelectItemForCustomization?: (item: MenuItemOption) => void;
  restaurantId?: string;
}

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({
  onSelectItemForCustomization,
  restaurantId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "👋 Hi! I'm **GourmetBot**, your AI restaurant and menu concierge.\n\nAsk me about dishes, spice levels, dietary choices (vegan, halal, gluten-free), or get chef recommendations!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        'Recommend something spicy 🌶️',
        'Show vegan & gluten-free options 🌱',
        'Chef favorites & bestsellers 🌟',
        'What are the delivery times? ⏱️',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: text,
        restaurantId,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.data.reply || "I found some great options for you!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedItems: response.data.suggestedItems,
        quickReplies: response.data.quickReplies,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I'm temporarily having trouble connecting to the kitchen system. Please try again or browse the categorized menu above!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[90vw] sm:w-[400px] h-[540px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-3"
          >
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    GourmetBot AI
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Menu recommendations & dietary guide
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/60">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-start gap-2 max-w-[85%]">
                    {msg.sender === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none whitespace-pre-line'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Suggested Dish Cards */}
                  {msg.suggestedItems && msg.suggestedItems.length > 0 && (
                    <div className="mt-2.5 space-y-2 w-full max-w-[90%] pl-9">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        Dishes Mentioned:
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.suggestedItems.map((item) => (
                          <div
                            key={item._id}
                            className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 hover:border-slate-700 transition"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="text-xs font-semibold text-white truncate">
                                  {item.name}
                                </h5>
                                <span className="text-[11px] text-emerald-400 font-bold font-mono">
                                  ${item.price.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {onSelectItemForCustomization && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectItemForCustomization(item);
                                  setIsOpen(false);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 text-xs font-medium border border-emerald-500/20 transition shrink-0 flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Add
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Reply Chips */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 pl-9">
                      {msg.quickReplies.map((reply) => (
                        <button
                          key={reply}
                          type="button"
                          onClick={() => handleSendMessage(reply)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-left"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-500 mt-1 px-9 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 focus-within:border-emerald-500 transition">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about dishes, vegan, spice levels..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || loading}
                  className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-30 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative group flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-4 py-3 rounded-2xl font-bold shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition"
      >
        <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
        <span className="text-xs font-bold tracking-tight">AI Concierge</span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
      </button>
    </div>
  );
};
