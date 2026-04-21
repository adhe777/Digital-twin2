import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../utils/api';
import { 
  MessageSquare, 
  X, 
  Zap, 
  Sparkles, 
  Send, 
  BrainCircuit,
  MinusCircle,
  MessageCircle,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MiniTwin from './MiniTwin';

const AI_SERVICE_URL = 'http://127.0.0.1:8600';

const AIAssistant = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'assistant', text: "Hey! I'm your Digital Twin AI. How can I help you optimize your routine today?" }
    ]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [latestLog, setLatestLog] = useState(null);
    const [avatarState, setAvatarState] = useState('neutral');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchLatestLog();
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, isChatLoading]);

    const fetchLatestLog = async () => {
        try {
            const res = await api.get('/routines');
            if (res.data.length > 0) {
                setLatestLog(res.data[0]);
                computeAvatarState(res.data[0]);
            }
        } catch (err) {
            console.error("Error fetching logs for AI context", err);
        }
    };

    const computeAvatarState = (log) => {
        if (!log) {
            setAvatarState('neutral');
            return;
        }

        if (log.sleepHours < 6) {setAvatarState('sleepy'); return;}
        if (log.mood <= 2) {setAvatarState('tired'); return;}
        if (log.productivityScore > 80) {setAvatarState('happy'); return;}
        if (log.workoutEnabled) {setAvatarState('energetic'); return;}
        
        setAvatarState('neutral');
    };

    // Effect for greeting
    useEffect(() => {
        if (isOpen) {
            setAvatarState('waving');
            const timer = setTimeout(() => {
                if (latestLog) computeAvatarState(latestLog);
                else setAvatarState('neutral');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Effect for talking state
    useEffect(() => {
        if (isChatLoading) {
            setAvatarState('talking');
        } else if (!isOpen) {
            // Already handled by isOpen effect or will be handled next time it opens
        } else if (latestLog) {
            computeAvatarState(latestLog);
        }
    }, [isChatLoading]);

    const onSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsChatLoading(true);

        try {
            const res = await axios.post(`${AI_SERVICE_URL}/chat`, {
                message: userMsg,
                data: {
                    sleepHours: latestLog ? latestLog.sleepHours : 8,
                    studyHours: latestLog ? latestLog.studyHours : 0,
                    screenTime: latestLog ? latestLog.screenTime : 0,
                    mood: latestLog ? latestLog.mood : 3,
                    role: user?.role || 'Student'
                }
            });
            setChatHistory(prev => [...prev, { role: 'assistant', text: res.data.response }]);
        } catch (err) {
            console.error("Chat Error:", err);
            setChatHistory(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting to my neural network right now." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const isStudent = user?.role?.toLowerCase() === 'student';

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="glass-card mb-4 w-[380px] sm:w-[420px] max-h-[600px] flex flex-col overflow-hidden pointer-events-auto shadow-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#4F8CFF] to-[#8A6CFF] p-5 text-white flex items-center justify-between shadow-lg relative shrink-0">
                            <Sparkles className="absolute right-4 top-4 w-10 h-10 opacity-10 -rotate-12" />
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black tracking-tight uppercase italic">{isStudent ? 'Twin Dialogue' : 'Executive Reflection'}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest opacity-90">Cognitive Neural Link Active</p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat History */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[350px] max-h-[400px] custom-scrollbar bg-slate-50/50 dark:bg-slate-900/10"
                        >
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-gradient-to-r from-[#4F8CFF] to-[#8A6CFF] text-white rounded-tr-none' 
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isChatLoading && (
                                <div className="flex justify-start items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                        <BrainCircuit className="w-4 h-4 text-indigo-500 animate-pulse" />
                                    </div>
                                    <div className="px-5 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 rounded-tl-none">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 bg-[#4F8CFF] rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-[#4F8CFF] rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-2 h-2 bg-[#4F8CFF] rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                            <form onSubmit={onSendMessage} className="relative group">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Message your digital twin..."
                                    className="w-full pl-5 pr-14 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#4F8CFF] outline-none transition-all shadow-inner text-sm font-medium"
                                />
                                <button 
                                    type="submit"
                                    disabled={isChatLoading || !chatInput.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#4F8CFF] to-[#8A6CFF] text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-[#4F8CFF]/20"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto p-4 rounded-3xl shadow-2xl shadow-[#4F8CFF]/30 text-white transition-all duration-300 flex items-center gap-3 active:scale-90 ${isOpen ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-gradient-to-br from-[#4F8CFF] to-[#8A6CFF]'}`}
            >
                <div className="relative">
                    {isOpen ? (
                        <div className="p-1 bgColor-white dark:bg-slate-900 rounded-full">
                            <MinusCircle className="w-7 h-7" />
                        </div>
                    ) : (
                        <MiniTwin 
                            avatarState={avatarState} 
                            gender={user?.gender || 'Male'} 
                            userRole={user?.role || 'Student'} 
                            className="w-14 h-14 border-2 border-white/40 ring-4 ring-indigo-500/10 shadow-emerald-500/20"
                        />
                    )}
                    {!isOpen && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full animate-pulse z-10" />}
                </div>
                {!isOpen && <span className="font-black text-sm uppercase tracking-widest pr-2 hidden sm:block italic">AI Twin</span>}
            </motion.button>
        </div>
    );
};

export default AIAssistant;
