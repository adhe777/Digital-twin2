import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import AnimatedAssistant from './AnimatedAssistant';
import { X, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';

const FloatingAssistant = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        mood: 3,
        productivity: 70,
        sleep: 7,
        burnoutRisk: 'Low',
        consistency: 'Consistent'
    });
    const [expression, setExpression] = useState('default');
    const [pose, setPose] = useState('default');
    const [message, setMessage] = useState('');
    const [isTalking, setIsTalking] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsTalking(true);
        try {
            const userRes = await api.get('/auth/me');
            setUser(userRes.data);

            const routineRes = await api.get('/routines');
            if (routineRes.data.length > 0) {
                const latest = routineRes.data[0];
                const prod = (latest.studyHours * 10) - (latest.screenTime * 2) + (latest.sleepHours * 2);

                // Consistency check (last 7 days)
                const weekLogs = routineRes.data.slice(0, 7);
                const sleepMean = weekLogs.reduce((a, b) => a + b.sleepHours, 0) / weekLogs.length;
                const sleepVar = weekLogs.reduce((a, b) => a + Math.pow(b.sleepHours - sleepMean, 2), 0) / weekLogs.length;
                const isConsistent = sleepVar < 1.5;

                const newStats = {
                    mood: latest.mood,
                    productivity: prod,
                    sleep: latest.sleepHours,
                    burnoutRisk: prod < 40 ? 'High' : prod < 60 ? 'Medium' : 'Low',
                    consistency: isConsistent ? 'Consistent' : 'Irregular'
                };
                setStats(newStats);
                updateAssistantState(newStats, userRes.data.role);
            }
        } catch (err) {
            console.error("Error fetching assistant data", err);
        } finally {
            // Keep talking for a bit for realism
            setTimeout(() => setIsTalking(false), 1500);
        }
    };
    // ... (omitting intermediate code for brevity as per tool rules, but wait, I must provide contiguous block)

    const updateAssistantState = (s, role) => {
        const isStudent = role?.toLowerCase() === 'student';

        let newExpr = 'default';
        let newPose = 'default';
        let newMsg = '';

        // Priority Logic
        if (s.productivity >= 80) {
            newPose = 'celebration';
            newMsg = isStudent
                ? "Excellent academic momentum! Your focus levels are peak."
                : "Outstanding output today. You're exceeding all KPIs.";
        } else if (s.burnoutRisk === 'High') {
            newPose = 'advisory';
            newExpr = 'concerned';
            newMsg = isStudent
                ? "Your energy levels are critically low. Prioritize rest over extra study."
                : "Burnout risk detected. Recommend shifting to low-intensity tasks.";
        } else if (s.sleep < 6) {
            newExpr = 'concerned';
            newMsg = isStudent
                ? "Sleep deprivation alert. Your cognitive retention will suffer."
                : "Rest deficit noted. Short-term productivity may be compromised.";
        } else if (s.consistency === 'Consistent') {
            newPose = 'celebration';
            newMsg = isStudent
                ? "Great consistency! Your study habit is solidifying."
                : "Strong operational consistency. Keep this sustainable pace.";
        } else {
            newMsg = isStudent
                ? "I'm here to help you optimize your study session."
                : "Ready to assist with your productivity workflow.";
        }

        setExpression(newExpr);
        setPose(newPose);
        setMessage(newMsg);
    };

    if (!isVisible || !user) return null;

    return (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${isMinimized ? 'w-16 h-16' : 'w-72'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-900 overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-600 px-4 py-2 flex items-center justify-between text-white">
                    <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Assistant</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-indigo-500 rounded transition-colors">
                            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-indigo-500 rounded transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <div className="p-4 flex flex-col items-center">
                        <AnimatedAssistant
                            mood={stats.mood}
                            sleep={stats.sleep}
                            productivity={stats.productivity}
                            isTalking={isTalking}
                        />

                        <div className="mt-2 text-center">
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-200 leading-relaxed italic">
                                    "{message}"
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-[10px] text-gray-400 uppercase font-bold">Status</div>
                                <div className={`text-[10px] font-bold ${stats.productivity > 70 ? 'text-green-500' : 'text-orange-500'}`}>
                                    {stats.productivity > 70 ? 'Optimum' : 'Sub-optimal'}
                                </div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-[10px] text-gray-400 uppercase font-bold">Risk</div>
                                <div className={`text-[10px] font-bold ${stats.burnoutRisk === 'Low' ? 'text-green-500' : 'text-red-500'}`}>
                                    {stats.burnoutRisk}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isMinimized && (
                    <button
                        onClick={() => setIsMinimized(false)}
                        className="w-full h-full flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                        <MessageSquare className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default FloatingAssistant;
