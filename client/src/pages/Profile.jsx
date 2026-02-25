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
        preferences: { theme: 'light', animations: true },
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
                preferences: res.data.preferences || { theme: 'light', animations: true },
                studentSettings: res.data.studentSettings || { preferredStudyTime: 'Morning', studyGoal: 4 },
                professionalSettings: res.data.professionalSettings || { workHoursPerDay: 8, focusLevel: 'Medium' }
            });
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load profile');
            setLoading(false);
        }
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
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="relative group">
                    <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 transform group-hover:rotate-6 transition-transform">
                        <User className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 text-white rounded-xl shadow-lg">
                        <Shield className="w-4 h-4" />
                    </div>
                </div>
                <div className="text-center md:text-left flex-1">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
                        {user.name}'s <span className="text-indigo-600 not-italic">Profile</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm mt-1">
                        {user.role} &bull; Verified Account
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                        <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" /> {user.email}
                        </span>
                        <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 border border-indigo-100 dark:border-indigo-800/50">
                            <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Navigation/Status */}
                <div className="space-y-6">
                    <div className="glass-card p-2">
                        <button className="w-full flex items-center gap-3 p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20 font-black uppercase tracking-widest text-xs italic">
                            <Settings className="w-4 h-4" /> Settings
                        </button>
                    </div>

                    <div className="glass-card p-6 border-l-4 border-indigo-500">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Activity History</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                <span className="text-xs font-bold text-slate-500">Logged Habits</span>
                                <span className="text-xs font-black text-indigo-600">30 DAYS</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                <span className="text-xs font-bold text-slate-500">Consistency Score</span>
                                <span className="text-xs font-black text-emerald-600">94.2%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Main Settings */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Settings */}
                    <section className="glass-card p-8 border-t-4 border-indigo-500">
                        <div className="flex items-center gap-3 mb-8">
                            <UserCircle className="w-6 h-6 text-indigo-500" />
                            <h3 className="text-xl font-black italic tracking-tight uppercase">Profile <span className="text-indigo-600 not-italic">Settings</span></h3>
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
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Theme</span>
                                        <div className="flex bg-white dark:bg-slate-700 p-1 rounded-xl shadow-inner">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, preferences: { ...formData.preferences, theme: 'light' } })}
                                                className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${formData.preferences.theme === 'light' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                                            >
                                                Day
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, preferences: { ...formData.preferences, theme: 'dark' } })}
                                                className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${formData.preferences.theme === 'dark' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                                            >
                                                Night
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Animations</span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, preferences: { ...formData.preferences, animations: !formData.preferences.animations } })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${formData.preferences.animations ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.preferences.animations ? 'translate-x-6' : 'translate-x-1'}`} />
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

                            <button type="submit" className="w-full btn-primary py-4 rounded-3xl flex items-center justify-center gap-3">
                                <Save className="w-5 h-5" />
                                <span className="uppercase tracking-[0.2em] font-black text-sm italic">Save Changes</span>
                            </button>
                        </form>
                    </section>

                    {/* Security Overhaul */}
                    <section className="glass-card p-8 border-t-4 border-rose-500 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Key className="w-32 h-32" />
                        </div>
                        <div className="flex items-center gap-3 mb-8">
                            <Shield className="w-6 h-6 text-rose-500" />
                            <h3 className="text-xl font-black italic tracking-tight uppercase">Password <span className="text-rose-500 not-italic">Settings</span></h3>
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
                            <button type="submit" className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] italic rounded-2xl shadow-lg shadow-rose-500/20 transition-all active:scale-95">
                                Update Password
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Profile;
