import { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, AlertTriangle, Zap, Download, CheckCircle, TrendingUp, AlertCircle, BookOpen, Target, Flame, Brain, Clock, Sparkles, PlusCircle } from 'lucide-react';
import AnimatedAssistant from '../components/AnimatedAssistant';

const Dashboard = () => {
    const [logs, setLogs] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [userRole, setUserRole] = useState('Student');
    const [userGender, setUserGender] = useState('Male');
    const [isTalking, setIsTalking] = useState(false);

    const [microGoal, setMicroGoal] = useState(() => {
        const saved = localStorage.getItem('dailyMicroGoal');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.date === new Date().toDateString()) return parsed;
        }
        return { text: '', completed: false, skipped: false, date: new Date().toDateString() };
    });

    const [syllabusProgress, setSyllabusProgress] = useState(() => Number(localStorage.getItem('syllabusProgress')) || 0);

    useEffect(() => {
        fetchUserData();
        fetchLogs();
    }, []);

    useEffect(() => {
        localStorage.setItem('syllabusProgress', syllabusProgress);
    }, [syllabusProgress]);

    useEffect(() => {
        localStorage.setItem('dailyMicroGoal', JSON.stringify(microGoal));
    }, [microGoal]);

    const fetchUserData = async () => {
        try {
            const res = await api.get('/auth/me');
            setUserRole(res.data.role);
            setUserGender(res.data.gender || 'Male');
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
            const res = await axios.post('http://127.0.0.1:8000/analyze', {
                ...latestLog,
                role: userRole
            });
            setAnalysis(res.data);

            const recRes = await axios.post('http://127.0.0.1:8000/recommend', {
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
    const studyStreak = logs.length > 0 ? logs.filter(l => l.studyHours > 0).length : 0; // Simplified streak check

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
        if (consistency === 'Consistent') return isStudent ? "Great consistency! Your study habit is solidifying." : "Strong operational consistency. Keep this sustainable pace.";

        return isStudent ? "I'm here to help you optimize your study session." : "Ready to assist with your productivity workflow.";
    }, [logs, analysis, isStudent]);

    const downloadReport = () => {
        // ... (simplified download logic)
        alert('Downloading your weekly insights...');
    };

    return (
        <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20">
                            {isStudent ? 'STUDENT' : 'PROFESSIONAL'}
                        </span>
                        {isStudent && (
                            <div className="flex items-center gap-1.5 text-orange-500">
                                <Flame className="w-4 h-4 fill-current" />
                                <span className="text-sm font-bold">{studyStreak} Day Streak</span>
                            </div>
                        )}
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        Your <span className="gradient-text">Productivity Twin</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
                        Track your habits. Improve daily.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={downloadReport}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                    <button className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all">
                        <PlusCircle className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Top Row: Quick Stats & Assistant */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Assistant Insight Card */}
                <div className="md:col-span-4 glass-card p-1 overflow-hidden relative group min-h-[320px] flex flex-col">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-20 h-20 text-indigo-500" />
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <AnimatedAssistant
                            mood={logs.length > 0 ? logs[0].mood : 3}
                            sleep={logs.length > 0 ? logs[0].sleepHours : 8}
                            productivity={logs.length > 0 ? Math.max(0, (logs[0].studyHours * 10) - (logs[0].screenTime * 2) + (logs[0].sleepHours * 2)) : 70}
                            isTalking={isTalking}
                            className="scale-110 mb-4"
                        />
                        <div className="text-center mt-6 w-full px-4">
                            <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm relative">
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-50 dark:bg-[#020617] border-t border-l border-indigo-100 dark:border-indigo-500/20 rotate-45" />
                                <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
                                    {isTalking ? 'Analyzing progress...' : 'Twin Insight'}
                                </h3>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 italic leading-relaxed">
                                    "{assistantMessage}"
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50/80 dark:bg-slate-800/80 p-4 border-t border-slate-100 dark:border-slate-700/50 backdrop-blur-md">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Mood Timeline</span>
                            <span className="text-indigo-600">Active</span>
                        </div>
                        <div className="flex justify-between mt-3 px-2">
                            {logs.slice(0, 7).map((log, i) => (
                                <div key={i} className={`w-1.5 h-6 rounded-full ${log.mood >= 4 ? 'bg-indigo-500' : log.mood === 3 ? 'bg-indigo-300' : 'bg-slate-300'} opacity-${100 - (i * 10)}`} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Score Widgets */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Productivity/Focus Score */}
                    <div className="glass-card p-8 flex flex-col justify-between card-hover relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 bg-indigo-500/5 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="flex justify-between items-start z-10">
                            <div>
                                <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">Daily Score</p>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 italic">{isStudent ? 'Focus Score' : 'Performance'}</h3>
                            </div>
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                                <Zap className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                        <div className="mt-8 flex items-end gap-3 z-10">
                            <span className="text-6xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
                                {analysis?.productivity_score || '--'}
                            </span>
                            <div className="mb-2">
                                <p className="text-xs font-bold text-slate-400">PTS</p>
                                <div className="flex items-center text-green-500 text-xs font-black">
                                    <TrendingUp className="w-3 h-3 mr-0.5" /> +5%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Burnout Risk/Readiness */}
                    <div className="glass-card p-8 flex flex-col justify-between card-hover relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 bg-rose-500/5 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="flex justify-between items-start z-10">
                            <div>
                                <p className="text-xs font-black text-rose-500 uppercase tracking-widest mb-1">Stress Level</p>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 italic">{isStudent ? 'Exam Readiness' : 'Burnout Risk'}</h3>
                            </div>
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-2xl">
                                <AlertTriangle className="w-6 h-6 text-rose-600" />
                            </div>
                        </div>
                        <div className="mt-8 z-10">
                            <span className={`text-3xl font-black px-4 py-2 rounded-2xl tracking-tight uppercase ${analysis?.burnout_risk === 'High' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' :
                                analysis?.burnout_risk === 'Medium' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' :
                                    'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                }`}>
                                {analysis?.burnout_risk || 'CALCULATING'}
                            </span>
                        </div>
                    </div>

                    {/* Secondary Row for Student/Pro specific stuff */}
                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="glass-card p-6 flex items-center justify-between card-hover border-l-4 border-indigo-500">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl">
                                    <Target className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Daily Goal</p>
                                    <p className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">{microGoal.text || 'Not Set'}</p>
                                </div>
                            </div>
                            {microGoal.text && <CheckCircle className={`w-5 h-5 ${microGoal.completed ? 'text-green-500' : 'text-slate-300'}`} />}
                        </div>

                        <div className="glass-card p-6 flex items-center justify-between card-hover border-l-4 border-emerald-500">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/40 rounded-2xl">
                                    <Brain className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Progress</p>
                                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">Goal Completion</p>
                                </div>
                            </div>
                            <div className="w-12 h-12 relative flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" opacity="0.1" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${syllabusProgress}, 100`} strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-[10px] font-black text-emerald-600 italic">{syllabusProgress}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Row: Chart & AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Visual Trends */}
                <div className="lg:col-span-7 glass-card p-8 min-h-[450px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Weekly <span className="text-indigo-600 not-italic">Overview</span></h3>
                            <p className="text-xs font-bold text-slate-400">Habits logged over the last 7 days</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-500">
                                <div className="w-2 h-2 rounded-full bg-indigo-500" /> Sleep
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-500">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Study
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="sleep" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorProd)" name="Sleep" />
                                <Area type="monotone" dataKey="study" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorMood)" name="Study" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Insights & Recommendations */}
                <div className="lg:col-span-5 glass-card p-1 overflow-hidden flex flex-col">
                    <div className="bg-indigo-600 p-8 text-white relative h-32 flex items-center shrink-0">
                        <Sparkles className="absolute right-6 top-6 w-12 h-12 opacity-20" />
                        <div>
                            <h3 className="text-2xl font-black italic tracking-tight leading-tight">PERSONALIZED TIPS</h3>
                            <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mt-1 opacity-80">Suggestions from your Twin</p>
                        </div>
                    </div>
                    <div className="p-8 flex-1 overflow-y-auto space-y-6">
                        {recommendations ? (
                            <div className="space-y-4">
                                {recommendations.split('\n').filter(r => r.trim()).map((rec, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                            {i + 1}
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                                            {rec.replace(/^[*-]\s*/, '')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                                <Clock className="w-12 h-12 text-slate-300" />
                                <p className="text-sm font-bold text-slate-400">Analyzing your habits... <br /> Check back after logging more data.</p>
                            </div>
                        )}
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
            </div>
        </div>
    );
};

export default Dashboard;
