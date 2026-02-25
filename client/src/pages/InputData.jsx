import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Save, AlertCircle, Moon, BookOpen, Monitor, Heart, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const InputData = () => {
    const [formData, setFormData] = useState({
        sleepHours: 8,
        studyHours: 4,
        screenTime: 3,
        mood: 3
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const { sleepHours, studyHours, screenTime, mood } = formData;

    const onChange = e => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: Number(value) });
    };

    const onSubmit = async e => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await api.post('/routines', {
                sleepHours: Number(sleepHours),
                studyHours: Number(studyHours),
                screenTime: Number(screenTime),
                mood: Number(mood)
            });
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-indigo-500`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <CheckCircle className="h-10 w-10 text-indigo-500" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Sync Successful</p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">Your twin has been updated with today's reality.</p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 3000 });

            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to sync with Digital Twin.';
            toast.error(msg);
            if (err.response?.status === 401) {
                setTimeout(() => navigate('/login'), 2000);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const InputField = ({ label, name, value, icon: Icon, min, max, step, unit, color }) => (
        <div className="glass-card p-6 border-l-4 transition-all duration-300 hover:shadow-2xl group" style={{ borderLeftColor: color }}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</h3>
                        <p className="text-lg font-black text-slate-900 dark:text-white italic">Daily Sync</p>
                    </div>
                </div>
                <div className="text-3xl font-black italic tracking-tighter" style={{ color }}>
                    {value}<span className="text-xs font-bold text-slate-400 ml-1 not-italic uppercase">{unit}</span>
                </div>
            </div>

            <input
                type="range"
                name={name}
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                style={{ '--accent-color': color }}
            />

            <div className="flex justify-between mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-50">
                <span>Min: {min}{unit}</span>
                <span>Max: {max}{unit}</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pt-28 pb-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Intelligence
                    </button>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
                        Habit <span className="text-indigo-600 not-italic">Synchronization</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Input your daily metrics to refine your behavior twin.</p>
                </div>
                <div className="hidden md:block px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Last Synched</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="Sleep Duration"
                        name="sleepHours"
                        value={sleepHours}
                        icon={Moon}
                        min={0} max={18} step={0.5}
                        unit="h"
                        color="#6366f1"
                    />
                    <InputField
                        label="Focus Time"
                        name="studyHours"
                        value={studyHours}
                        icon={BookOpen}
                        min={0} max={18} step={0.5}
                        unit="h"
                        color="#10b981"
                    />
                    <InputField
                        label="Screen Exposure"
                        name="screenTime"
                        value={screenTime}
                        icon={Monitor}
                        min={0} max={18} step={0.5}
                        unit="h"
                        color="#f43f5e"
                    />
                    <InputField
                        label="Internal Mood"
                        name="mood"
                        value={mood}
                        icon={Heart}
                        min={1} max={5} step={1}
                        unit=""
                        color="#8b5cf6"
                    />
                </div>

                <div className="flex justify-center pt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] text-sm rounded-[2rem] shadow-2xl shadow-indigo-500/40 transform active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                    >
                        {isSubmitting ? 'Synchronizing...' : (
                            <>
                                <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                Save Logic State
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-12 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-40">
                    Behavioral Data Privacy Guaranteed &bull; End-to-End Encryption
                </p>
            </div>
        </div>
    );
};

export default InputData;
