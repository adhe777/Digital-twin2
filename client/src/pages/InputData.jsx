import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Save, AlertCircle, Moon, BookOpen, Monitor, Heart, ArrowLeft, CheckCircle, Dumbbell, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSimulatedDate } from '../utils/timeSim';

const InputData = () => {
    const [formData, setFormData] = useState({
        sleepHours: 8,
        studyHours: 4,
        screenTime: 3,
        mood: 3,
        workoutDuration: 1,
        workoutType: 'Mixed',
        workoutIntensity: 'Medium',
        caloriesBurned: 300,
        waterIntake: 2
    });
    const [activeSection, setActiveSection] = useState('habits');
    const [workoutEnabled, setWorkoutEnabled] = useState(false);
    const [fitnessTrackingEnabled, setFitnessTrackingEnabled] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const [habitsAlreadySynced, setHabitsAlreadySynced] = useState(false);
    const [workoutAlreadySynced, setWorkoutAlreadySynced] = useState(false);
    const [lastSyncDate, setLastSyncDate] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, logsRes] = await Promise.all([
                    api.get('/auth/me'),
                    api.get('/routines')
                ]);
                
                setFitnessTrackingEnabled(userRes.data.preferences?.fitnessEnabled || false);
                
                const simDateStr = getSimulatedDate().toDateString();
                const existingLog = logsRes.data.find(log => 
                    new Date(log.date).toDateString() === simDateStr
                );
                
                if (existingLog) {
                    setHabitsAlreadySynced(existingLog.habitsSynced || false);
                    setWorkoutAlreadySynced(existingLog.workoutSynced || false);
                    setLastSyncDate(new Date(existingLog.date).toDateString());
                    
                    const loadedData = {
                        sleepHours: existingLog.sleepHours || 8,
                        studyHours: existingLog.studyHours || 4,
                        screenTime: existingLog.screenTime || 3,
                        mood: existingLog.mood || 3,
                        workoutDuration: existingLog.workoutDuration || 1,
                        workoutType: existingLog.workoutType || 'Mixed',
                        workoutIntensity: existingLog.workoutIntensity || 'Medium',
                        caloriesBurned: existingLog.caloriesBurned || 300,
                        waterIntake: existingLog.waterIntake || 2
                    };
                    
                    setFormData(loadedData);
                    if (existingLog.workoutEnabled) setWorkoutEnabled(true);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };
        fetchData();
    }, []);

    const { sleepHours, studyHours, screenTime, mood, workoutDuration, workoutType, workoutIntensity, caloriesBurned, waterIntake } = formData;

    const onChange = e => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: Number(value) });
    };

    const onSubmit = async e => {
        e.preventDefault();
        setIsSubmitting(true);

        // Determine sync type based on active tab
        const syncType = activeSection === 'habits' ? 'habits' : 'workout';

        try {
            const payload = {
                ...formData,
                workoutEnabled,
                date: getSimulatedDate().toISOString(),
                syncType
            };

            await api.post('/routines', payload);
            
            if (syncType === 'habits') setHabitsAlreadySynced(true);
            if (syncType === 'workout') setWorkoutAlreadySynced(true);

            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-900 shadow-2xl rounded-[24px] pointer-events-auto flex border border-slate-100 dark:border-slate-800 overflow-hidden`}>
                    <div className="flex-1 w-0 p-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="p-3 bg-[#4F8CFF]/10 rounded-2xl">
                                    <CheckCircle className="h-8 w-8 text-[#4F8CFF]" />
                                </div>
                            </div>
                            <div className="ml-5 flex-1">
                                <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                    {syncType === 'habits' ? 'Habits' : 'Workout'} Synced
                                </p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    Reality synchronization complete for this section.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 3000 });

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to sync.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const InputField = ({ label, name, value, icon: Icon, min, max, step, unit, color, disabled }) => (
        <div className={`glass-card p-6 border-l-4 transition-all duration-300 group ${disabled ? 'opacity-50 grayscale-[0.5] pointer-events-none' : 'hover:shadow-2xl'}`} style={{ borderLeftColor: color }}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-transform">
                        <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</h3>
                            {disabled && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                        </div>
                        <p className="text-lg font-black text-slate-900 dark:text-white italic">{disabled ? 'Data Finalized' : 'Daily Sync'}</p>
                    </div>
                </div>
                <div className="text-3xl font-black italic tracking-tighter" style={{ color }}>
                    {value}<span className="text-xs font-bold text-slate-400 ml-1 not-italic uppercase">{unit}</span>
                </div>
            </div>

            {!disabled && (
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
            )}

            <div className="flex justify-between mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-50">
                <span>Min: {min}{unit}</span>
                <span>Max: {max}{unit}</span>
            </div>
        </div>
    );

    const currentSectionSynced = activeSection === 'habits' ? habitsAlreadySynced : workoutAlreadySynced;

    return (
        <div className="max-w-4xl mx-auto pt-28 pb-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 animate-fade-in-up">
                <div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-[#4F8CFF] transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Intelligence
                    </button>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
                        Habit <span className="gradient-text">Synchronization</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium text-lg">Input your daily metrics to refine your behavior twin.</p>
                </div>
                <div className="hidden md:block px-8 py-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-[10px] font-black text-[#4F8CFF] uppercase tracking-[0.2em] mb-1">Last Synched</p>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">{getSimulatedDate().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                {/* Main Toggle (Always Visible) */}
                <div className={`flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all ${workoutAlreadySynced ? 'opacity-70 pointer-events-none' : ''}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl transition-colors ${workoutEnabled ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                            <Dumbbell className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Did you workout today?</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{workoutAlreadySynced ? 'Workout already finalized for today' : 'Toggle to log advanced fitness metrics'}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled={workoutAlreadySynced}
                        onClick={() => {
                            setWorkoutEnabled(!workoutEnabled);
                            if (workoutEnabled) setActiveSection('habits');
                        }}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${workoutEnabled ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${workoutEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Tabs Section (Only if Workout is Enabled) */}
                {workoutEnabled && (
                    <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
                        <button
                            type="button"
                            onClick={() => setActiveSection('habits')}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${activeSection === 'habits' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Daily Habits {habitsAlreadySynced && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveSection('workout')}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${activeSection === 'workout' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Workout Data {workoutAlreadySynced && <CheckCircle className="w-3 h-3 text-orange-500" />}
                        </button>
                    </div>
                )}

                {/* Dynamic Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative min-h-[400px]">
                    {(!workoutEnabled || activeSection === 'habits') && (
                        <>
                            <InputField label="Sleep Duration" name="sleepHours" value={sleepHours} icon={Moon} min={0} max={18} step={0.5} unit="h" color="#6366f1" disabled={habitsAlreadySynced} />
                            <InputField label="Focus Time" name="studyHours" value={studyHours} icon={BookOpen} min={0} max={18} step={0.5} unit="h" color="#10b981" disabled={habitsAlreadySynced} />
                            <InputField label="Screen Exposure" name="screenTime" value={screenTime} icon={Monitor} min={0} max={18} step={0.5} unit="h" color="#f43f5e" disabled={habitsAlreadySynced} />
                            <InputField label="Internal Mood" name="mood" value={mood} icon={Heart} min={1} max={5} step={1} unit="" color="#8b5cf6" disabled={habitsAlreadySynced} />
                        </>
                    )}

                    {workoutEnabled && activeSection === 'workout' && (
                        <>
                            <InputField label="Duration" name="workoutDuration" value={workoutDuration} icon={Dumbbell} min={0.5} max={5} step={0.5} unit="h" color="#f97316" disabled={workoutAlreadySynced} />
                            <InputField label="Calories" name="caloriesBurned" value={caloriesBurned} icon={Heart} min={0} max={2000} step={50} unit="kcal" color="#ef4444" disabled={workoutAlreadySynced} />
                            <InputField label="Water Intake" name="waterIntake" value={waterIntake} icon={Moon} min={0} max={5} step={0.5} unit="L" color="#0ea5e9" disabled={workoutAlreadySynced} />
                            
                            <div className={`glass-card p-6 border-l-4 border-orange-500 animate-in slide-in-from-bottom-4 duration-500 ${workoutAlreadySynced ? 'opacity-50 pointer-events-none' : ''}`}>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Workout Details</h3>
                                
                                <div className="mb-6">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Type</label>
                                    <div className="flex gap-2">
                                        {['Cardio', 'Strength', 'Mixed'].map(type => (
                                            <button 
                                                key={type} 
                                                type="button" 
                                                onClick={() => setFormData({...formData, workoutType: type})} 
                                                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all border ${workoutType === type ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800 shadow-sm' : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100 dark:bg-slate-800/50'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Intensity</label>
                                    <div className="flex gap-2">
                                        {['Low', 'Medium', 'High'].map(intensity => (
                                            <button 
                                                key={intensity} 
                                                type="button" 
                                                onClick={() => setFormData({...formData, workoutIntensity: intensity})} 
                                                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all border ${workoutIntensity === intensity ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800 shadow-sm' : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100 dark:bg-slate-800/50'}`}
                                            >
                                                {intensity}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-col items-center gap-4 pt-10">
                    {currentSectionSynced && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#4F8CFF]/10 text-[#4F8CFF] rounded-full text-xs font-black uppercase tracking-widest animate-in fade-in zoom-in duration-500 border border-[#4F8CFF]/20">
                            <CheckCircle className="w-4 h-4" />
                            {activeSection === 'habits' ? 'Habits' : 'Workout'} Finalized for Today
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting || currentSectionSynced}
                        className={`group relative px-16 py-6 rounded-[32px] flex items-center gap-4 text-lg italic animate-fade-in-up [animation-delay:0.3s] transition-all duration-500 ${currentSectionSynced ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700' : 'btn-primary text-white shadow-xl shadow-indigo-200 dark:shadow-none'}`}
                    >
                        {isSubmitting ? 'Synchronizing Intelligence...' : currentSectionSynced ? (
                            <>
                                <CheckCircle className="w-6 h-6 text-[#4F8CFF]" />
                                <span className="uppercase tracking-[0.1em] font-black">Section Synced</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span className="uppercase tracking-[0.1em] font-black">
                                    Sync {activeSection === 'habits' ? 'Daily Habits' : 'Workout Reality'}
                                </span>
                            </>
                        )}
                    </button>
                    {currentSectionSynced && (
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                            You've already synced this section. Use the <span className="text-[#4F8CFF] italic">Next Day ⚡</span> tool to skip ahead.
                        </p>
                    )}
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
