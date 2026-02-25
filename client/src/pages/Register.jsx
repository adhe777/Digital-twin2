import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Lock, Mail, User, Activity, ArrowRight, ShieldCheck, GraduationCap, Briefcase, UserCircle } from 'lucide-react';

const Register = ({ setAuth }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Student',
        gender: 'Male'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const { name, email, password, role, gender } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/register', { name, email, password, role, gender });
            localStorage.setItem('token', res.data.token);
            setAuth(true);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed. System capacity reached?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] p-4 pt-24 pb-12">
            <div className="max-w-xl w-full animate-in fade-in zoom-in duration-500">

                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/30 mb-4 items-center justify-center">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        Initialize your <span className="gradient-text">Twin</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Begin your journey into digital behavioral synchronization.
                    </p>
                </div>

                <div className="glass-card p-8 sm:p-12 border-t-4 border-indigo-500">
                    {error && (
                        <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
                        </div>
                    )}

                    <form className="space-y-8" onSubmit={onSubmit}>
                        {/* Core Identity Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Identity</label>
                                    <div className="relative">
                                        <User className="absolute top-1/2 -translate-y-1/2 left-4 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            className="input-modern px-12"
                                            placeholder="Subject Name"
                                            value={name}
                                            onChange={onChange}
                                        />
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Node</label>
                                    <div className="relative">
                                        <Mail className="absolute top-1/2 -translate-y-1/2 left-4 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="input-modern px-12"
                                            placeholder="Subject Email"
                                            value={email}
                                            onChange={onChange}
                                        />
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Access Phrase</label>
                                    <div className="relative">
                                        <Lock className="absolute top-1/2 -translate-y-1/2 left-4 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            className="input-modern px-12"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={onChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Behavioral Configuration Side */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Operational Role</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all ${role === 'Student' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shadow-md transform scale-105' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}>
                                            <input type="radio" name="role" value="Student" checked={role === 'Student'} onChange={onChange} className="sr-only" />
                                            <GraduationCap className="w-6 h-6" />
                                            <span className="text-xs font-black uppercase italic">Student</span>
                                        </label>
                                        <label className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all ${role === 'Professional' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shadow-md transform scale-105' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}>
                                            <input type="radio" name="role" value="Professional" checked={role === 'Professional'} onChange={onChange} className="sr-only" />
                                            <Briefcase className="w-6 h-6" />
                                            <span className="text-xs font-black uppercase italic">Pro</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Biological Profile</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`cursor-pointer border-b-4 p-3 flex items-center justify-center gap-2 transition-all rounded-xl ${gender === 'Male' ? 'border-indigo-600 bg-slate-50 dark:bg-slate-800 text-indigo-600 font-bold' : 'border-transparent text-slate-400 italic font-medium'}`}>
                                            <input type="radio" name="gender" value="Male" checked={gender === 'Male'} onChange={onChange} className="sr-only" />
                                            <UserCircle className="w-4 h-4" /> Male
                                        </label>
                                        <label className={`cursor-pointer border-b-4 p-3 flex items-center justify-center gap-2 transition-all rounded-xl ${gender === 'Female' ? 'border-indigo-600 bg-slate-50 dark:bg-slate-800 text-indigo-600 font-bold' : 'border-transparent text-slate-400 italic font-medium'}`}>
                                            <input type="radio" name="gender" value="Female" checked={gender === 'Female'} onChange={onChange} className="sr-only" />
                                            <UserCircle className="w-4 h-4" /> Female
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 py-5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Creating Twin...' : (
                                <>Initialize System <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center border-t border-slate-100 dark:border-slate-800 pt-8">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                            Already synchronized?{' '}
                            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                Command Center Login
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] opacity-40">
                    Subject verification required upon initialization
                </p>
            </div>
        </div>
    );
};

export default Register;
