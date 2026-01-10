import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

interface Message {
    role: 'user' | 'model';
    content: string;
}

const ChatPage = () => {
    const { user, token } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const config = {
                    headers: { 'x-auth-token': token }
                };
                const res = await api.get('/api/chat', config);
                if (res.data && res.data.length > 0) {
                    setMessages(res.data);
                } else {
                    setMessages([
                        { role: 'model', content: `Hello ${user?.name?.split(' ')[0] || ''}! I am your MCD Personal Assistant. How can I help you with your attendance, payroll, or grievances today?` }
                    ]);
                }
            } catch (err) {
                console.error("Failed to load history", err);
            }
        };
        fetchHistory();
    }, [token, user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            };

            const res = await api.post('/api/chat', {
                message: userMsg.content,
                // history is now managed by the backend
            }, config);

            const botMsg: Message = { role: 'model', content: res.data.reply };
            setMessages(prev => [...prev, botMsg]);

        } catch (err) {
            console.error("Chat Error", err);
            setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="MCD Assistant">
            <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
                {/* Chat Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white dark:bg-surface-dark rounded-t-2xl shadow-sm border border-border-light dark:border-border-dark">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="size-8 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-3 self-end mb-1">
                                    <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                                </div>
                            )}
                            <div className={`max-w-[85%] rounded-2xl p-4 text-sm sm:text-base leading-relaxed ${msg.role === 'user'
                                ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/20'
                                : 'bg-gray-100 dark:bg-black/20 text-gray-800 dark:text-gray-200 rounded-tl-none border border-transparent dark:border-white/5'
                                }`}>
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                            {msg.role === 'user' && (
                                <div className="size-8 flex items-center justify-center rounded-full bg-primary text-white ml-3 self-end mb-1 shadow-md shadow-primary/30">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="size-8 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-3 self-end mb-1">
                                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                            </div>
                            <div className="bg-gray-100 dark:bg-black/20 border border-transparent dark:border-white/5 rounded-2xl rounded-tl-none p-4 shadow-sm">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-surface-dark border-t border-border-light dark:border-border-dark rounded-b-2xl shadow-sm border-x border-b">
                    <form onSubmit={handleSend} className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your payroll, attendance, or grievances..."
                            className="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-5 py-4 text-base focus:ring-2 focus:ring-primary/50 focus:border-transparent text-text-main dark:text-white dark:placeholder:text-gray-500 transition-all"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="p-4 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-[24px]">send</span>
                        </button>
                    </form>
                    <p className="text-[11px] text-center text-text-muted mt-3">
                        AI can make mistakes. Please verify important info.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ChatPage;
