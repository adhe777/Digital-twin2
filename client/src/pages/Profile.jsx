import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { User, Mail, Shield, Palette, Settings, CheckCircle, Save, UserCircle, GraduationCap, Briefcase, Key, RefreshCw } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        preferences: { theme: 'light', animations: true, fitnessEnabled: false },
        studentSettings: { preferredStudyTime: 'Morning', studyGoal: 4 },
        professionalSettings: { workHoursPerDay: 8, focusLevel: 'Medium' }
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
            setFormData({
                name: res.data.name,
                gender: res.data.gender,
                preferences: res.data.preferences || { theme: 'light', animations: true, fitnessEnabled: false },
                studentSettings: res.data.studentSettings || { preferredStudyTime: 'Morning', studyGoal: 4 },
                professionalSettings: res.data.professionalSettings || { workHoursPerDay: 8, focusLevel: 'Medium' }
            });
            setLoading(false);
        } catch (err) {
            console.error("Profile Fetch Error:", err);
            toast.error(err.response?.data?.message || 'Failed to load profile');
            setLoading(false);
        }
    };

    const [showFitnessWarning, setShowFitnessWarning] = useState(false);

    const handleFitnessToggle = () => {
        if (formData.preferences.fitnessEnabled) {
            setShowFitnessWarning(true);
        } else {
            setFormData({ ...formData, preferences: { ...formData.preferences, fitnessEnabled: true } });
        }
    };

    const confirmDisableFitness = () => {
        setFormData({ ...formData, preferences: { ...formData.preferences, fitnessEnabled: false } });
        setShowFitnessWarning(false);
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const submissionData = {
                ...formData,
                studentSettings: {
                    ...formData.studentSettings,
                    studyGoal: Number(formData.studentSettings.studyGoal)
                },
                professionalSettings: {
                    ...formData.professionalSettings,
                    workHoursPerDay: Number(formData.professionalSettings.workHoursPerDay)
                }
            };
            await api.put('/auth/profile', submissionData);
            toast.success('Profile Updated Successfully');
            if (formData.preferences.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Update failed');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        try {
            await api.post('/auth/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password Updated');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Please log in again');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
    );

    if (!user) return (
        <div className="max-w-4xl mx-auto pt-32 text-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">Session Expired</h2>
            <p className="text-slate-500 mt-2">Please log in to view your profile.</p>
            <button
                onClick={() => navigate('/login')}
                className="mt-6 btn-primary px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs"
            >
                Log In Again
            </button>
        </div>
    );

    const isStudent = user.role?.toLowerCase() === 'student';

    return (
        <div className="max-w-6xl mx-auto pt-28 pb-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">

            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-10 rounded-[32px] shadow-xl animate-fade-in-up">
                <div className="relative group">
                    <div className="w-40 h-40 bg-gradient-to-br from-[#4F8CFF] to-[#8A6CFF] rounded-[40px] flex items-center justify-center shadow-2xl shadow-[#4F8CFF]/30 transform group-hover:scale-105 transition-all duration-500">
                        <User className="w-20 h-20 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-3 bg-[#22C55E] text-white rounded-2xl shadow-lg border-4 border-white dark:border-slate-900">
                        <Shield className="w-5 h-5" />
                    </div>
                </div>
                <div className="text-center md:text-left flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                            {user.name}
                        </h2>
                        <span className="px-5 py-1.5 bg-[#4F8CFF]/10 text-[#4F8CFF] text-xs font-bold rounded-full border border-[#4F8CFF]/20 self-center">
                            {user.role?.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg italic mb-6">
                        Personalizing your digital twin experience.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <Mail className="w-4 h-4 text-[#4F8CFF]" />
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-[#22C55E]/5 rounded-2xl border border-[#22C55E]/10 shadow-sm">
                            <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                            <span className="text-sm font-bold text-[#22C55E]">Account Verified</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Navigation/Status */}
                <div className="space-y-8 animate-fade-in-up [animation-delay:0.1s]">
                    <div className="glass-card p-2">
                        <button className="w-full flex items-center gap-4 p-5 bg-gradient-to-r from-[#4F8CFF] to-[#8A6CFF] text-white rounded-2xl shadow-lg shadow-[#4F8CFF]/20 font-bold uppercase tracking-[0.1em] text-sm">
                            <Settings className="w-5 h-5" /> Account Settings
                        </button>
                    </div>

                    <div className="glass-card p-8 border-l-[6px] border-[#4F8CFF]">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Activity Metrics</h4>
                        <div className="space-y-5">
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-sm font-semibold text-slate-500">Log History</span>
                                <span className="text-sm font-black text-[#4F8CFF]">30 DAYS</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-sm font-semibold text-slate-500">Consistency</span>
                                <span className="text-sm font-black text-[#22C55E]">94.2%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Main Settings */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Settings */}
                    <section className="glass-card p-10 border-t-[6px] border-[#4F8CFF] animate-fade-in-up [animation-delay:0.2s]">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-[#4F8CFF]/10 rounded-2xl">
                                <UserCircle className="w-8 h-8 text-[#4F8CFF]" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight uppercase">User <span className="gradient-text">Preferences</span></h3>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-modern"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="input-modern"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Palette className="w-3.5 h-3.5" /> App Preferences
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Display Theme</span>
                                        <div className="flex bg-white dark:bg-slate-700 p-1 rounded-xl shadow-inner border border-slate-100 dark:border-slate-600 transition-all">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, preferences: { ...formData.preferences, theme: 'light' } })}
                                                className={`px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all ${formData.preferences.theme === 'light' ? 'bg-[#4F8CFF] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Day
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, preferences: { ...formData.preferences, theme: 'dark' } })}
                                                className={`px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all ${formData.preferences.theme === 'dark' ? 'bg-[#4F8CFF] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Night
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md">
                                        <div>
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 block">Visual Animations</span>
                                            <span className="text-[10px] font-bold text-[#4F8CFF] uppercase tracking-widest">Enhanced Interface Bliss</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, preferences: { ...formData.preferences, animations: !formData.preferences.animations } })}
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${formData.preferences.animations ? 'bg-[#22C55E]' : 'bg-slate-300 dark:bg-slate-700'}`}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${formData.preferences.animations ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 sm:col-span-2 transition-all hover:shadow-md">
                                        <div>
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 block mb-0.5">Physical Fitness Stream</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Toggle daily workout logs & streaks</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleFitnessToggle}
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${formData.preferences.fitnessEnabled ? 'bg-[#F97316]' : 'bg-slate-300 dark:bg-slate-700'}`}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${formData.preferences.fitnessEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Core Behavioral Settings */}
                            <div className="space-y-6 pt-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    {isStudent ? <GraduationCap className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                                    Goal Settings
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {isStudent ? (
                                        <>
                                            <div className="group">
                                                <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest pl-1">Primary Study Time</label>
                                                <select
                                                    value={formData.studentSettings.preferredStudyTime}
                                                    onChange={(e) => setFormData({ ...formData, studentSettings: { ...formData.studentSettings, preferredStudyTime: e.target.value } })}
                                                    className="input-modern"
                                                >
                                                    <option value="Morning">Morning</option>
                                                    <option value="Afternoon">Afternoon</option>
                                                    <option value="Night">Night</option>
                                                </select>
                                            </div>
                                            <div className="group">
                                                <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest pl-1">Daily Study Goal (Hours)</label>
                                                <input
                                                    type="number"
                                                    min="1" max="15"
                                                    value={formData.studentSettings.studyGoal}
                                                    onChange={(e) => setFormData({ ...formData, studentSettings: { ...formData.studentSettings, studyGoal: e.target.value } })}
                                                    className="input-modern"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="group">
                                                <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest pl-1">Work Hours Per Day</label>
                                                <input
                                                    type="number"
                                                    value={formData.professionalSettings.workHoursPerDay}
                                                    onChange={(e) => setFormData({ ...formData, professionalSettings: { ...formData.professionalSettings, workHoursPerDay: e.target.value } })}
                                                    className="input-modern"
                                                />
                                            </div>
                                            <div className="group">
                                                <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest pl-1">Focus Level</label>
                                                <select
                                                    value={formData.professionalSettings.focusLevel}
                                                    onChange={(e) => setFormData({ ...formData, professionalSettings: { ...formData.professionalSettings, focusLevel: e.target.value } })}
                                                    className="input-modern"
                                                >
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="w-full btn-primary py-5 rounded-[24px] flex items-center justify-center gap-4 text-lg">
                                <Save className="w-6 h-6" />
                                <span className="uppercase tracking-[0.2em] font-black">Save Profile Configuration</span>
                            </button>
                        </form>
                    </section>

                    {/* Security Settings */}
                    <section className="glass-card p-10 border-t-[6px] border-[#EF4444] overflow-hidden relative shadow-xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-[#EF4444]">
                            <Key className="w-32 h-32" />
                        </div>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-[#EF4444]/10 rounded-2xl">
                                <Shield className="w-8 h-8 text-[#EF4444]" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight uppercase">Security <span className="text-[#EF4444]">Vault</span></h3>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                    className="input-modern border-rose-100 dark:border-rose-900/20"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="input-modern"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="input-modern"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="px-10 py-4 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-[#EF4444]/20 transition-all active:scale-95">
                                Update Password
                            </button>
                        </form>
                    </section>
                </div>
            </div>

            {/* Fitness Warning Modal */}
            {showFitnessWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-rose-100 dark:border-rose-900/40 animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-rose-500" />
                        </div>
                        <h3 className="text-xl font-black text-center text-slate-900 dark:text-white uppercase italic tracking-tight mb-2">
                            Disable Fitness?
                        </h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center mb-8">
                            Are you sure you want to turn off fitness tracking? Your daily workout options and fitness streak will be hidden from the dashboard.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowFitnessWarning(false)}
                                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest text-[10px] rounded-xl transition-colors"
                            >
                                Keep Enabled
                            </button>
                            <button
                                onClick={confirmDisableFitness}
                                className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-rose-500/20 transition-colors"
                            >
                                Disable
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
