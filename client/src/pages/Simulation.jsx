import { useState } from 'react';
import axios from 'axios';
import { ArrowRight, RefreshCw, BrainCircuit, Zap, AlertTriangle, TrendingUp, Sparkles, Activity, Target } from 'lucide-react';

const Simulation = () => {
    const [current, setCurrent] = useState({
        sleepHours: 7,
        studyHours: 6,
        screenTime: 4,
        mood: 3
    });

    const [changes, setChanges] = useState({ ...current });
    const [result, setResult] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const handleSliderChange = (e) => {
        setChanges({ ...changes, [e.target.name]: Number(e.target.value) });
    };

    const runSimulation = async () => {
        setIsSimulating(true);
        try {
            const res = await axios.post('http://127.0.0.1:8000/simulate', {
                current,
                changes
            });
            setResult(res.data);
        } catch (err) {
            console.error(err);
            alert('Simulation failed. Target behavioral node unreachable.');
        } finally {
            setTimeout(() => setIsSimulating(false), 800);
        }
    };

    const reset = () => {
        setChanges({ ...current });
        setResult(null);
    }

    const SimInputField = ({ label, name, value, min, max, step, unit, color }) => (
        <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black italic" style={{ color }}>{value}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{unit}</span>
                </div>
            </div>
            <div className="relative group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                <input
                    type="range"
                    name={name}
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={handleSliderChange}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pt-28 pb-12 px-4 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">

            {/* Simulation Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in-up">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-4 py-1.5 bg-[#4F8CFF]/10 text-[#4F8CFF] text-[10px] font-black rounded-full border border-[#4F8CFF]/20 uppercase tracking-widest">
                            Predictive Engine Alpha
                        </span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
                        Behavioral <span className="gradient-text">Simulation</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium text-lg">Model custom routine changes to visualize future performance shifts.</p>
                </div>
                <button
                    onClick={reset}
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#4F8CFF] hover:border-[#4F8CFF] transition-all shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" /> Reset Model
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Control Panel */}
                <div className="lg:col-span-12 xl:col-span-5 glass-card p-10 border-t-[6px] border-[#4F8CFF] flex flex-col animate-fade-in-up [animation-delay:0.1s]">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-[#4F8CFF]/10 rounded-2xl">
                            <Activity className="w-8 h-8 text-[#4F8CFF]" />
                        </div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tight">Parameter <span className="gradient-text">Input</span></h3>
                    </div>

                    <div className="space-y-8 flex-1">
                        <SimInputField label="Sleep Hours" name="sleepHours" value={changes.sleepHours} min={0} max={14} step={0.5} unit="h" color="#6366f1" />
                        <SimInputField label="Study/Work Time" name="studyHours" value={changes.studyHours} min={0} max={18} step={0.5} unit="h" color="#10b981" />
                        <SimInputField label="Screen Exposure" name="screenTime" value={changes.screenTime} min={0} max={18} step={0.5} unit="h" color="#f43f5e" />
                        <SimInputField label="Mood Target" name="mood" value={changes.mood} min={1} max={5} step={1} unit="" color="#8b5cf6" />
                    </div>

                    <button
                        onClick={runSimulation}
                        disabled={isSimulating}
                        className="mt-12 w-full btn-primary py-5 rounded-[24px] flex items-center justify-center gap-4 text-base italic"
                    >
                        {isSimulating ? (
                            <RefreshCw className="w-6 h-6 animate-spin" />
                        ) : (
                            <><ArrowRight className="w-6 h-6" /> Run Projection Engine</>
                        )}
                    </button>
                </div>

                {/* Projection Output */}
                <div className="lg:col-span-7 glass-card p-1 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-slate-900/30">
                    {!result ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
                                <BrainCircuit className="w-12 h-12 text-slate-300" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Awaiting Simulation Parameters</h3>
                            <p className="mt-2 text-xs font-medium text-slate-400">Initialize the engine by adjusting sliders & clicking 'Run Projection'</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                            <div className="bg-gradient-to-r from-[#4F8CFF] to-[#8A6CFF] p-12 text-white relative overflow-hidden">
                                <Sparkles className="absolute right-0 top-0 w-40 h-40 opacity-10 -rotate-12 translate-x-10 -translate-y-10" />
                                <h3 className="text-4xl font-black italic tracking-tight mb-2 uppercase">Model <span className="text-[#E0E7FF] not-italic">Insights</span></h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E0E7FF] opacity-80">Behavioral Prediction Output Alpha</p>
                            </div>

                            <div className="p-10 flex-1 space-y-10">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Projected Focus Score</p>
                                        <div className="flex items-end gap-3 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50">
                                            <span className="text-6xl font-black text-slate-900 dark:text-white leading-none tracking-tighter italic">
                                                {result.new_score}
                                            </span>
                                            <div className="mb-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">PTS</p>
                                                <div className={`flex items-center text-xs font-black ${result.improvement >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    <TrendingUp className={`w-3 h-3 mr-0.5 ${result.improvement < 0 ? 'rotate-180' : ''}`} />
                                                    {result.improvement >= 0 ? '+' : ''}{result.improvement}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Strain Analysis</p>
                                        <div className="h-full flex flex-col justify-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50">
                                            <div className={`text-xl font-black px-4 py-2 rounded-xl text-center uppercase tracking-widest italic ${result.new_risk === 'High' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' :
                                                    result.new_risk === 'Medium' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' :
                                                        'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                }`}>
                                                {result.new_risk} RISK
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Target className="w-3.5 h-3.5 text-indigo-500" />
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projection Summary</h4>
                                    </div>
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 relative group">
                                        <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300 italic">
                                            "Based on the input routine of <span className="font-bold text-slate-900 dark:text-white">{changes.sleepHours}h</span> sleep and <span className="font-bold text-slate-900 dark:text-white">{changes.studyHours}h</span> focus time, the model predicts a <span className="text-indigo-600 font-black">{Math.abs(result.improvement)}% {result.improvement >= 0 ? 'increase' : 'decrease'}</span> in cognitive performance compared to your current baseline."
                                        </p>
                                        <AlertTriangle className="absolute -right-2 -top-2 w-6 h-6 text-amber-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Simulation;
