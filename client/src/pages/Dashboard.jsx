import { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, AlertTriangle, Zap, Download, CheckCircle, TrendingUp, AlertCircle, BookOpen, Target, Flame, Brain, Clock, Sparkles, PlusCircle, Trophy, Star, Award, MessageSquare, Heart } from 'lucide-react';
import DigitalTwinBuddy from '../components/DigitalTwinBuddy';

const AI_SERVICE_URL = 'http://127.0.0.1:8000';

const Dashboard = () => {
    const [logs, setLogs] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [userRole, setUserRole] = useState('Student');
    const [userGender, setUserGender] = useState('Male');
    const [isTalking, setIsTalking] = useState(false);
    const [streak, setStreak] = useState(0);
    const [fitnessStreak, setFitnessStreak] = useState(0);
    const [fitnessEnabled, setFitnessEnabled] = useState(false);
    const [xp, setXp] = useState(0);
    const [badges, setBadges] = useState([]);

    const [microGoal, setMicroGoal] = useState(() => {
        const saved = sessionStorage.getItem('dailyMicroGoal');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.date === new Date().toDateString()) return parsed;
        }
        return { text: '', completed: false, skipped: false, date: new Date().toDateString() };
    });

    const [syllabusProgress, setSyllabusProgress] = useState(() => Number(sessionStorage.getItem('syllabusProgress')) || 0);

    useEffect(() => {
        fetchUserData();
        fetchLogs();
    }, []);

    useEffect(() => {
        sessionStorage.setItem('syllabusProgress', syllabusProgress);
    }, [syllabusProgress]);

    useEffect(() => {
        sessionStorage.setItem('dailyMicroGoal', JSON.stringify(microGoal));
    }, [microGoal]);

    const fetchUserData = async () => {
        try {
            const res = await api.get('/auth/me');
            setUserRole(res.data.role);
            setUserGender(res.data.gender || 'Male');
            setStreak(res.data.streak || 0);
            setFitnessStreak(res.data.fitnessStreak || 0);
            setFitnessEnabled(res.data.preferences?.fitnessEnabled || false);
            setXp(res.data.xp || 0);
            setBadges(res.data.badges || []);
        } catch (err) {
            console.error("Error fetching user data", err);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await api.get('/routines');
            setLogs(res.data);
            if (res.data.length > 0) {
                analyzeLatest(res.data[0]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const analyzeLatest = async (latestLog) => {
        setIsTalking(true);
        try {
            const res = await axios.post(`${AI_SERVICE_URL}/analyze`, {
                ...latestLog,
                role: userRole
            });
            setAnalysis(res.data);

            const recRes = await axios.post(`${AI_SERVICE_URL}/recommend`, {
                ...latestLog,
                role: userRole
            });
            setRecommendations(recRes.data.recommendations);
        } catch (err) {
            console.error("AI Service Error:", err);
        } finally {
            setTimeout(() => setIsTalking(false), 2000);
        }
    };

    const chartData = logs.slice(0, 7).reverse().map(log => ({
        date: new Date(log.date).toLocaleDateString(undefined, { weekday: 'short' }),
        productivity: Math.max(0, (log.studyHours * 10) - (log.screenTime * 2) + (log.sleepHours * 2)),
        mood: log.mood,
        sleep: log.sleepHours,
        study: log.studyHours
    }));

    const isStudent = userRole?.toLowerCase() === 'student';

    const assistantMessage = useMemo(() => {
        if (!logs.length) return isStudent ? "I'm here to help you optimize your study session." : "Ready to assist with your productivity workflow.";

        const latest = logs[0];
        const prod = Math.max(0, (latest.studyHours * 10) - (latest.screenTime * 2) + (latest.sleepHours * 2));
        const sleep = latest.sleepHours;
        const burnoutRisk = analysis?.burnout_risk || 'Low';

        const weekLogs = logs.slice(0, 7);
        const sleepMean = weekLogs.reduce((a, b) => a + b.sleepHours, 0) / (weekLogs.length || 1);
        const sleepVar = weekLogs.reduce((a, b) => a + Math.pow(b.sleepHours - sleepMean, 2), 0) / (weekLogs.length || 1);
        const consistency = sleepVar < 1.5 ? 'Consistent' : 'Irregular';

        if (prod >= 80) return isStudent ? "Excellent academic momentum! Your focus levels are peak." : "Outstanding output today. You're exceeding all KPIs.";
        if (burnoutRisk === 'High') return isStudent ? "Your energy levels are critically low. Prioritize rest over extra study." : "Burnout risk detected. Recommend shifting to low-intensity tasks.";
        if (sleep < 6) return isStudent ? "Sleep deprivation alert. Your cognitive retention will suffer." : "Rest deficit noted. Short-term productivity may be compromised.";
        if (fitnessStreak > 3) return "Great consistency! Your fitness routine is improving your focus.";
        if (consistency === 'Consistent') return isStudent ? "Great consistency! Your study habit is solidifying." : "Strong operational consistency. Keep this sustainable pace.";

        return isStudent ? "I'm here to help you optimize your study session." : "Ready to assist with your productivity workflow.";
    }, [logs, analysis, isStudent, fitnessStreak]);

    // Interactive Chat Logic
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'assistant', text: isStudent ? "Hey! Ready to hit the books?" : "System online. Let's maximize your workflow." }
    ]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    const onSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsChatLoading(true);
        setIsTalking(true);

        try {
            const res = await axios.post(`${AI_SERVICE_URL}/chat`, {
                message: userMsg,
                data: {
                    sleepHours: logs.length > 0 ? logs[0].sleepHours : 8,
                    studyHours: logs.length > 0 ? logs[0].studyHours : 0,
                    screenTime: logs.length > 0 ? logs[0].screenTime : 0,
                    mood: logs.length > 0 ? logs[0].mood : 3,
                    role: userRole
                }
            });
            setChatHistory(prev => [...prev, { role: 'assistant', text: res.data.response }]);
        } catch (err) {
            console.error("Chat Error:", err);
            setChatHistory(prev => [...prev, { role: 'assistant', text: "Sorry, I lost my connection for a second." }]);
        } finally {
            setIsChatLoading(false);
            setTimeout(() => setIsTalking(false), 2000);
        }
    };

    const downloadReport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 4));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "daily_habit_report.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 animate-fade-in-up">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-4 py-1.5 bg-[#4F8CFF]/10 text-[#4F8CFF] text-xs font-bold rounded-full border border-[#4F8CFF]/20">
                            {isStudent ? 'STUDENT MODE' : 'EXECUTIVE MODE'}
                        </span>
                        {isStudent && (
                            <div className="flex items-center gap-1.5 text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-900/30">
                                <Flame className="w-4 h-4 fill-current" />
                                <span className="text-sm font-bold">{streak} Day Streak</span>
                            </div>
                        )}
                    </div>
                    <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                        Your <span className="gradient-text">{isStudent ? 'Study' : 'Work'} Companion</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-lg">
                        {isStudent ? 'Visualizing your academic growth' : 'Optimizing your professional performance'}.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={downloadReport}
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-[#4F8CFF] transition-all shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                    <button className="btn-primary p-3 rounded-2xl">
                        <PlusCircle className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Main Content Grid: Responsive 3-4 Column Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                
                {/* AI Digital Twin Section - Large Card */}
                <div className="md:col-span-2 lg:col-span-1 xl:col-span-1 glass-card p-1 overflow-hidden relative group flex flex-col min-h-[500px] animate-fade-in-up [animation-delay:0.1s]">
                    <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                        {/* Soft Glow Background */}
                        <div className="absolute inset-0 character-glow pointer-events-none" />
                        
                        <div className="animate-float relative z-10 w-full flex justify-center">
                            <DigitalTwinBuddy
                                sleepHours={logs.length > 0 ? logs[0].sleepHours : 8}
                                productivityScore={analysis?.productivity_score || 70}
                                focusScore={65}
                                mood={logs.length > 0 ? logs[0].mood : 3}
                                workoutEnabled={logs.length > 0 ? logs[0].workoutEnabled : false}
                                workoutIntensity={logs.length > 0 ? logs[0].workoutIntensity : 'Medium'}
                                studyHours={logs.length > 0 ? logs[0].studyHours : 0}
                                isTalking={isTalking}
                                userRole={userRole}
                                gender={userGender}
                                fitnessStreak={fitnessStreak}
                                goalCompleted={microGoal.completed}
                                className="scale-125 mb-8"
                            />
                        </div>

                        {/* Speech Bubble */}
                        <div className="relative z-20 w-full mt-4 animate-fade-in-up [animation-delay:0.5s]">
                            <div className="bg-gradient-to-br from-[#4F8CFF] to-[#8A6CFF] text-white p-6 rounded-[24px] shadow-xl shadow-[#4F8CFF]/20 relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-4 bg-[#4F8CFF] clip-path-triangle" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', transform: 'rotate(180deg)' }} />
                                <p className="text-base font-bold tracking-tight italic text-center leading-relaxed">
                                    "{assistantMessage}"
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* XP Progress Bar */}
                    <div className="bg-slate-50/50 dark:bg-slate-800/50 p-6 border-t border-slate-100 dark:border-slate-800 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#64748B] flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500 fill-current" /> REFLECTION XP
                            </span>
                            <span className="text-xs font-extrabold text-[#4F8CFF]">{xp % 100}/100</span>
                        </div>
                        <div className="w-full h-3 bg-slate-200/50 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                            <div 
                                className="h-full bg-gradient-to-r from-[#4F8CFF] to-[#8A6CFF] rounded-full transition-all duration-1000" 
                                style={{ width: `${xp % 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Key Insights Grids */}
                <div className="md:col-span-2 lg:col-span-2 xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {/* Performance Score */}
                    <div className="glass-card p-8 flex flex-col justify-between group animate-fade-in-up [animation-delay:0.2s]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-[#4F8CFF] uppercase tracking-widest mb-2">Efficiency Rating</p>
                                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{isStudent ? 'Concentration' : 'Performance'}</h3>
                            </div>
                            <div className="p-3 bg-[#4F8CFF]/10 rounded-2xl">
                                <Zap className="w-8 h-8 text-[#4F8CFF]" />
                            </div>
                        </div>
                        <div className="mt-8 flex items-end gap-3">
                            <span className="text-7xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
                                {analysis?.productivity_score || '--'}
                            </span>
                            <div className="mb-2">
                                <p className="text-xs font-bold text-slate-400">INDEX</p>
                                <div className="flex items-center text-[#22C55E] text-sm font-bold">
                                    <TrendingUp className="w-4 h-4 mr-1" /> +2.4
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stress/Burnout */}
                    <div className="glass-card p-8 flex flex-col justify-between group animate-fade-in-up [animation-delay:0.3s]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-[#EF4444] uppercase tracking-widest mb-2">Cognitive Load</p>
                                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{isStudent ? 'Stress Level' : 'Burnout Risk'}</h3>
                            </div>
                            <div className="p-3 bg-[#EF4444]/10 rounded-2xl">
                                <AlertTriangle className="w-8 h-8 text-[#EF4444]" />
                            </div>
                        </div>
                        <div className="mt-8">
                            <span className={`text-2xl font-extrabold px-6 py-3 rounded-2xl tracking-wide uppercase ${
                                analysis?.burnout_risk === 'High' ? 'bg-[#EF4444] text-white' :
                                analysis?.burnout_risk === 'Medium' ? 'bg-orange-500 text-white' :
                                'bg-[#22C55E] text-white'
                            }`}>
                                {analysis?.burnout_risk || 'ANALYZING'}
                            </span>
                        </div>
                    </div>

                    {/* Goal Progress */}
                    <div className="glass-card sm:col-span-2 xl:col-span-1 p-8 flex flex-col justify-between animate-fade-in-up [animation-delay:0.4s]">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current Mission</p>
                                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                                    {microGoal.text || 'Establish routine'}
                                </h4>
                            </div>
                            <Target className="w-8 h-8 text-slate-300" />
                        </div>
                        <div className="mt-auto">
                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase">
                                <span>Completion</span>
                                <span>{syllabusProgress}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#22C55E] rounded-full transition-all duration-1000" 
                                    style={{ width: `${syllabusProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Desktop Widgets in 4th Column slots */}
                    <div className="glass-card p-6 flex items-center justify-between group animate-fade-in-up [animation-delay:0.5s]">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-2xl">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Sleep Health</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-white">Optimal</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 flex items-center justify-between group animate-fade-in-up [animation-delay:0.6s]">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                                <Brain className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Mental Clarity</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-white">Sharp</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="glass-card p-6 flex items-center justify-between group animate-fade-in-up [animation-delay:0.7s]">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl">
                                <Heart className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Heart Rate</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-white">72 BPM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Grid: Trends & Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">

                {/* Visual Trends - Span 2 on large */}
                <div className="lg:col-span-2 xl:col-span-2 glass-card p-8 min-h-[450px] flex flex-col animate-fade-in-up [animation-delay:0.7s]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight uppercase italic">{isStudent ? 'STUDY' : 'WORK'} <span className="gradient-text not-italic">Trends</span></h3>
                            <p className="text-sm font-bold text-slate-400">Habits analysis over the last 7 days</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <div className="w-3 h-3 rounded-full bg-[#4F8CFF]" /> Sleep
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <div className="w-3 h-3 rounded-full bg-[#22C55E]" /> Productivity
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#4F8CFF" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }} dy={10} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', fontWeight: '700' }}
                                />
                                <Area type="monotone" dataKey="sleep" stroke="#4F8CFF" strokeWidth={3} fillOpacity={1} fill="url(#colorProd)" name="Sleep" />
                                <Area type="monotone" dataKey="study" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" name="Study" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Chat Interface - Column 3 and 4 */}
                <div className="lg:col-span-1 xl:col-span-2 glass-card p-1 overflow-hidden flex flex-col min-h-[450px] animate-fade-in-up [animation-delay:0.8s]">
                    <div className="bg-gradient-to-r from-[#4F8CFF] to-[#8A6CFF] p-6 text-white relative h-28 flex items-center shrink-0">
                        <Sparkles className="absolute right-6 top-6 w-12 h-12 opacity-20" />
                        <div>
                            <h3 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                                <MessageSquare className="w-6 h-6" /> {isStudent ? 'TWIN DIALOGUE' : 'EXECUTIVE REFLECTION'}
                            </h3>
                            <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mt-1 opacity-90">Cognitive Link Active</p>
                        </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col min-h-0 bg-slate-50/30 dark:bg-slate-900/10">
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm font-semibold shadow-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-gradient-to-r from-[#4F8CFF] to-[#8A6CFF] text-white rounded-tr-none' 
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isChatLoading && (
                                <div className="flex justify-start">
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
                        
                        <form onSubmit={onSendMessage} className="relative">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Talk to your digital self..."
                                className="w-full pl-6 pr-14 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#4F8CFF] outline-none transition-all shadow-inner"
                            />
                            <button 
                                type="submit"
                                disabled={isChatLoading || !chatInput.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#4F8CFF] to-[#8A6CFF] text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <Zap className="w-5 h-5 fill-current" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Detailed Intelligence */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 border-b-4 border-indigo-400 card-hover">
                    <div className="flex items-center gap-3 mb-3">
                        <Clock className="w-5 h-5 text-indigo-500" />
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Consistency</h4>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white italic">Sleep Routine</p>
                    <div className="mt-2 text-sm font-bold text-indigo-600 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl inline-block">
                        STEADY
                    </div>
                </div>

                <div className="glass-card p-6 border-b-4 border-emerald-400 card-hover">
                    <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Trend</h4>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white italic">Weekly Progress</p>
                    <div className="mt-2 text-sm font-bold text-emerald-600 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl inline-block">
                        IMPROVING
                    </div>
                </div>

                <div className="glass-card p-6 border-b-4 border-rose-400 card-hover">
                    <div className="flex items-center gap-3 mb-3">
                        <Zap className="w-5 h-5 text-rose-500" />
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Correlation</h4>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white italic">Mood Impact</p>
                    <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase italic leading-tight">Note: High screen time may reduce mood</p>
                </div>

                <div className="glass-card p-6 border-b-4 border-amber-400 card-hover relative group">
                    <div className="absolute right-4 top-4">
                        <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping opacity-20" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Reminder</h4>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white italic">Log Your Habits</p>
                    <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase italic leading-tight">Time to log for today</p>
                </div>

                {/* Fitness Status Card */}
                {fitnessEnabled && (
                    <div className={`glass-card p-6 card-hover relative overflow-hidden border-b-4 ${logs[0]?.workoutEnabled ? 'border-orange-400' : 'border-slate-300'}`}>
                        <div className="absolute -right-3 -top-2 text-5xl opacity-5 select-none transition-all duration-500">
                            {logs[0]?.workoutEnabled ? '🔥' : '🏋️'}
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-lg">{logs[0]?.workoutEnabled ? '💪' : '🏋️'}</span>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Fitness Status</h4>
                        </div>
                        
                        {logs[0]?.workoutEnabled ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <p className="text-xl font-black italic text-orange-500 mb-3 drop-shadow-sm">Active Today</p>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Duration</span>
                                        <span className="font-black text-slate-900 dark:text-white">{logs[0].workoutDuration || '--'} hr</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Type</span>
                                        <span className="font-black text-slate-900 dark:text-white">{logs[0].workoutType || '--'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1"><Flame className="w-3 h-3"/> Streak</span>
                                        <span className="font-black text-orange-500">{fitnessStreak} days</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1"><Zap className="w-3 h-3 text-indigo-500"/> Energy</span>
                                        <span className="font-black text-indigo-500">{logs[0].workoutIntensity || '--'}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 animate-in fade-in duration-500">
                                <p className="text-2xl font-black italic text-slate-400 dark:text-slate-500 mb-2 leading-tight">No workout<br/>today</p>
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Try a short session 💪</p>
                                
                                {/* Keep Badges visible even if inactive to motivate them */}
                                <div className="flex flex-wrap gap-1 mt-4">
                                    {['Fitness Starter', 'Active Performer', 'Fitness Master'].map(b => (
                                        <span key={b} className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-tight rounded-full border ${
                                            badges.includes(b)
                                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-700 opacity-40'
                                        }`}>
                                            {b === 'Fitness Starter' ? '🥉' : b === 'Active Performer' ? '🥈' : '🥇'} {b}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
